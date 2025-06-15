'use client';

import { useParams } from 'next/navigation';
import CandidateForm from '../../../../components/candidates/CandidateForm';
import { useCandidate } from '../../../../hooks/useCandidate';
import { Skeleton } from '../../../../components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { ArrowLeft, User, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function EditCandidatePage() {
  const params = useParams();
  const router = useRouter();
  // Use React.use() to unwrap the params Promise
  const paramsData = React.use(params);
  const candidateId = paramsData.id as string;
  const { getCandidate } = useCandidate();
  const { data: candidate, isLoading, isError } = getCandidate(candidateId);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-indigo-900/10 via-background to-violet-900/10 dark:from-indigo-950/30 dark:via-background dark:to-violet-950/20 relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-emerald-600/5 rounded-full blur-3xl animate-blob animation-delay-4000" />
        
        <div className="container mx-auto py-8 px-4 relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-indigo-500/10 rounded-xl backdrop-blur-sm border border-indigo-500/30">
              <User className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 dark:from-indigo-400 dark:via-purple-400 dark:to-violet-400">
              Edit Candidate
            </h1>
          </div>
          
          <Card className="backdrop-blur-md bg-background/40 border border-indigo-500/20 shadow-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />
            <CardContent className="p-6 relative z-10">
              <div className="space-y-6">
                <Skeleton className="h-8 w-1/3 bg-indigo-500/10" />
                <Skeleton className="h-12 w-full bg-indigo-500/10" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-24 bg-indigo-500/10" />
                      <Skeleton className="h-10 w-full bg-indigo-500/10" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  if (isError || !candidate) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-indigo-900/10 via-background to-violet-900/10 dark:from-indigo-950/30 dark:via-background dark:to-violet-950/20 relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-rose-600/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
        
        <div className="container mx-auto py-8 px-4 relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <Button 
              variant="outline" 
              onClick={() => router.push('/candidates')}
              className="backdrop-blur-sm bg-background/50 border-indigo-500/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 transition-all duration-300"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 dark:from-indigo-400 dark:via-purple-400 dark:to-violet-400">
              Edit Candidate
            </h1>
          </div>
          
          <Card className="backdrop-blur-md bg-background/40 border border-rose-500/20 shadow-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-red-500/5 pointer-events-none" />
            <CardHeader className="relative z-10">
              <CardTitle className="text-xl font-semibold text-rose-950 dark:text-rose-100 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" /> Error
              </CardTitle>
              <CardDescription className="text-rose-700/70 dark:text-rose-300/70">
                Failed to load candidate data
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <p>There was an error loading the candidate information. Please try again later.</p>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

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
            onClick={() => router.push(`/candidates/${candidateId}`)}
            className="backdrop-blur-sm bg-background/50 border-indigo-500/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 transition-all duration-300"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 dark:from-indigo-400 dark:via-purple-400 dark:to-violet-400">
            Edit Candidate
          </h1>
        </div>
        
        <div className="backdrop-blur-md bg-background/40 border border-indigo-500/20 rounded-xl shadow-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none rounded-xl" />
          <div className="relative z-10 p-1">
            <CandidateForm candidate={candidate} isEditing={true} />
          </div>
        </div>
      </div>
    </main>
  );
}