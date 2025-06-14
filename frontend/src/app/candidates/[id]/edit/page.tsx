'use client';

import { Metadata } from 'next';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import CandidateForm from '../../../../components/candidates/CandidateForm';
import { useCandidate } from '../../../../hooks/useCandidate';
import { Skeleton } from '../../../../components/ui/skeleton';
import { Card, CardContent } from '../../../../components/ui/card';
import React from 'react';

export default function EditCandidatePage() {
  const params = useParams();
  // Use React.use() to unwrap the params Promise
  const paramsData = React.use(params);
  const candidateId = paramsData.id as string;
  const { getCandidate } = useCandidate();
  const { data: candidate, isLoading, isError } = getCandidate(candidateId);

  if (isLoading) {
    return (
      <main className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Edit Candidate</h1>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (isError || !candidate) {
    return (
      <main className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Edit Candidate</h1>
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          <p>Error loading candidate data. Please try again later.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Edit Candidate</h1>
      <CandidateForm candidate={candidate} isEditing={true} />
    </main>
  );
}