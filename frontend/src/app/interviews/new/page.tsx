'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { useInterviewOperations } from '@/hooks/useInterview';
import { UserSearchCombobox } from '@/components/UserSearchCombobox';

// Form schema validation
const formSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
  candidateId: z.string().min(1, { message: 'Candidate ID is required' }),
  scheduledDate: z.date({ required_error: 'Interview date is required' }),
  duration: z.coerce.number().min(15, { message: 'Duration must be at least 15 minutes' }),
});

export default function CreateInterviewPage() {
  const router = useRouter();
  const { createInterviewAsync, isCreatingInterview } = useInterviewOperations();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      candidateId: '',
      scheduledDate: new Date(),
      duration: 60,
    },
  });

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      // Format the data for API
      const interviewData = {
        ...data,
        // Remove startTime and endTime as they don't exist in the Prisma schema
        status: 'SCHEDULED', // Use uppercase to match the enum in Prisma
      };
      
      // Create the interview
      const result = await createInterviewAsync(interviewData);
      
      toast.success('Interview Created', {
        description: 'The interview has been successfully scheduled.',
      });
      
      // Redirect to the interview details page
      router.push(`/interviews/${result.id}`);
    } catch (error) {
      console.error('Failed to create interview:', error);
      toast.error('Error', {
        description: error.response?.data?.message || 'Failed to create interview. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Create New Interview</h1>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Interview Details</CardTitle>
          <CardDescription>
            Fill in the details to schedule a new interview with a candidate.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interview Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Frontend Developer Interview" {...field} />
                    </FormControl>
                    <FormDescription>
                      A descriptive title for the interview.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Technical interview for the Frontend Developer position..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide details about the interview, including topics to cover.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="candidateId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Candidate</FormLabel>
                    <FormControl>
                      <UserSearchCombobox 
                        selectedUserId={field.value}
                        onUserSelect={field.onChange}
                        placeholder="Search for a candidate..."
                      />
                    </FormControl>
                    <FormDescription>
                      Search and select the candidate to interview.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scheduledDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Interview Date & Time</FormLabel>
                    <FormControl>
                      <DateTimePicker 
                        date={field.value} 
                        setDate={field.onChange}
                      />
                    </FormControl>
                    <FormDescription>
                      Select the date and time for the interview.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter the expected duration of the interview in minutes.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Interview'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}