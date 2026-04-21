/// <reference types="next" />
import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Upstash Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

// Create a new ratelimiter, allowing 5 requests per 1 hour by a single IP. The IP is taken from the incoming request. 
const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, "1h"),
  analytics: true,
});

const feedbackSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  rating: z.coerce.number().min(1).max(5, { message: "Rating must be between 1 and 5." }),
  category: z.enum(["Bug", "Feature Request", "General Feedback", "Other"], { message: "Please select a valid category." }),
  message: z.string().min(1, { message: "Message cannot be empty." }).max(500, { message: "Message cannot exceed 500 characters." }),
});

export async function POST(req: NextRequest) {
  // Rate limiting based on IP address
  const ipIdentifier = req.ip ?? "127.0.0.1"; // Fallback for localhost
  const { success } = await ratelimit.limit(ipIdentifier);

  if (!success) {
    return new NextResponse("Too many requests. Please try again later.", { status: 429 });
  }

  try {
    const body = await req.json();
    const validatedData = feedbackSchema.parse(body);

    // In a real application, you would store this in a database
    // or send it to an external service like SendGrid/Airtable.
    console.log("Feedback received:", validatedData);

    // Simulate database storage
    await new Promise((resolve) => setTimeout(resolve, 500));

    return NextResponse.json({ message: "Feedback submitted successfully!" }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors[0].message }, { status: 400 });
    }
    console.error("Feedback API error:", error);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}
