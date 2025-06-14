'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/store/useStore';
import { toast } from 'sonner';
import { CandidateInterview } from '@/pages/CandidateInterview';
import { RecruiterInterview } from '@/pages/RecruiterInterview';

export default function InterviewJoinPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
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
      <div className="container mx-auto py-8 px-4 text-center">
        <p>Loading...</p>
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