'use client';

import { useParams } from 'next/navigation';
import { use } from 'react';
import { useQuestion } from '../../../../hooks/useQuestion';
import QuestionForm from '../../../../components/questions/QuestionForm';
import { Skeleton } from '../../../../components/ui/skeleton';

export default function EditQuestionPage({ params }: { params: { id: string } }) {
  const id = use(params).id;
  console.log(id, "idddddddddd")
  const { data: question, isLoading } = useQuestion(id as string);

  if (isLoading) {
    return (
      <main className="container mx-auto py-6">
        <Skeleton className="h-8 w-64 mb-6" />
        <Skeleton className="h-[600px] w-full" />
      </main>
    );
  }

  return (
    <main className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Edit Question</h1>
      {question && <QuestionForm question={question} isEditing={true} />}
    </main>
  );
}