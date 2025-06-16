"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useInterview,
  useInterviewOperations,
  useInterviewSubmissions,
} from "@/hooks/useInterview";
import { useAuth } from "@/store/useStore";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { VideoChat } from "@/components/VideoChat";
import { format } from "date-fns";
import { CollaborativeCodeEditor } from "@/components/CollaborativeCodeEditor";
import { InterviewNotes } from "@/components/interviews/InterviewNotes";
import { Loader2 } from "lucide-react";
import CodeEditor from "@/components/CodeEditor";

interface RecruiterInterviewProps {
  interviewId: string;
}

const RecruiterInterview = ({ interviewId }: RecruiterInterviewProps) => {
  const router = useRouter();
  const { user } = useAuth();

  // Fetch interview data
  const {
    data: interview,
    isLoading: isLoadingInterview,
    error: interviewError,
  } = useInterview(interviewId);

  // Fetch submissions
  const { data: submissions, isLoading: isLoadingSubmissions } =
    useInterviewSubmissions(interviewId);

  // Interview operations
  const { joinInterview, isJoiningInterview } = useInterviewOperations();

  // State
  const [activeTab, setActiveTab] = useState("overview");
  const [joinedInterview, setJoinedInterview] = useState(false);

  // Join the interview when component mounts
  useEffect(() => {
    if (interviewId && !isLoadingInterview && !interviewError && interview) {
      joinInterview(interviewId, {
        onSuccess: () => {
          setJoinedInterview(true);
          toast.success("Successfully joined the interview as a recruiter");
        },
        onError: (error) => {
          toast.error("Failed to join the interview");
          console.error("Join interview error:", error);
        },
      });
    }
  }, [
    interviewId,
    interview,
    isLoadingInterview,
    interviewError,
    joinInterview,
  ]);

  // Format date
  const formatDate = (dateString: string | Date) => {
    return format(new Date(dateString), "PPP p");
  };

  // Loading state
  if (isLoadingInterview || isLoadingSubmissions) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center relative">
        {/* Abstract Background Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />

        <Card className="w-full max-w-md border border-border/40 bg-background/60 backdrop-blur-xl backdrop-filter shadow-lg relative z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 z-0" />
          <CardContent className="flex flex-col items-center justify-center p-10 text-center relative z-10">
            <div className="rounded-full bg-background/80 p-3 backdrop-blur-sm border border-primary/20 shadow-lg mb-6">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
            <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 mb-2">
              Loading Interview
            </h3>
            <p className="text-lg font-medium">Preparing your session...</p>
            <p className="text-sm text-muted-foreground mt-2">
              Please wait while we load the interview data
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (interviewError || !interview) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center relative">
        {/* Abstract Background Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-rose-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-600/20 rounded-full blur-3xl animate-pulse" />

        <Card className="w-full max-w-md border border-border/40 bg-background/60 backdrop-blur-xl backdrop-filter shadow-lg relative z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-transparent to-amber-500/10 z-0" />
          <CardContent className="flex flex-col items-center justify-center p-10 text-center relative z-10">
            <Alert
              variant="destructive"
              className="mb-6 w-full backdrop-blur-sm bg-background/80"
            >
              <AlertDescription>
                Error loading interview. Please try again.
              </AlertDescription>
            </Alert>
            <Button
              onClick={() => router.push("/interviews")}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md"
            >
              Back to Interviews
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 px-4 relative">
      {/* Abstract Background Elements */}
      <div className="fixed top-20 left-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl animate-pulse z-0" />
      <div className="fixed bottom-10 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse z-0" />
      <div className="fixed top-40 right-20 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl animate-pulse z-0" />

      <div className="flex justify-between items-center mb-6 relative z-10">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
            {interview.title}
          </h1>
          <p className="text-muted-foreground">
            {interview.status} • Scheduled for{" "}
            {formatDate(interview.scheduledDate)}
          </p>
        </div>
        <Button
          onClick={() => router.push(`/interviews/${interviewId}`)}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md"
        >
          Back to Details
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        {/* Left sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Video chat */}
          <Card className="border border-border/40 bg-background/60 backdrop-blur-xl backdrop-filter shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 z-0" />
            <CardHeader className="relative z-10">
              <CardTitle className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                Video Interview
              </CardTitle>
              <CardDescription>Connect with the candidate</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <VideoChat interviewId={interviewId} userRole={user?.role} />
            </CardContent>
          </Card>

          {/* Interview info */}
          <Card className="border border-border/40 bg-background/60 backdrop-blur-xl backdrop-filter shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 z-0" />
            <CardHeader className="relative z-10">
              <CardTitle className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                Interview Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 relative z-10">
              <div>
                <p className="text-sm font-medium">Candidate</p>
                <p>{interview.candidate?.name || "Not assigned"}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Duration</p>
                <p>{interview.duration} minutes</p>
              </div>
              <div>
                <p className="text-sm font-medium">Questions</p>
                <p>{interview.questions.length} questions</p>
              </div>
              <div>
                <p className="text-sm font-medium">Status</p>
                <Badge
                  variant={
                    interview.status === "COMPLETED" ? "success" : "default"
                  }
                >
                  {interview.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main content */}
        <div className="lg:col-span-2">
          <Card>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <CardHeader>
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="questions">Questions</TabsTrigger>
                  <TabsTrigger value="submissions">Submissions</TabsTrigger>
                  <TabsTrigger value="collaborative">
                    Collaborative Editor
                  </TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent>
                <TabsContent value="overview" className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">
                      Interview Description
                    </h3>
                    <p className="mt-1">{interview.description}</p>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium">Progress</h3>
                    <div className="mt-2">
                      <Progress
                        value={
                          submissions?.length
                            ? (submissions.length /
                                interview.questions.length) *
                              100
                            : 0
                        }
                        className="h-2"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        {submissions?.length || 0} of{" "}
                        {interview.questions.length} questions answered
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="questions" className="space-y-4">
                  {interview.questions.map((question, index) => (
                    <Card
                      key={question.id}
                      className="border border-border/40 bg-background/60 backdrop-blur-xl backdrop-filter shadow-lg relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 z-0" />
                      <CardHeader className="relative z-10">
                        <div className="flex justify-between">
                          <CardTitle className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                            Question {index + 1}
                          </CardTitle>
                          <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-none">
                            {question.type}
                          </Badge>
                        </div>
                        <CardDescription>
                          {question.question.difficulty} • {question.points}{" "}
                          points • {question.timeLimit} min
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="relative z-10">
                        <p>{question.question.content}</p>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="submissions" className="space-y-4">
                  {submissions && submissions.length > 0 ? (
                    submissions.map((submission, i) => {
                      // Fix: Use the correct property name for finding the question
                      const question = interview.questions.find(
                        (q) => q.id === submission.interviewQuestionId
                      );
                      console.log(
                        question.id,
                        submission.interviewQuestionId,
                        i,
                        "question"
                      );
                      return (
                        <Card
                          key={submission.id}
                          className="border border-border/40 bg-background/60 backdrop-blur-xl backdrop-filter shadow-lg relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 z-0" />
                          <CardHeader className="relative z-10">
                            <div className="flex justify-between">
                              <CardTitle className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                                {question?.question?.content || "Question"}
                              </CardTitle>
                              <Badge
                                variant="outline"
                                className="bg-background/60 backdrop-blur-sm border border-indigo-500/30"
                              >
                                {new Date(
                                  submission.updatedAt
                                ).toLocaleString()}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="relative z-10">
                            <div className="mb-4">
                              <h4 className="text-sm font-medium mb-1 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                                Candidate's Answer:
                              </h4>
                              {question?.type === "coding" ? (
                                <div className="rounded-md border border-border/40 overflow-hidden">
                                  <CodeEditor
                                    value={
                                      submission.answer || submission.content
                                    }
                                    onChange={() => {}}
                                    language={
                                      submission.language || "javascript"
                                    }
                                    readOnly={true}
                                    height="200px"
                                  />
                                </div>
                              ) : (
                                <div className="bg-background/60 backdrop-blur-sm p-3 rounded-md border border-border/40">
                                  {submission.answer || submission.content}
                                </div>
                              )}
                            </div>

                            {submission.feedback && (
                              <div>
                                <h4 className="text-sm font-medium mb-1 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                                  Your Feedback:
                                </h4>
                                <div className="bg-background/60 backdrop-blur-sm p-3 rounded-md border border-border/40">
                                  {submission.feedback}
                                </div>
                              </div>
                            )}
                          </CardContent>
                          <CardFooter className="relative z-10">
                            <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md">
                              Add Feedback
                            </Button>
                          </CardFooter>
                        </Card>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 bg-background/60 backdrop-blur-sm p-6 rounded-lg border border-border/40">
                      <p className="text-muted-foreground">
                        No submissions yet
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="collaborative" className="space-y-4">
                  <div className="border border-border/40 bg-background/60 backdrop-blur-xl backdrop-filter shadow-md rounded-md p-4 overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-blue-500/5 z-0" />
                    <h3 className="text-lg font-medium mb-4 relative z-10">
                      Collaborative Code Editor
                    </h3>
                    <CollaborativeCodeEditor
                      interviewId={interviewId}
                      initialCode="// Write your code here..."
                      initialLanguage="javascript"
                      height="400px"
                      fetchUpdates={true}
                      fetchInterval={5000}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="notes" className="space-y-4">
                  <InterviewNotes interviewId={interviewId} />
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RecruiterInterview;
