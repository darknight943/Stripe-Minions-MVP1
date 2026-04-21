"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useState } from "react";

const feedbackFormSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  rating: z.coerce.number().int().min(1).max(5, { message: "Rating must be between 1 and 5." }),
  category: z.enum(["Bug", "Feature Request", "General Feedback", "Other"], {
    message: "Please select a valid category.",
  }),
  message: z
    .string()
    .min(1, { message: "Message cannot be empty." })
    .max(500, { message: "Message cannot exceed 500 characters." }),
});

type FeedbackFormValues = z.infer<typeof feedbackFormSchema>;

interface FeedbackFormProps {
  onSubmissionSuccess: () => void;
}

export function FeedbackForm({ onSubmissionSuccess }: FeedbackFormProps) {
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

  const onSubmit = async (values: FeedbackFormValues) => {
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit feedback.");
      }

      toast.success("Feedback submitted successfully!");
      localStorage.setItem("lastFeedbackSubmission", now.toString());
      form.reset();
      onSubmissionSuccess();
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

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
            <FormItem className="space-y-3">
              <FormLabel>Rating</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  defaultValue={field.value.toString()}
                  className="flex h-10 items-center justify-center space-x-2"
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FormItem key={star}>
                      <FormControl>
                        <RadioGroupItem value={star.toString()} id={`rating-${star}`} className="sr-only" />
                      </FormControl>
                      <FormLabel
                        htmlFor={`rating-${star}`}
                        className={`flex items-center justify-center rounded-full w-8 h-8 cursor-pointer
                          ${field.value >= star ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}
                        `}
                      >
                        {star}
                      </FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
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
                <Textarea
                  placeholder="Tell us about your experience..." 
                  className="resize-y"
                  {...field}
                />
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
