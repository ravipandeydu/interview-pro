"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { useInterview, useInterviewOperations } from "@/hooks/useInterview";
import { UserSearchCombobox } from "@/components/UserSearchCombobox";
import { ArrowLeft, CalendarClock, Users, Loader2 } from "lucide-react";

// Form schema validation
const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" }),
  candidateId: z.string().min(1, { message: "Candidate ID is required" }),
  scheduledDate: z.date({ required_error: "Interview date is required" }),
  duration: z.coerce
    .number()
    .min(15, { message: "Duration must be at least 15 minutes" }),
});

export default function EditInterviewPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  
  const { data: interview, isLoading: isLoadingInterview } = useInterview(id);
  const { updateInterview, isUpdating } = useInterviewOperations();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      candidateId: "",
      scheduledDate: new Date(),
      duration: 60,
    },
  });

  // Load interview data when available
  useEffect(() => {
    if (interview) {
      form.reset({
        title: interview.title,
        description: interview.description,
        candidateId: interview.candidateId || "",
        scheduledDate: new Date(interview.scheduledDate),
        duration: interview.duration,
      });
    }
  }, [interview, form]);

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      // Format the data for API
      const interviewData = {
        ...data,
      };

      // Update the interview
      await updateInterview(
        { id, data: interviewData },
        {
          onSuccess: () => {
            toast.success("Interview Updated", {
              description: "The interview has been successfully updated.",
            });
            // Redirect to the interview details page
            router.push(`/interviews/${id}`);
          },
          onError: (error) => {
            console.error("Failed to update interview:", error);
            toast.error("Error", {
              description:
                error.response?.data?.message ||
                "Failed to update interview. Please try again.",
            });
          },
        }
      );
    } catch (error) {
      console.error("Failed to update interview:", error);
      toast.error("Error", {
        description:
          error.response?.data?.message ||
          "Failed to update interview. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingInterview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900/30 via-background to-violet-900/20 dark:from-indigo-950/50 dark:via-background dark:to-violet-950/40 relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-amber-600/10 rounded-full blur-3xl" />

        <div className="container mx-auto py-8 px-4 relative z-10 flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md border border-indigo-500/20 bg-background/40 backdrop-blur-xl shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />
            <CardContent className="flex flex-col items-center justify-center p-10 text-center relative z-10">
              <div className="h-12 w-12 animate-spin text-indigo-600 dark:text-indigo-400 mb-4">
                <Loader2 className="h-12 w-12" />
              </div>
              <p className="text-xl font-medium bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 dark:from-indigo-400 dark:via-purple-400 dark:to-violet-400">
                Loading interview details...
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Please wait while we prepare the information
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900/30 via-background to-violet-900/20 dark:from-indigo-950/50 dark:via-background dark:to-violet-950/40 relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-amber-600/10 rounded-full blur-3xl" />

      <div className="container mx-auto py-8 px-4 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 dark:from-indigo-400 dark:via-purple-400 dark:to-violet-400 flex items-center gap-2">
              <CalendarClock className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              Edit Interview
            </h1>
            <p className="text-muted-foreground mt-1">
              Update the details of this interview
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => router.back()}
            className="backdrop-blur-sm bg-background/50 border-indigo-500/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 transition-all duration-300"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Interview
          </Button>
        </div>

        <Card className="max-w-2xl mx-auto backdrop-blur-md bg-background/40 border border-indigo-500/20 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />
          <CardHeader className="relative z-10">
            <CardTitle className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Interview Details
            </CardTitle>
            <CardDescription className="text-indigo-700/70 dark:text-indigo-300/70">
              Update the details of this interview session
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/80 font-medium">
                        Interview Title
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Frontend Developer Interview"
                          {...field}
                          className="backdrop-blur-sm bg-background/50 border-indigo-500/20 focus:border-indigo-500/50 transition-all"
                        />
                      </FormControl>
                      <FormDescription className="text-indigo-700/60 dark:text-indigo-300/60">
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
                      <FormLabel className="text-foreground/80 font-medium">
                        Description
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Technical interview for the Frontend Developer position..."
                          {...field}
                          className="backdrop-blur-sm bg-background/50 border-indigo-500/20 focus:border-indigo-500/50 transition-all min-h-[100px]"
                        />
                      </FormControl>
                      <FormDescription className="text-indigo-700/60 dark:text-indigo-300/60">
                        Provide details about the interview, including topics to
                        cover.
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
                      <FormLabel className="text-foreground/80 font-medium">
                        Candidate
                      </FormLabel>
                      <FormControl>
                        <UserSearchCombobox
                          selectedUserId={field.value}
                          onUserSelect={field.onChange}
                          placeholder="Search for a candidate..."
                        />
                      </FormControl>
                      <FormDescription className="text-indigo-700/60 dark:text-indigo-300/60">
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
                      <FormLabel className="text-foreground/80 font-medium">
                        Interview Date & Time
                      </FormLabel>
                      <FormControl>
                        <DateTimePicker
                          date={field.value}
                          setDate={field.onChange}
                        />
                      </FormControl>
                      <FormDescription className="text-indigo-700/60 dark:text-indigo-300/60">
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
                      <FormLabel className="text-foreground/80 font-medium">
                        Duration (minutes)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          className="backdrop-blur-sm bg-background/50 border-indigo-500/20 focus:border-indigo-500/50 transition-all"
                        />
                      </FormControl>
                      <FormDescription className="text-indigo-700/60 dark:text-indigo-300/60">
                        Enter the expected duration of the interview in minutes.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                    className="backdrop-blur-sm bg-background/50 border-indigo-500/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 transition-all duration-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="backdrop-blur-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md shadow-indigo-500/20 border-0 transition-all duration-300 hover:scale-105"
                  >
                    {isSubmitting ? "Updating..." : "Update Interview"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}