"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import candidateAccessService from "../services/candidateAccessService";
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
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeEditor } from "@/components/CodeEditor";
import { VideoChat } from "@/components/VideoChat";
import { InterviewNotes } from "@/components/interviews/InterviewNotes";
import { CollaborativeCodeEditor } from "@/components/CollaborativeCodeEditor";
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Play,
} from "lucide-react";

const QuestionCard = ({
  children,
  className,
  ...props
}: React.ComponentProps<typeof Card>) => (
  <Card className={`mb-6 shadow-md ${className}`} {...props}>
    {children}
  </Card>
);

interface CandidateInterviewProps {
  token: string;
}

export const CandidateInterview = ({ token }: CandidateInterviewProps) => {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [interview, setInterview] =
    useState<candidateAccessService.CandidateInterview | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);

  console.log(interview, "interview");

  // Fetch interview details using the token
  useEffect(() => {
    const fetchInterview = async () => {
      try {
        setLoading(true);
        const interviewData = await candidateAccessService.getInterviewByToken(
          token
        );
        setInterview(interviewData);

        // Initialize responses object
        const initialResponses: Record<string, string> = {};
        interviewData.questions.forEach((q) => {
          initialResponses[q.id] = "";
        });
        setResponses(initialResponses);

        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load interview");
        setLoading(false);
      }
    };

    if (token) {
      fetchInterview();
    }
  }, [token]);

  // Start the interview
  const handleStart = async () => {
    try {
      await candidateAccessService.startInterview(token);
      setStarted(true);

      // Set timer if interview has a time limit
      if (interview?.timeLimit) {
        const endTime = new Date();
        endTime.setMinutes(endTime.getMinutes() + interview.timeLimit);

        const intervalId = setInterval(() => {
          const now = new Date();
          const diff = endTime - now;

          if (diff <= 0) {
            clearInterval(intervalId);
            handleSubmit();
          } else {
            const minutes = Math.floor(diff / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            setTimeRemaining(`${minutes}:${seconds < 10 ? "0" : ""}${seconds}`);
          }
        }, 1000);

        return () => clearInterval(intervalId);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to start interview");
    }
  };

  // Handle response changes
  const handleResponseChange = (questionId: string, value: string) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  // Handle code editor language change
  const handleLanguageChange = (questionId: string, language: string) => {
    setSelectedLanguage((prev) => ({
      ...prev,
      [questionId]: language,
    }));
  };

  // Determine if the current question is a coding question
  const isCodingQuestion = (
    question: candidateAccessService.InterviewQuestion
  ) => {
    return (
      question.question.category === "TECHNICAL" ||
      question.question.category === "CODING"
    );
  };

  // State for selected programming language
  const [selectedLanguage, setSelectedLanguage] = useState<
    Record<string, string>
  >({});

  // Submit a response for the current question
  const handleQuestionSubmit = async () => {
    console.log('handleQuestionSubmit called');
    if (!interview) return;

    const currentQuestion = interview.questions[currentQuestionIndex];
    const isCoding = isCodingQuestion(currentQuestion);

    try {
      console.log('Submitting response for question:', currentQuestion.id);
      await candidateAccessService.submitResponse(
        token,
        currentQuestion.id,
        responses[currentQuestion.id] || "",
        isCoding
          ? selectedLanguage[currentQuestion.id] || "javascript"
          : undefined
      );
      console.log('Response submitted successfully');

      if (currentQuestionIndex < interview.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        console.log('Moving to next question, new index:', currentQuestionIndex + 1);
      } else {
        setConfirmDialogOpen(true);
        console.log('Last question, opening confirmation dialog');
      }
    } catch (err: any) {
      console.error('Error submitting response:', err);
      setError(err.response?.data?.message || "Failed to submit response");
    }
  };

  // Complete the interview
  const handleSubmit = async () => {
    try {
      await candidateAccessService.completeInterview(token);
      setCompleted(true);
      setConfirmDialogOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to complete interview");
    }
  };

  if (loading) {
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
              Please wait while we prepare your interview
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    // Check if the error is related to a completed interview or expired token
    const isCompletedError = error.includes("already been completed");
    const isExpiredError = error.includes("token has expired");

    let errorTitle = "Error";
    let errorMessage = "There was an error accessing this interview.";

    if (isCompletedError) {
      errorTitle = "Interview Already Completed";
      errorMessage =
        "This interview has already been completed and cannot be accessed again. Please contact the recruiter if you need to discuss your submission.";
    } else if (isExpiredError) {
      errorTitle = "Interview Access Expired";
      errorMessage =
        "The access link for this interview has expired. Please contact the recruiter to request a new invitation if needed.";
    }

    return (
      <div className="flex min-h-[80vh] items-center justify-center relative">
        {/* Abstract Background Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-rose-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-600/20 rounded-full blur-3xl animate-pulse" />

        <Card className="w-full max-w-md border border-border/40 bg-background/60 backdrop-blur-xl backdrop-filter shadow-lg relative z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-transparent to-amber-500/10 z-0" />
          <CardHeader className="relative z-10">
            <CardTitle className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-amber-600 dark:from-rose-400 dark:to-amber-400">
              {errorTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <Alert
              variant="destructive"
              className="my-4 backdrop-blur-sm bg-background/80"
            >
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <p className="mb-4">{errorMessage}</p>
            <Button
              onClick={() => router.push("/")}
              className="mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md"
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center relative">
        {/* Abstract Background Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />

        <Card className="w-full max-w-md border border-border/40 bg-background/60 backdrop-blur-xl backdrop-filter shadow-lg relative z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-blue-500/10 z-0" />
          <CardHeader className="relative z-10">
            <CardTitle className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-blue-600 dark:from-emerald-400 dark:to-blue-400">
              Interview Completed
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="p-6 bg-muted/50 backdrop-blur-sm rounded-md text-center border border-emerald-500/20">
              <div className="rounded-full bg-emerald-500/20 p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-emerald-500" />
              </div>
              <p className="mb-6">
                Thank you for completing the interview. Your responses have been
                submitted successfully.
              </p>
              <Button
                variant="default"
                onClick={() => router.push("/")}
                className="mt-4"
              >
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center relative">
        {/* Abstract Background Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-rose-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-600/20 rounded-full blur-3xl animate-pulse" />

        <Card className="w-full max-w-md border border-border/40 bg-background/60 backdrop-blur-xl backdrop-filter shadow-lg relative z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-transparent to-amber-500/10 z-0" />
          <CardHeader className="relative z-10">
            <CardTitle className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-amber-600 dark:from-rose-400 dark:to-amber-400">
              Interview Not Found
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <Alert
              variant="destructive"
              className="my-4 backdrop-blur-sm bg-background/80"
            >
              <AlertDescription>
                Interview not found or access has expired.
              </AlertDescription>
            </Alert>
            <Button
              onClick={() => router.push("/")}
              className="mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md"
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="container mx-auto py-8 px-4 relative">
        {/* Abstract Background Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-20 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" />

        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                {interview.title}
              </h1>
              <p className="text-muted-foreground">{interview.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card className="border border-border/40 bg-background/60 backdrop-blur-xl backdrop-filter shadow-lg overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-indigo-500/10 z-0" />
                <CardHeader className="relative z-10">
                  <CardTitle className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                    Interview Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="space-y-4">
                    <div className="p-3 rounded-md bg-background/40 backdrop-blur-sm border border-border/40">
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        Position
                      </p>
                      <p className="font-medium">{interview.position}</p>
                    </div>
                    <div className="p-3 rounded-md bg-background/40 backdrop-blur-sm border border-border/40">
                      <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                        Questions
                      </p>
                      <p className="font-medium">
                        {interview.questions.length}
                      </p>
                    </div>
                    {interview.timeLimit && (
                      <div className="p-3 rounded-md bg-background/40 backdrop-blur-sm border border-border/40">
                        <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                          Time Limit
                        </p>
                        <p className="font-medium">
                          {interview.timeLimit} minutes
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card className="border border-border/40 bg-background/60 backdrop-blur-xl backdrop-filter shadow-lg overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 z-0" />
                <CardHeader className="relative z-10">
                  <CardTitle className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400">
                    Ready to Begin?
                  </CardTitle>
                  <CardDescription>
                    Once you start the interview, the timer will begin and
                    you'll be able to see and answer all questions. Make sure
                    you're in a quiet environment with a stable internet
                    connection before starting.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="p-6 bg-muted/50 backdrop-blur-sm rounded-md text-center border border-purple-500/20">
                    <div className="rounded-full bg-purple-500/20 p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <Play className="h-8 w-8 text-purple-500 ml-1" />
                    </div>
                    <p className="mb-4">
                      Click the button below when you're ready to start the
                      interview.
                    </p>
                    <Button
                      onClick={handleStart}
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md transition-all duration-300 transform hover:scale-105"
                    >
                      Start Interview
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = interview.questions[currentQuestionIndex];
  const progress =
    ((currentQuestionIndex + 1) / interview.questions.length) * 100;

  console.log(interview, currentQuestion, "interview");

  return (
    <div className="container mx-auto py-4 px-4 relative">
      {/* Abstract Background Elements */}
      <div className="fixed top-20 left-10 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
      <div className="fixed bottom-10 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
      <div className="fixed top-40 right-20 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl animate-pulse" />

      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
              {interview.title}
            </h1>
            <p className="text-muted-foreground">{interview.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left sidebar - Video chat */}
          <div className="lg:col-span-1 space-y-4">
            {/* Video chat */}
            <Card className="border border-border/40 bg-background/60 backdrop-blur-xl backdrop-filter shadow-lg overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 z-0" />
              <CardHeader className="relative z-10">
                <CardTitle className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                  Video Interview
                </CardTitle>
                <CardDescription>Connect with the interviewer</CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <VideoChat interviewId={token} userRole="CANDIDATE" />
              </CardContent>
            </Card>

            {/* Interview info */}
            <Card className="border border-border/40 bg-background/60 backdrop-blur-xl backdrop-filter shadow-lg overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 z-0" />
              <CardHeader className="relative z-10">
                <CardTitle className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400">
                  Interview Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 relative z-10">
                {timeRemaining && (
                  <div className="p-3 rounded-md bg-background/40 backdrop-blur-sm border border-border/40">
                    <p className="text-sm font-medium text-rose-600 dark:text-rose-400">
                      Time Remaining
                    </p>
                    <p className="font-medium">{timeRemaining}</p>
                  </div>
                )}
                <div className="p-3 rounded-md bg-background/40 backdrop-blur-sm border border-border/40">
                  <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                    Questions
                  </p>
                  <p className="font-medium">{interview.questions.length}</p>
                </div>
                <div className="p-3 rounded-md bg-background/40 backdrop-blur-sm border border-border/40">
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    Progress
                  </p>
                  <Progress
                    value={progress}
                    className="h-2 mt-2 bg-blue-100 dark:bg-blue-950"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main content - Questions */}
          <div className="lg:col-span-2">
            <Card className="border border-border/40 bg-background/60 backdrop-blur-xl backdrop-filter shadow-lg overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 z-0" />
              <CardHeader className="relative z-10">
                <CardTitle className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                  {interview.title}
                </CardTitle>
                <CardDescription>
                  Question {currentQuestionIndex + 1} of{" "}
                  {interview.questions.length}
                  {timeRemaining && (
                    <span className="ml-4 font-medium text-rose-600 dark:text-rose-400">
                      Time Remaining: {timeRemaining}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="mb-6">
                  <Progress
                    value={progress}
                    className="h-2 bg-indigo-100 dark:bg-indigo-950"
                  />
                </div>

                <Tabs defaultValue="question">
                  <TabsList className="mb-4">
                    <TabsTrigger value="question">Question</TabsTrigger>
                    <TabsTrigger value="collaborative">Collaborative Editor</TabsTrigger>
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                  </TabsList>

                  <TabsContent value="question">
                    <QuestionCard>
                      <CardContent className="pt-6">
                        <h3 className="text-lg font-medium mb-4">
                          {currentQuestion.question.content}
                        </h3>

                        {isCodingQuestion(currentQuestion) ? (
                          <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                              <label className="text-sm font-medium">
                                Programming Language:
                              </label>
                              <Select
                                value={
                                  selectedLanguage[currentQuestion.id] ||
                                  "javascript"
                                }
                                onValueChange={(value) =>
                                  handleLanguageChange(
                                    currentQuestion.id,
                                    value
                                  )
                                }
                              >
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="javascript">
                                    JavaScript
                                  </SelectItem>
                                  <SelectItem value="typescript">
                                    TypeScript
                                  </SelectItem>
                                  <SelectItem value="python">Python</SelectItem>
                                  <SelectItem value="java">Java</SelectItem>
                                  <SelectItem value="csharp">C#</SelectItem>
                                  <SelectItem value="cpp">C++</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <CodeEditor
                              value={responses[currentQuestion.id] || ""}
                              onChange={(value) =>
                                handleResponseChange(currentQuestion.id, value)
                              }
                              language={
                                selectedLanguage[currentQuestion.id] ||
                                "javascript"
                              }
                              height="300px"
                              isCandidate={true}
                            />
                          </div>
                        ) : (
                          <Textarea
                            value={responses[currentQuestion.id] || ""}
                            onChange={(e) =>
                              handleResponseChange(
                                currentQuestion.id,
                                e.target.value
                              )
                            }
                            placeholder="Type your answer here..."
                            className="w-full min-h-[150px]"
                          />
                        )}
                      </CardContent>
                    </QuestionCard>
                  </TabsContent>

                  <TabsContent value="collaborative">
                    <QuestionCard>
                      <CardContent className="pt-6">
                        <h3 className="text-lg font-medium mb-4">
                          {currentQuestion.question.content}
                        </h3>

                        {isCodingQuestion(currentQuestion) ? (
                          <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                              <label className="text-sm font-medium">
                                Programming Language:
                              </label>
                              <Select
                                value={
                                  selectedLanguage[currentQuestion.id] ||
                                  "javascript"
                                }
                                onValueChange={(value) =>
                                  handleLanguageChange(
                                    currentQuestion.id,
                                    value
                                  )
                                }
                              >
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="javascript">
                                    JavaScript
                                  </SelectItem>
                                  <SelectItem value="typescript">
                                    TypeScript
                                  </SelectItem>
                                  <SelectItem value="python">Python</SelectItem>
                                  <SelectItem value="java">Java</SelectItem>
                                  <SelectItem value="csharp">C#</SelectItem>
                                  <SelectItem value="cpp">C++</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <CollaborativeCodeEditor
                              interviewId={token}
                              initialCode={responses[currentQuestion.id] || ""}
                              initialLanguage={
                                selectedLanguage[currentQuestion.id] ||
                                "javascript"
                              }
                              height="300px"
                              isCandidate={true}
                              onCodeChange={(value) =>
                                handleResponseChange(currentQuestion.id, value)
                              }
                              onLanguageChange={(value) =>
                                handleLanguageChange(currentQuestion.id, value)
                              }
                            />
                          </div>
                        ) : (
                          <Textarea
                            value={responses[currentQuestion.id] || ""}
                            onChange={(e) =>
                              handleResponseChange(
                                currentQuestion.id,
                                e.target.value
                              )
                            }
                            placeholder="Type your answer here..."
                            className="w-full min-h-[150px]"
                          />
                        )}
                      </CardContent>
                    </QuestionCard>
                  </TabsContent>

                  <TabsContent value="notes">
                    <div className="border border-border/40 bg-background/60 backdrop-blur-xl backdrop-filter shadow-md rounded-md p-4 overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-blue-500/5 z-0" />
                      <InterviewNotes
                        interviewId={interview?.id || ""}
                        accessToken={token}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex justify-between relative z-20 bg-background/60 backdrop-blur-sm border-t border-indigo-500/10 py-4">
                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentQuestionIndex(
                      Math.max(0, currentQuestionIndex - 1)
                    )
                  }
                  disabled={currentQuestionIndex === 0}
                  className="border-indigo-500/30 hover:bg-indigo-500/10 backdrop-blur-sm"
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Previous
                </Button>

                {currentQuestionIndex < interview.questions.length - 1 ? (
                  <Button
                    onClick={(e) => {
                      console.log('Next button clicked');
                      e.preventDefault();
                      handleQuestionSubmit();
                    }}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md"
                  >
                    Next
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={async (e) => {
                      console.log('Complete Interview button clicked');
                      e.preventDefault();
                      await handleQuestionSubmit();
                      setConfirmDialogOpen(true);
                    }}
                    className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-md"
                  >
                    <CheckCircle className="mr-1 h-4 w-4" />
                    Complete Interview
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>

        <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Complete Interview</DialogTitle>
              <DialogDescription>
                Are you sure you want to complete this interview? You won't be
                able to change your answers after submission.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setConfirmDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit}>Submit Interview</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CandidateInterview;
