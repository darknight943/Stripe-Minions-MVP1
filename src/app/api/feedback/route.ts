import { NextResponse } from 'next/server';
import { z } from 'zod';

const feedbackSchema = z.object({
  email: z.string().email('Invalid email address'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  category: z.enum(['Bug', 'Feature Request', 'General Feedback', 'Other'], {
    errorMap: () => ({ message: 'Invalid category' }),
  }),
  message: z.string().min(1, 'Message cannot be empty').max(500, 'Message cannot exceed 500 characters'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = feedbackSchema.parse(body);

    // In a real application, you would store this in a database or send to an external service.
    console.log('Feedback received:', validatedData);

    return NextResponse.json({ message: 'Feedback submitted successfully!' }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }
    console.error('Error submitting feedback:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
