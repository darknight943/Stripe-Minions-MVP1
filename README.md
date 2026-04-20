# GitMinion

GitMinion is an open-source, deterministic-first autonomous coding agent, inspired by Stripe's internal Minions architecture. 

Autonomous agents typically suffer from non-deterministic sprawling and unpredictable state management. GitMinion solves this through a controlled state-machine architecture based heavily on a core premise: **The model doesn’t run the system. The system runs the model.**

## Architecture Overview

Instead of delegating control flow to an LLM loop, GitMinion uses a strict **Blueprint Pattern**. The orchestrator strictly alternates between discrete **Deterministic** guardrail nodes and isolated **Agentic** nodes.

```text
                 [ Slack / CLI Trigger ]
                            │
               ┌────────────▼───────────┐
               │  Deterministic Context │
               │   Prefetch (Octokit)   │
               └────────────┬───────────┘
                            │
               ┌────────────▼───────────┐
               │    Deterministic MCP   │
               │     Tool Selection     │
               └────────────┬───────────┘
                            │
               ┌────────────▼───────────┐
               │    E2B Sandbox Spawn   │
               │   (Network Isolated)   │
               └────────────┬───────────┘
                            │
  ┌─────────────────────────▼──────────────────────────┐
  │                                                    │
  │                  AGENTIC LOOP                      │
  │    (Anthropic/Gemini/Groq -> MCP Tool Usage)       │
  │                                                    │
  └─────────────────────────┬──────────────────────────┘
                            │
          ┌─────────────────▼────────────────┐◄────────┐
          │                                  │         │
          │     Deterministic Fast Lint      │      Retry
          │         (<5s timeout)            │      Loop
          │                                  │    (Max 2x)
          └─────────────────┬────────────────┘         │
                            │                          │
          ┌─────────────────▼────────────────┐         │
          │                                  │         │
          │   Deterministic Test Execution   ├─────────┘
          │          (Sandbox Jest)          │
          │                                  │
          └─────────────────┬────────────────┘
                            │
               ┌────────────▼───────────┐
               │  Deterministic PR Gen  │
               │  (Octokit + Exit Gate) │
               └────────────────────────┘
```

By ensuring that context prefetch, tool constraint assignment, AST linting, and final formatting are all fully deterministic and executed prior to or after LLM activation, GitMinion severely constrains the failure planes typical of autonomous coders. The LLM wakes up with surgical context instead of a raw issue, executing mapped tool scopes in an isolated environment. 

### The Blueprint

| Stage | Type | Responsibility |
|-------|------|----------------|
| **Entry** | Deterministic | Normalizes pipeline trigger signals and issues the Run Trace. |
| **Context** | Deterministic | Regex-based deterministic payload scanning. Prefetches target issue properties and resolves file footprints via GitHub API search. |
| **MCP Server** | Deterministic | Assembles tool boundaries via Model Context Protocol and Zod shape validation explicitly tailored to the context phase's findings. |
| **Sandbox** | Deterministic | Instantiates the isolated runtime environment via E2B. |
| **Agent** | **Agentic** | The isolated execution loop. Translates assigned MCP capabilities to actionable operations against the sandbox filesystem. |
| **Lint** | Deterministic | Emits immediate feedback for the agent (bypassing full test cycles for syntax errors). |
| **Test** | Deterministic | Isolated test runner evaluating the generated sandbox delta. Fails tests loop back to the agent up to the predefined `retryBudget` (default 2). |
| **PR Create** | Deterministic | Destroys sandbox artifacts, exits the blueprint, and opens a verifiable Pull Request via Octokit. |

## Feature Degradation & Mask-off Pattern

Hard crashes in asynchronous workers are expensive. GitMinion utilizes the **Mask-off Pattern**, executing every stage through an abstract `FeatureModule` base class.

If upstream services fail or configurations are disabled, the system natively swallows the crash and logs a warning, calling `mask()` rather than throwing an error. The stage injects a degraded context shape into the pipeline array, forcing subsequent nodes to operate without crashing.

| Feature Stage | Execution Behavior | Masked Fallback Behavior | Exit Gate |
|---------------|--------------------|--------------------------|-----------|
| `SlackEntry` | Emits trigger payload | Yields `source: 'degraded'` dummy target payload. | ❌ No |
| `LintRunner` | Native TS compilation | Injects `{ lintPassed: true, timeout: true }` proxying straight to tests. | ❌ No |
| `TestRunner` | Native Jest/Vitest eval | Injects `{ testsPassed: false }` bouncing back to LLM for human-readable fallback log. | ❌ No |
| `PRCreator` | Constructs PR & Branch | Throws hard `PipelineError` halting the system to prevent dangling modifications. | ✅ Yes |

## Architecture-Enforced Security

We don't rely on "System Prompt rules" for security. Isolation *is* the permission system.

1. **E2B Isolation:** Code edits and terminal executions run inside an ephemeral E2B MicroVM, protecting local host infrastructure from uncontrolled model evaluation.
2. **K8s Network Policies:** Run runners exist via dynamic Pods spawned by BullMQ. The system isolates agents at the network level by strictly denying all IP egress except for explicit Ports (53 DNS/443 E2B and GitHub). A compromised model loop simply cannot ping arbitrary web endpoints.
3. **MCP Tool Verification:** MCP tools are injected securely with exact boundaries. `sandbox_run_command` forces string validation against networking tools (`wget`, `nc`, `curl`) and wildcard system deletions (`rm -rf /`). Similarly, `github_read_file` statically blocks directory traversal upstream of the LLM.

## Kubernetes Execution (`k8s/`)

Because autonomous agents frequently enter infinite execution environments or exhaust memory evaluating complex AST responses, handling this natively on the NodeJS event loop triggers cascading API failures.

When `stripe-minions` triggers, a BullMQ queue spins off a discrete `@kubernetes/client-node` dynamic manifest natively spawning an independent `batch/v1 Job` targeting a bounded resource limit (512Mi/500m) and 15 minute TTL. If an agent loops for 16 minutes, the cluster reaps the pod automatically, and the dead-letter queue maps the failure to Slack.

## Quick Start (First PR in 5 mins)

**1. Setup Environment**  
```bash
git clone https://github.com/darknight943/Stripe-Minions-MVP.git
cd Stripe-Minions-MVP
npm install
cp .env.example .env # Add your fine-grained GitHub PAT & LLM / E2B tokens
```

**2. Typecheck & Verify**  
```bash
npm run typecheck
```

**3. Run Direct Agent**  
Trigger GitMinion in direct CLI mode targeting an existing GitHub issue:
```bash
npx tsx src/index.ts --mode=direct \
  --repo=owner/target-repo \
  --task="https://github.com/owner/target-repo/issues/1"
```

## Why GitMinion vs "Asking Claude"

Telling a local script to `"Take this issue and run tools on my system until it's fixed"` grants unbounded time and unbounded access.

GitMinion specifically builds rails around the model. Rather than forcing the LLM to learn the repository file structure sequentially (consuming context and time), GitMinion deterministically assembles files based on regex-extracted issue mentions via GitHub code search, delivering the model a pre-filtered context array block *before* prompt 1 starts. Following edits, GitMinion detaches the LLM to run deterministic assertions locally. If the test passes, it cuts a PR. If it fails, it provides the LLM the exact stack trace—completely automating the painful review-fail-edit cycle.

## Recent Security Incidents

### Vercel Breach

Recently, Vercel experienced a security incident. For more details, please refer to [this article](https://www.bleepingcomputer.com/news/security/vercel-discloses-security-incident-after-employee-account-compromise/).
