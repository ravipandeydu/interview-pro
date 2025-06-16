"use client";

import CandidateForm from "@/components/candidates/CandidateForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewCandidatePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-900/10 via-background to-violet-900/10 dark:from-indigo-950/30 dark:via-background dark:to-violet-950/20 relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl animate-blob" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-emerald-600/5 rounded-full blur-3xl animate-blob animation-delay-4000" />

      <div className="container mx-auto py-8 px-4 relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="outline"
            onClick={() => router.push("/candidates")}
            className="backdrop-blur-sm bg-background/50 border-indigo-500/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 transition-all duration-300"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/10 rounded-xl backdrop-blur-sm border border-indigo-500/30">
              <UserPlus className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 dark:from-indigo-400 dark:via-purple-400 dark:to-violet-400">
              Add New Candidate
            </h1>
          </div>
        </div>

        <div className="backdrop-blur-md bg-background/40 border border-indigo-500/20 rounded-xl shadow-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none rounded-xl" />
          <div className="relative z-10 p-1">
            <CandidateForm />
          </div>
        </div>
      </div>
    </main>
  );
}
