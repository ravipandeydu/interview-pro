import { Metadata } from "next";
import InterviewList from "@/components/interviews/InterviewList";

export const metadata: Metadata = {
  title: "Interviews | Interview Pro",
  description: "Manage and schedule your interviews",
};

export default function InterviewsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-900/30 via-background to-violet-900/20 dark:from-indigo-950/50 dark:via-background dark:to-violet-950/40 relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-amber-600/10 rounded-full blur-3xl" />

      <div className="container mx-auto py-8 px-4 relative z-10">
        <InterviewList />
      </div>
    </main>
  );
}
