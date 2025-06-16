"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/store/useStore";
import { toast } from "sonner";
import { CandidateInterview } from "@/components/CandidateInterview";
import RecruiterInterview from "@/components/RecruiterInterview";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function InterviewJoinPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const id = use(params).id;
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated
  useEffect(() => {
    if (!user) {
      toast.error("You must be logged in to access this page");
      router.push("/login");
      return;
    }

    setIsLoading(false);
  }, [user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900/30 via-background to-violet-900/20 dark:from-indigo-950/50 dark:via-background dark:to-violet-950/40 relative overflow-hidden flex items-center justify-center">
        {/* Abstract Background Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-amber-600/10 rounded-full blur-3xl" />

        <Card className="w-full max-w-md border border-indigo-500/20 bg-background/40 backdrop-blur-xl shadow-lg relative z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 z-0" />
          <CardContent className="flex flex-col items-center justify-center p-10 text-center relative z-10">
            <div className="rounded-full bg-background/80 p-3 backdrop-blur-sm border border-indigo-500/20 shadow-lg mb-6">
              <Loader2 className="h-10 w-10 animate-spin text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 mb-2">
              Preparing Your Interview
            </h3>
            <p className="text-lg font-medium">Setting up your session...</p>
            <p className="text-sm text-muted-foreground mt-2">
              This may take a few moments
            </p>

            <Button
              variant="outline"
              onClick={() => router.back()}
              className="mt-6 backdrop-blur-sm bg-background/50 border-indigo-500/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 transition-all duration-300"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Interview Details
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render different interfaces based on user role
  if (user?.role === "RECRUITER" || user?.role === "ADMIN") {
    return <RecruiterInterview interviewId={id as string} />;
  } else {
    // For candidates, redirect to the candidate interview page
    // This is just a fallback, candidates should normally access via token
    return <CandidateInterview token={id as string} />;
  }
}
