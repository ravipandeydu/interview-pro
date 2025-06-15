"use client";

import { useState, use } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useInterview,
  useInterviewOperations,
  useInterviewSubmissions,
} from "@/hooks/useInterview";
import { useAuth } from "@/store/useStore";
import { useAllCandidates } from "@/hooks/useCandidate";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Calendar,
  Clock,
  User,
  FileText,
  Edit,
  Trash2,
  Share2,
  Copy,
  Plus,
  X,
  ActivitySquare,
  ShieldCheck,
  Lock,
  Gauge,
  Loader2,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Code,
  Bug,
  Shield,
  Zap,
  Percent,
  Link,
  ClipboardX,
} from "lucide-react";
import { QuestionSelector } from "@/components/questions/QuestionSelector";
import { InterviewNotes } from "@/components/interviews/InterviewNotes";
import { format } from "date-fns";
import InterviewService from "@/services/interviewService";

export default function InterviewPage({ params }: { params: { id: string } }) {
  const id = use(params).id;
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("details");
  const [showQuestionSelector, setShowQuestionSelector] = useState(false);
  const [isSendingInvitation, setIsSendingInvitation] = useState(false);

  // Fetch interview data
  const { data: interview, isLoading: isLoadingInterview } = useInterview(
    id as string
  );

  // Fetch submissions
  const { data: submissions, isLoading: isLoadingSubmissions } =
    useInterviewSubmissions(id as string);

  // Interview operations
  const {
    updateInterview,
    deleteInterview,
    addQuestionsToInterview,
    removeQuestionFromInterview,
    isUpdating,
    isDeleting,
    isAddingQuestionsToInterview,
    isRemovingQuestionFromInterview,
  } = useInterviewOperations();

  // Handle interview deletion
  const handleDeleteInterview = () => {
    if (!id) return;

    deleteInterview(id as string, {
      onSuccess: () => {
        toast.success("Interview deleted successfully");
        router.push("/dashboard");
      },
      onError: (error) => {
        toast.error("Failed to delete interview");
        console.error("Delete interview error:", error);
      },
    });
  };

  // Handle copy interview link
  const handleCopyLink = () => {
    const link = `${window.location.origin}/interviews/${id}/join`;
    navigator.clipboard.writeText(link);
    toast.success("Interview link copied to clipboard");
  };

  // Handle sending invitation directly
  const handleSendInvitation = async () => {
    if (!interview?.candidateId) {
      toast.error("No candidate associated with this interview");
      return;
    }

    try {
      setIsSendingInvitation(true);

      const result = await InterviewService.sendInterviewInvitation(
        id as string,
        interview.candidateId
      );

      toast.success(`Invitation sent successfully to candidate`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send invitation");
      console.error("Send invitation error:", err);
    } finally {
      setIsSendingInvitation(false);
    }
  };

  // Handle adding questions to interview
  const handleAddQuestions = (questions: Array<{ questionId: string }>) => {
    if (!id) return;

    addQuestionsToInterview(
      {
        interviewId: id as string,
        questions,
      },
      {
        onSuccess: () => {
          toast.success("Questions added successfully");
          setShowQuestionSelector(false);
        },
        onError: (error) => {
          toast.error("Failed to add questions");
          console.error("Add questions error:", error);
        },
      }
    );
  };

  // Handle removing a question from interview
  const handleRemoveQuestion = (questionId: string) => {
    if (!id) return;

    removeQuestionFromInterview(
      {
        interviewId: id as string,
        questionId,
      },
      {
        onSuccess: () => {
          toast.success("Question removed successfully");
        },
        onError: (error) => {
          toast.error("Failed to remove question");
          console.error("Remove question error:", error);
        },
      }
    );
  };

  if (isLoadingInterview) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-indigo-900/30 via-background to-violet-900/20 dark:from-indigo-950/50 dark:via-background dark:to-violet-950/40 relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl" />

        <Card className="w-full max-w-md border border-indigo-500/20 bg-background/40 backdrop-blur-xl shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />
          <CardContent className="flex flex-col items-center justify-center p-10 text-center relative z-10">
            <div className="h-12 w-12 animate-spin text-indigo-600 dark:text-indigo-400 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-12 w-12"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
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
    );
  }

  if (!interview) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-indigo-900/30 via-background to-violet-900/20 dark:from-indigo-950/50 dark:via-background dark:to-violet-950/40 relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />

        <Card className="w-full max-w-md border border-indigo-500/20 bg-background/40 backdrop-blur-xl shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />
          <CardContent className="flex flex-col items-center justify-center p-10 text-center relative z-10">
            <p className="text-xl font-medium text-destructive">
              Interview not found
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              The interview you're looking for doesn't exist or has been removed
            </p>
            <Button
              variant="default"
              onClick={() => router.push("/interviews")}
              className="mt-6 backdrop-blur-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/30 border-0 transition-all duration-300 hover:scale-105"
            >
              Back to Interviews
            </Button>
          </CardContent>
        </Card>
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
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-600/10 rounded-full blur-3xl opacity-30" />

      <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <Card className="backdrop-blur-md bg-background/40 border border-indigo-500/20 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />
          <CardContent className="p-6 relative z-10">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 dark:from-indigo-400 dark:via-purple-400 dark:to-violet-400">
                  {interview.title}
                </h1>
                <p className="text-muted-foreground mt-2">
                  {interview.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 justify-start md:justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 backdrop-blur-sm bg-background/50 border-emerald-500/30 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 transition-all duration-300"
                  onClick={() => router.push(`/interviews/${id}/join`)}
                >
                  <ActivitySquare className="h-4 w-4 mr-1" />
                  Join Interview
                </Button>

                {interview.status === "COMPLETED" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 backdrop-blur-sm bg-background/50 border-blue-500/30 text-blue-600 dark:text-blue-300 hover:bg-blue-50/20 dark:hover:bg-blue-950/20 transition-all duration-300"
                    onClick={() => router.push(`/submissions/${id}/results`)}
                  >
                    <BarChart3 className="h-4 w-4 mr-1" />
                    View Results
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 backdrop-blur-sm bg-background/50 border-indigo-500/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 transition-all duration-300"
                  onClick={handleCopyLink}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy Link
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 backdrop-blur-sm bg-background/50 border-purple-500/30 text-purple-600 dark:text-purple-300 hover:bg-purple-50/20 dark:hover:bg-purple-950/20 transition-all duration-300"
                      disabled={isSendingInvitation || !interview.candidateId}
                    >
                      <Share2 className="h-4 w-4 mr-1" />
                      Send Invitation
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="backdrop-blur-md bg-background/80 border border-indigo-500/20 shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none rounded-lg" />
                    <AlertDialogHeader className="relative z-10">
                      <AlertDialogTitle className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                        Send Interview Invitation
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Send an invitation email to the candidate associated
                        with this interview?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="relative z-10">
                      <AlertDialogCancel className="backdrop-blur-sm bg-background/50 border-indigo-500/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 transition-all duration-300">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleSendInvitation}
                        disabled={isSendingInvitation}
                        className="backdrop-blur-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/30 border-0 transition-all duration-300"
                      >
                        {isSendingInvitation ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Sending...
                          </>
                        ) : (
                          "Send"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 backdrop-blur-sm bg-background/50 border-emerald-500/30 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 transition-all duration-300"
                  onClick={() => router.push(`/interviews/edit/${id}`)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex items-center gap-1 backdrop-blur-sm bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-300 hover:bg-rose-50/20 dark:hover:bg-rose-950/20 transition-all duration-300"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="backdrop-blur-md bg-background/80 border border-rose-500/20 shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-red-500/5 pointer-events-none rounded-lg" />
                    <AlertDialogHeader className="relative z-10">
                      <AlertDialogTitle className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-red-600 dark:from-rose-400 dark:to-red-400">
                        Are you sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete the interview and all associated data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="relative z-10">
                      <AlertDialogCancel className="backdrop-blur-sm bg-background/50 border-indigo-500/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 transition-all duration-300">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteInterview}
                        className="backdrop-blur-sm bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white shadow-lg shadow-rose-500/30 border-0 transition-all duration-300"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="backdrop-blur-sm bg-background/40 border border-indigo-500/20 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />
                <CardHeader className="pb-2 pt-4 relative z-10">
                  <CardTitle className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                    Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <Badge className="text-base font-medium px-3 py-1 backdrop-blur-sm bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border-indigo-500/30">
                    {interview.status}
                  </Badge>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-sm bg-background/40 border border-purple-500/20 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-violet-500/5 pointer-events-none" />
                <CardHeader className="pb-2 pt-4 relative z-10">
                  <CardTitle className="text-sm font-medium text-purple-600 dark:text-purple-400">
                    Scheduled Date
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center relative z-10">
                  <Calendar className="h-4 w-4 mr-2 text-purple-500" />
                  <span>
                    {interview.scheduledDate
                      ? format(new Date(interview.scheduledDate), "PPP")
                      : "Not scheduled"}
                  </span>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-sm bg-background/40 border border-violet-500/20 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-indigo-500/5 pointer-events-none" />
                <CardHeader className="pb-2 pt-4 relative z-10">
                  <CardTitle className="text-sm font-medium text-violet-600 dark:text-violet-400">
                    Duration
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center relative z-10">
                  <Clock className="h-4 w-4 mr-2 text-violet-500" />
                  <span>{interview.duration} minutes</span>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Section */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-0 backdrop-blur-md bg-background/40 border border-indigo-500/20 p-1 rounded-lg">
            <TabsTrigger
              value="details"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-300 data-[state=active]:shadow-sm data-[state=active]:backdrop-blur-sm transition-all duration-300"
            >
              Details
            </TabsTrigger>
            <TabsTrigger
              value="questions"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-violet-500/20 data-[state=active]:text-purple-600 dark:data-[state=active]:text-purple-300 data-[state=active]:shadow-sm data-[state=active]:backdrop-blur-sm transition-all duration-300"
            >
              Questions
            </TabsTrigger>
            <TabsTrigger
              value="submissions"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500/20 data-[state=active]:to-indigo-500/20 data-[state=active]:text-violet-600 dark:data-[state=active]:text-violet-300 data-[state=active]:shadow-sm data-[state=active]:backdrop-blur-sm transition-all duration-300"
            >
              Submissions
            </TabsTrigger>
            <TabsTrigger
              value="notes"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-300 data-[state=active]:shadow-sm data-[state=active]:backdrop-blur-sm transition-all duration-300"
            >
              Notes
            </TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="mt-6 space-y-6">
            <Card className="backdrop-blur-md bg-background/40 border border-indigo-500/20 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />
              <CardHeader className="relative z-10">
                <CardTitle className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 dark:from-indigo-400 dark:via-purple-400 dark:to-violet-400">
                  Interview Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 p-4 rounded-lg backdrop-blur-sm bg-background/30 border border-indigo-500/20 shadow-sm">
                    <h3 className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                      Candidate
                    </h3>
                    <div className="flex items-center">
                      <div className="p-2 rounded-full bg-indigo-500/10">
                        <User className="h-4 w-4 text-indigo-500" />
                      </div>
                      <span className="font-medium ml-2">
                        {interview.candidateId
                          ? interview.candidate?.fullName
                          : "No candidate assigned"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 p-4 rounded-lg backdrop-blur-sm bg-background/30 border border-purple-500/20 shadow-sm">
                    <h3 className="text-sm font-medium text-purple-600 dark:text-purple-400">
                      Recruiter
                    </h3>
                    <div className="flex items-center">
                      <div className="p-2 rounded-full bg-purple-500/10">
                        <User className="h-4 w-4 text-purple-500" />
                      </div>
                      <span className="font-medium ml-2">
                        {interview.recruiterId
                          ? interview.recruiter?.name
                          : "No recruiter assigned"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg backdrop-blur-sm bg-background/30 border border-violet-500/20 shadow-sm">
                  <h3 className="text-sm font-medium text-violet-600 dark:text-violet-400 mb-2">
                    Description
                  </h3>
                  <p className="bg-background/50 p-3 rounded-md border border-violet-500/10">
                    {interview.description || "No description provided"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {interview.instructions && (
              <Card className="backdrop-blur-md bg-background/40 border border-emerald-500/20 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 pointer-events-none" />
                <CardHeader className="relative z-10">
                  <CardTitle className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400">
                    Instructions
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="bg-background/50 p-4 rounded-md border border-emerald-500/10 whitespace-pre-wrap">
                    {interview.instructions}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Questions Tab */}
          <TabsContent value="questions" className="mt-6">
            <Card className="backdrop-blur-md bg-background/40 border border-indigo-500/20 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />
              <CardHeader className="flex flex-row items-center justify-between relative z-10">
                <div>
                  <CardTitle className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 dark:from-indigo-400 dark:via-purple-400 dark:to-violet-400">
                    Questions
                  </CardTitle>
                  <CardDescription>
                    This interview contains {interview.questions?.length || 0}{" "}
                    questions
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setShowQuestionSelector(true)}
                  className="relative overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md hover:shadow-xl transition-all duration-300 border-0"
                >
                  <span className="absolute inset-0 bg-white/20 transform hover:scale-105 transition-transform duration-300"></span>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Questions
                </Button>
              </CardHeader>
              <CardContent className="relative z-10">
                {showQuestionSelector ? (
                  <QuestionSelector
                    interviewId={id as string}
                    onAddQuestions={handleAddQuestions}
                    existingQuestionIds={
                      interview.questions?.map((q) => q.id) || []
                    }
                    onCancel={() => setShowQuestionSelector(false)}
                  />
                ) : (
                  <div className="space-y-6">
                    {interview.questions?.map((question, index) => (
                      <div
                        key={question.id}
                        className="bg-background/50 p-4 rounded-lg border border-indigo-500/10 shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-medium">
                            {index + 1}. {question.question.content}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              className="bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/30"
                            >
                              {question.question.category}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleRemoveQuestion(question.question.id)
                              }
                              disabled={isRemovingQuestionFromInterview}
                              className="rounded-full hover:bg-red-500/10 hover:text-red-500 transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="outline"
                            className="bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-300"
                          >
                            {question.question.difficulty}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {question?.question?.points} points
                          </span>
                        </div>
                        <p className="mt-3">{question.description}</p>

                        {index < (interview.questions?.length || 0) - 1 && (
                          <Separator className="mt-4" />
                        )}
                      </div>
                    ))}

                    {(!interview.questions ||
                      interview.questions.length === 0) && (
                      <div className="text-center py-8 bg-background/30 rounded-lg border border-dashed border-indigo-500/30 p-6">
                        <div className="p-4 rounded-full bg-indigo-500/10 mx-auto w-fit mb-3">
                          <FileText className="h-10 w-10 text-indigo-500" />
                        </div>
                        <p className="text-muted-foreground mb-4">
                          No questions have been added to this interview.
                        </p>
                        <Button
                          variant="outline"
                          className="mt-2 backdrop-blur-sm bg-background/50 border-indigo-500/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 transition-all duration-300"
                          onClick={() => setShowQuestionSelector(true)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Questions
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Submissions Tab */}
          <TabsContent value="submissions" className="mt-6">
            <Card className="backdrop-blur-md bg-background/40 border border-indigo-500/20 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />
              <CardHeader className="relative z-10">
                <CardTitle className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 dark:from-indigo-400 dark:via-purple-400 dark:to-violet-400">
                  Submissions
                </CardTitle>
                <CardDescription>
                  View candidate submissions for this interview
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                {isLoadingSubmissions ? (
                  <div className="flex flex-col justify-center items-center py-12">
                    <div className="p-4 rounded-full bg-indigo-500/10 mb-4">
                      <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                    </div>
                    <p className="text-muted-foreground">
                      Loading submissions...
                    </p>
                  </div>
                ) : submissions && submissions.length > 0 ? (
                  <div className="space-y-6">
                    {submissions.map((submission) => {
                      const question = interview.questions?.find(
                        (q) => q.id === submission.questionId
                      );
                      return (
                        <div
                          key={submission.id}
                          className="backdrop-blur-sm bg-background/30 border border-indigo-500/20 rounded-lg p-5 shadow-md hover:shadow-lg transition-all duration-300"
                        >
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
                            <h3 className="font-medium text-lg bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                              {question?.title || "Unknown Question"}
                            </h3>
                            <Badge className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-indigo-500/30 text-indigo-700 dark:text-indigo-300">
                              {submission.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4 flex items-center">
                            <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                            Submitted:{" "}
                            {new Date(submission.createdAt).toLocaleString()}
                          </p>
                          <div className="mb-4">
                            <h4 className="text-sm font-medium mb-2 text-purple-600 dark:text-purple-400">
                              Answer:
                            </h4>
                            <pre className="p-4 bg-background/50 border border-indigo-500/10 rounded-md overflow-x-auto text-sm shadow-sm">
                              {submission.answer}
                            </pre>
                          </div>

                          {/* AI Analysis Section */}
                          {submission.aiAnalysis && (
                            <div className="mt-6 space-y-5">
                              <Separator className="bg-indigo-500/20" />
                              <div>
                                <h4 className="text-base font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                                  AI Analysis
                                </h4>
                                <div className="flex items-center gap-2 mb-3 backdrop-blur-sm bg-background/30 border border-indigo-500/20 p-4 rounded-lg shadow-sm">
                                  <div className="p-2 rounded-full bg-indigo-500/10">
                                    <BarChart3 className="h-4 w-4 text-indigo-500" />
                                  </div>
                                  <span className="text-sm font-medium">
                                    Score:
                                  </span>
                                  <span
                                    className={`text-sm font-bold ${
                                      submission.aiAnalysis.score >= 80
                                        ? "text-green-500"
                                        : submission.aiAnalysis.score >= 60
                                        ? "text-yellow-500"
                                        : "text-red-500"
                                    }`}
                                  >
                                    {submission.aiAnalysis.score}/100
                                  </span>
                                </div>
                                <div className="backdrop-blur-sm bg-background/30 border border-indigo-500/20 p-4 rounded-lg shadow-sm">
                                  <p className="text-sm">
                                    {submission.aiAnalysis.feedback}
                                  </p>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="backdrop-blur-sm bg-green-50/30 dark:bg-green-900/10 border border-green-500/20 p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                                  <div className="flex items-center gap-2 mb-3">
                                    <div className="p-2 rounded-full bg-green-500/10">
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                    </div>
                                    <h4 className="text-sm font-medium text-green-600 dark:text-green-400">
                                      Strengths
                                    </h4>
                                  </div>
                                  <ul className="list-disc pl-5 space-y-1 text-sm">
                                    {submission.aiAnalysis.strengths.map(
                                      (strength, index) => (
                                        <li key={index}>{strength}</li>
                                      )
                                    )}
                                  </ul>
                                </div>

                                <div className="backdrop-blur-sm bg-red-50/30 dark:bg-red-900/10 border border-red-500/20 p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                                  <div className="flex items-center gap-2 mb-3">
                                    <div className="p-2 rounded-full bg-red-500/10">
                                      <AlertCircle className="h-4 w-4 text-red-500" />
                                    </div>
                                    <h4 className="text-sm font-medium text-red-600 dark:text-red-400">
                                      Areas for Improvement
                                    </h4>
                                  </div>
                                  <ul className="list-disc pl-5 space-y-1 text-sm">
                                    {submission.aiAnalysis.weaknesses.map(
                                      (weakness, index) => (
                                        <li key={index}>{weakness}</li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              </div>

                              {submission.aiAnalysis.suggestions &&
                                submission.aiAnalysis.suggestions.length >
                                  0 && (
                                  <div className="backdrop-blur-sm bg-blue-50/30 dark:bg-blue-900/10 border border-blue-500/20 p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                                    <div className="flex items-center gap-2 mb-3">
                                      <div className="p-2 rounded-full bg-blue-500/10">
                                        <Lightbulb className="h-4 w-4 text-blue-500" />
                                      </div>
                                      <h4 className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                        Suggestions
                                      </h4>
                                    </div>
                                    <ul className="list-disc pl-5 space-y-1 text-sm">
                                      {submission.aiAnalysis.suggestions.map(
                                        (suggestion, index) => (
                                          <li key={index}>{suggestion}</li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                )}

                              {/* Code Quality Metrics - Only shown for coding questions */}
                              {question?.type === "coding" &&
                                submission.aiAnalysis.codeQualityMetrics && (
                                  <div className="mt-5">
                                    <div className="flex items-center gap-2 mb-3">
                                      <div className="p-2 rounded-full bg-purple-500/10">
                                        <Code2 className="h-4 w-4 text-purple-500" />
                                      </div>
                                      <h4 className="text-sm font-medium text-purple-600 dark:text-purple-400">
                                        Code Quality Metrics
                                      </h4>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                      <div className="backdrop-blur-sm border border-purple-500/20 rounded-lg p-4 bg-purple-50/30 dark:bg-purple-900/10 shadow-sm hover:shadow-md transition-all duration-300">
                                        <div className="text-xs text-muted-foreground">
                                          Maintainability
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                          <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                                            {
                                              submission.aiAnalysis
                                                .codeQualityMetrics
                                                .maintainability
                                            }
                                            /100
                                          </span>
                                          <div className="p-1.5 rounded-full bg-purple-500/10">
                                            <ActivitySquare className="h-4 w-4 text-purple-500" />
                                          </div>
                                        </div>
                                      </div>
                                      <div className="backdrop-blur-sm border border-blue-500/20 rounded-lg p-4 bg-blue-50/30 dark:bg-blue-900/10 shadow-sm hover:shadow-md transition-all duration-300">
                                        <div className="text-xs text-muted-foreground">
                                          Reliability
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                          <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                            {
                                              submission.aiAnalysis
                                                .codeQualityMetrics.reliability
                                            }
                                            /100
                                          </span>
                                          <div className="p-1.5 rounded-full bg-blue-500/10">
                                            <ShieldCheck className="h-4 w-4 text-blue-500" />
                                          </div>
                                        </div>
                                      </div>
                                      <div className="backdrop-blur-sm border border-red-500/20 rounded-lg p-4 bg-red-50/30 dark:bg-red-900/10 shadow-sm hover:shadow-md transition-all duration-300">
                                        <div className="text-xs text-muted-foreground">
                                          Security
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                          <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                                            {
                                              submission.aiAnalysis
                                                .codeQualityMetrics.security
                                            }
                                            /100
                                          </span>
                                          <div className="p-1.5 rounded-full bg-red-500/10">
                                            <Lock className="h-4 w-4 text-red-500" />
                                          </div>
                                        </div>
                                      </div>
                                      <div className="backdrop-blur-sm border border-green-500/20 rounded-lg p-4 bg-green-50/30 dark:bg-green-900/10 shadow-sm hover:shadow-md transition-all duration-300">
                                        <div className="text-xs text-muted-foreground">
                                          Performance
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                          <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                                            {
                                              submission.aiAnalysis
                                                .codeQualityMetrics.performance
                                            }
                                            /100
                                          </span>
                                          <div className="p-1.5 rounded-full bg-green-500/10">
                                            <Gauge className="h-4 w-4 text-green-500" />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                              {/* Code Quality Details - Only shown for coding questions */}
                              {question?.type === "coding" &&
                                submission.aiAnalysis.codeQualityDetails && (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                                    <div className="backdrop-blur-sm border border-indigo-500/20 rounded-lg p-4 bg-indigo-50/30 dark:bg-indigo-900/10 shadow-sm hover:shadow-md transition-all duration-300">
                                      <div className="flex items-center gap-2 mb-3">
                                        <div className="p-1.5 rounded-full bg-indigo-500/10">
                                          <Search className="h-4 w-4 text-indigo-500" />
                                        </div>
                                        <h4 className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                                          Static Analysis
                                        </h4>
                                      </div>
                                      <ul className="list-disc pl-5 space-y-1 text-xs">
                                        {submission.aiAnalysis.codeQualityDetails.staticAnalysis.map(
                                          (finding, index) => (
                                            <li key={index}>{finding}</li>
                                          )
                                        )}
                                      </ul>
                                    </div>

                                    <div className="backdrop-blur-sm border border-emerald-500/20 rounded-lg p-4 bg-emerald-50/30 dark:bg-emerald-900/10 shadow-sm hover:shadow-md transition-all duration-300">
                                      <div className="flex items-center gap-2 mb-3">
                                        <div className="p-1.5 rounded-full bg-emerald-500/10">
                                          <CheckSquare className="h-4 w-4 text-emerald-500" />
                                        </div>
                                        <h4 className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                          Best Practices
                                        </h4>
                                      </div>
                                      <ul className="list-disc pl-5 space-y-1 text-xs">
                                        {submission.aiAnalysis.codeQualityDetails.bestPractices.map(
                                          (practice, index) => (
                                            <li key={index}>{practice}</li>
                                          )
                                        )}
                                      </ul>
                                    </div>

                                    <div className="backdrop-blur-sm border border-amber-500/20 rounded-lg p-4 bg-amber-50/30 dark:bg-amber-900/10 shadow-sm hover:shadow-md transition-all duration-300">
                                      <div className="flex items-center gap-2 mb-3">
                                        <div className="p-1.5 rounded-full bg-amber-500/10">
                                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                                        </div>
                                        <h4 className="text-sm font-medium text-amber-600 dark:text-amber-400">
                                          Performance Issues
                                        </h4>
                                      </div>
                                      <ul className="list-disc pl-5 space-y-1 text-xs">
                                        {submission.aiAnalysis.codeQualityDetails.performanceIssues.map(
                                          (issue, index) => (
                                            <li key={index}>{issue}</li>
                                          )
                                        )}
                                      </ul>
                                    </div>

                                    <div className="backdrop-blur-sm border border-rose-500/20 rounded-lg p-4 bg-rose-50/30 dark:bg-rose-900/10 shadow-sm hover:shadow-md transition-all duration-300">
                                      <div className="flex items-center gap-2 mb-3">
                                        <div className="p-1.5 rounded-full bg-rose-500/10">
                                          <ShieldAlert className="h-4 w-4 text-rose-500" />
                                        </div>
                                        <h4 className="text-sm font-medium text-rose-600 dark:text-rose-400">
                                          Security Vulnerabilities
                                        </h4>
                                      </div>
                                      <ul className="list-disc pl-5 space-y-1 text-xs">
                                        {submission.aiAnalysis.codeQualityDetails.securityVulnerabilities.map(
                                          (vulnerability, index) => (
                                            <li key={index}>{vulnerability}</li>
                                          )
                                        )}
                                      </ul>
                                    </div>
                                  </div>
                                )}

                              {/* Plagiarism Report */}
                              {submission.plagiarismReport && (
                                <div className="mt-5">
                                  <div className="flex items-center gap-2 mb-3">
                                    <div className="p-2 rounded-full bg-amber-500/10">
                                      <FileSearch className="h-4 w-4 text-amber-500" />
                                    </div>
                                    <h4 className="text-sm font-medium text-amber-600 dark:text-amber-400">
                                      Plagiarism Report
                                    </h4>
                                  </div>
                                  <div className="backdrop-blur-sm border border-amber-500/20 rounded-lg p-4 bg-amber-50/30 dark:bg-amber-900/10 shadow-sm hover:shadow-md transition-all duration-300">
                                    <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-amber-500/10">
                                      <div className="p-1.5 rounded-full bg-amber-500/10">
                                        <Percent className="h-4 w-4 text-amber-500" />
                                      </div>
                                      <span className="text-sm font-medium">
                                        Similarity Score:
                                      </span>
                                      <span
                                        className={`text-sm font-bold ${
                                          submission.plagiarismReport.score > 30
                                            ? "text-red-500"
                                            : "text-green-500"
                                        }`}
                                      >
                                        {submission.plagiarismReport.score}%
                                      </span>
                                    </div>

                                    {submission.plagiarismReport.matches
                                      .length > 0 ? (
                                      <div>
                                        <h5 className="text-sm font-medium mb-2 text-amber-600 dark:text-amber-400">
                                          Matches Found:
                                        </h5>
                                        <div className="space-y-2">
                                          {submission.plagiarismReport.matches.map(
                                            (match, index) => (
                                              <div
                                                key={index}
                                                className="backdrop-blur-sm border border-amber-500/10 rounded-lg p-3 bg-white/50 dark:bg-gray-800/50 shadow-sm hover:shadow-md transition-all duration-300"
                                              >
                                                <div className="flex justify-between items-center">
                                                  <span className="text-sm font-medium flex items-center">
                                                    <Link className="h-3 w-3 mr-1.5 text-amber-500" />
                                                    {match.source}
                                                  </span>
                                                  <Badge
                                                    variant="outline"
                                                    className="text-xs bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300"
                                                  >
                                                    {match.similarity}% similar
                                                  </Badge>
                                                </div>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex items-center p-3 rounded-lg bg-green-50/30 dark:bg-green-900/10 border border-green-500/20">
                                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                        <p className="text-sm text-green-600 dark:text-green-400">
                                          No significant matches found.
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 backdrop-blur-sm bg-background/30 border border-dashed border-indigo-500/30 rounded-lg">
                    <div className="p-4 rounded-full bg-indigo-500/10 mx-auto w-fit mb-4">
                      <ClipboardX className="h-10 w-10 text-indigo-500" />
                    </div>
                    <p className="text-muted-foreground mb-2">
                      No submissions yet
                    </p>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      When candidates submit their answers, they will appear
                      here for review.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="mt-6">
            <Card className="backdrop-blur-md bg-background/40 border border-indigo-500/20 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />
              <CardHeader className="relative z-10">
                <CardTitle className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 dark:from-indigo-400 dark:via-purple-400 dark:to-violet-400">
                  Interview Notes
                </CardTitle>
                <CardDescription>
                  Add and manage notes for this interview
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <InterviewNotes interviewId={id as string} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
