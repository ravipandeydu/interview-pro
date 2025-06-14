'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CandidateInterview } from '@/pages/CandidateInterview';

interface InterviewPageProps {
  params: {
    token: string;
  };
}

export default function InterviewPage({ params }: InterviewPageProps) {
  const { token } = params;
  const router = useRouter();

  // Validate token format to prevent unnecessary API calls
  useEffect(() => {
    if (!token || typeof token !== 'string' || token.length < 10) {
      router.push('/'); // Redirect to home if token is invalid
    }
  }, [token, router]);

  if (!token) {
    return null; // Will redirect in useEffect
  }

  return <CandidateInterview token={token} />;
}