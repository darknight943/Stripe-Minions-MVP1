
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

const feedbackFormSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  rating: z.coerce.number().min(1).max(5, { message: "Rating must be between 1 and 5." }),
  category: z.enum(["Bug", "Feature Request", "General Feedback", "Other"], { message: "Please select a valid category." }),
  message: z.string().min(1, { message: "Message cannot be empty." }).max(500, { message: "Message cannot exceed 500 characters." }),
});

type FeedbackFormValues = z.infer<typeof feedbackFormSchema>;

interface FeedbackFormProps {
  onSuccess: () => void;
}

export function FeedbackForm({ onSuccess }: FeedbackFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      email: "",
      rating: 5,
      category: "General Feedback",
      message: "",
    },
  });

  async function onSubmit(values: FeedbackFormValues) {
    setIsLoading(true);
    try {
      const lastSubmission = localStorage.getItem("lastFeedbackSubmission");
      const now = new Date().getTime();

      if (lastSubmission) {
        const lastSubmissionTime = parseInt(lastSubmission, 10);
        const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

        if (now - lastSubmissionTime < oneHour) {
          toast.error("Please wait an hour before submitting feedback again.");
          setIsLoading(false);
          return;
        }
      }

      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        toast.success("Feedback submitted successfully!");
        localStorage.setItem("lastFeedbackSubmission", now.toString());
        form.reset();
        onSuccess();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to submit feedback.");
      }
    } catch (error) {
      console.error("Feedback submission error:", error);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="your@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rating (1-5)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="5" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Bug">Bug</SelectItem>
                  <SelectItem value="Feature Request">Feature Request</SelectItem>
                  <SelectItem value="General Feedback">General Feedback</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea placeholder="Your feedback message" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Submitting..." : "Submit Feedback"}
        </Button>
      </form>
    </Form>
  );
}
