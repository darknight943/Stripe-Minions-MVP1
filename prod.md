# Production Deployment on Vercel

This guide provides detailed instructions for deploying the Stripe Minions MVP1 application to Vercel.

## Prerequisites

Before you begin, ensure you have the following:

*   **Vercel Account:** A free or paid Vercel account.
*   **Vercel CLI (Optional but Recommended):** Installed globally on your machine. You can install it using npm:
    ```bash
    npm install -g vercel
    ```
*   **GitHub Repository:** Your application code pushed to a GitHub repository.

## Deployment Steps

### 1. Link Your Project to Vercel

If you haven't already, link your local project to Vercel. Navigate to your project's root directory in your terminal and run:

```bash
vercel link
```

Follow the prompts to link your project to your Vercel account and a new or existing Vercel project.

### 2. Environment Variables

Vercel automatically detects and uses environment variables defined in your project settings. For a Next.js application, you'll likely need to set up environment variables for your Stripe API keys and potentially other configurations.

1.  **Go to your Vercel Dashboard:** Open your web browser and navigate to [vercel.com/dashboard](https://vercel.com/dashboard).
2.  **Select your Project:** Choose the project you want to configure.
3.  **Go to "Settings" -> "Environment Variables":** Here, you can add your production environment variables.

    **Example Environment Variables (adjust as per your application's needs):**

    *   `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Your Stripe Publishable Key (for client-side).
    *   `STRIPE_SECRET_KEY`: Your Stripe Secret Key (for server-side API routes).
    *   `NEXTAUTH_SECRET`: A random string used to sign and encrypt the NextAuth.js session token. Generate a strong, random string for this.
    *   `GITHUB_ID`: Your GitHub OAuth App Client ID (if using GitHub authentication).
    *   `GITHUB_SECRET`: Your GitHub OAuth App Client Secret (if using GitHub authentication).

    **Important:** Ensure that sensitive keys like `STRIPE_SECRET_KEY` and `NEXTAUTH_SECRET` are marked as "Secret" in Vercel.

### 3. Build and Deployment Settings

Vercel typically auto-configures Next.js projects. However, you can review and adjust these settings if needed:

1.  **Go to your Vercel Dashboard:** Select your project.
2.  **Go to "Settings" -> "Git":** Ensure your Git repository is correctly connected.
3.  **Go to "Settings" -> "General":**
    *   **Framework Preset:** Should be set to "Next.js".
    *   **Build Command:** Vercel usually detects `next build`. If not, set it to `next build`.
    *   **Output Directory:** Vercel usually detects `.next`. If not, set it to `.next`.
    *   **Install Command:** Vercel usually detects `npm install` or `yarn install`.

### 4. Deploying Your Application

#### A. Deploying via Git (Recommended)

The most common and recommended way to deploy to Vercel is by connecting your GitHub repository. Every push to the connected branch (e.g., `main` or `master`) will automatically trigger a new deployment.

1.  **Connect Git Repository:** In your Vercel project settings, under "Git", ensure your GitHub repository is connected.
2.  **Push to Branch:** Push your latest code to the connected branch. Vercel will automatically start a new deployment.

#### B. Deploying via Vercel CLI

You can also deploy directly from your terminal using the Vercel CLI:

```bash
vercel --prod
```

This command will deploy your current project to production.

### 5. Custom Domains (Optional)

To use a custom domain for your application:

1.  **Go to your Vercel Dashboard:** Select your project.
2.  **Go to "Settings" -> "Domains":**
3.  **Add your Domain:** Enter your custom domain and follow the instructions to configure your DNS records (A record, CNAME record, etc.) with your domain registrar.

### 6. Monitoring and Logs

Vercel provides excellent tools for monitoring your deployments and viewing logs:

*   **Deployments Tab:** View the status of all your deployments, including build logs and preview URLs.
*   **Logs Tab:** Access real-time logs from your serverless functions (API routes) and other parts of your application.

### 7. Troubleshooting

*   **Build Failures:** Check the build logs in the Vercel dashboard for error messages. Common issues include missing environment variables, syntax errors, or incorrect dependencies.
*   **Runtime Errors:** Check the function logs for errors occurring after a successful build.
*   **Environment Variables:** Double-check that all necessary environment variables are correctly set in your Vercel project settings for the production environment.

This `prod.md` file should provide a comprehensive guide for deploying the application on Vercel.
