import { Metadata } from "next";
import CandidateList from "../../components/candidates/CandidateList";

export const metadata: Metadata = {
  title: "Candidates | Interview Pro",
  description: "Manage your candidates",
};

export default function CandidatesPage() {
  return (
    <main className="flex-1 min-h-screen bg-gradient-to-br from-indigo-900/10 via-background to-violet-900/10 dark:from-indigo-950/30 dark:via-background dark:to-violet-950/20 relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl animate-blob" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-emerald-600/5 rounded-full blur-3xl animate-blob animation-delay-4000" />

      <div className="container mx-auto py-8 px-4 relative z-10">
        <CandidateList />
      </div>
    </main>
  );
}
