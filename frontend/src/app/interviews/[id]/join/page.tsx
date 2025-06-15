'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/store/useStore';
import { toast } from 'sonner';
import { CandidateInterview } from '@/pages/CandidateInterview';
import { RecruiterInterview } from '@/pages/RecruiterInterview';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function InterviewJoinPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const id = use(params).id;
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  
  // Check if user is authenticated
  useEffect(() => {
    if (!user) {
      toast.error('You must be logged in to access this page');
      router.push('/login');
      return;
    }
    
    setIsLoading(false);
  }, [user, router]);
  
  if (isLoading) {
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
              Preparing Your Interview
            </h3>
            <p className="text-lg font-medium">Setting up your session...</p>
            <p className="text-sm text-muted-foreground mt-2">This may take a few moments</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Render different interfaces based on user role
  if (user?.role === 'RECRUITER' || user?.role === 'ADMIN') {
    return <RecruiterInterview interviewId={id as string} />;
  } else {
    // For candidates, redirect to the candidate interview page
    // This is just a fallback, candidates should normally access via token
    return <CandidateInterview token={id as string} />;
  }
}