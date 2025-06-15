'use client';

import { useParams } from 'next/navigation';
import { use } from 'react';
import { useQuestion } from '../../../../hooks/useQuestion';
import QuestionForm from '../../../../components/questions/QuestionForm';
import { Skeleton } from '../../../../components/ui/skeleton';

export default function EditQuestionPage({ params }: { params: { id: string } }) {
  const id = use(params).id;
  const { data: question, isLoading } = useQuestion(id as string);

  if (isLoading) {
    return (
      <main className="container mx-auto py-6 px-4 sm:px-6 relative">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
          <div className="relative">
            {/* Abstract Background Elements for loading state */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/5 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl animate-pulse" />
            
            <div className="backdrop-blur-md bg-background/60 border border-indigo-500/10 shadow-xl rounded-lg p-6 relative z-10">
              <div className="space-y-6">
                <Skeleton className="h-32 w-full" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-16 w-full" />
                <div className="flex justify-end gap-4">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-36" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto py-6 px-4 sm:px-6 relative">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 dark:from-indigo-400 dark:via-purple-400 dark:to-violet-400 inline-block">
            Edit Question
          </h1>
          <p className="text-foreground/70 mt-1">
            Update the details of your interview question
          </p>
        </div>
        {question && <QuestionForm question={question} isEditing={true} />}
      </div>
    </main>
  );
}