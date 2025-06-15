'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuestion, useQuestionOperations } from '../../../hooks/useQuestion';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Skeleton } from '../../../components/ui/skeleton';
import { toast } from 'sonner';
import { Pencil, Trash2, ArrowLeft } from 'lucide-react';
import { useState, use } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../../components/ui/alert-dialog';

export default function QuestionDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const id = use(params).id;
  const { data: question, isLoading } = useQuestion(id as string);
  const { deleteQuestion, isDeleting } = useQuestionOperations();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteQuestion.mutateAsync(id as string);
      toast.success('Question deleted successfully');
      router.push('/questions');
    } catch (error) {
      toast.error('Failed to delete question');
      console.error('Delete question error:', error);
    }
  };

  if (isLoading) {
    return (
      <main className="container mx-auto py-6">
        <Skeleton className="h-8 w-64 mb-6" />
        <Skeleton className="h-[400px] w-full" />
      </main>
    );
  }

  if (!question) {
    return (
      <main className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Question not found</h1>
        <Button onClick={() => router.push('/questions')} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Questions
        </Button>
      </main>
    );
  }

  return (
    <main className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Question Details</h1>
        <div className="flex gap-2">
          <Button onClick={() => router.push('/questions')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button onClick={() => router.push(`/questions/${id}/edit`)} variant="outline">
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </Button>
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the question.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{question.content}</CardTitle>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline">{question.category}</Badge>
            <Badge variant="outline">{question.difficulty}</Badge>
            {question.isActive ? (
              <Badge variant="success">Active</Badge>
            ) : (
              <Badge variant="destructive">Inactive</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {question.expectedAnswer && (
            <div>
              <h3 className="font-semibold mb-1">Expected Answer</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{question.expectedAnswer}</p>
            </div>
          )}
          
          {question.tags && question.tags.length > 0 && (
            <div>
              <h3 className="font-semibold mb-1">Tags</h3>
              <div className="flex flex-wrap gap-1">
                {question.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>
          )}
          
          <div>
            <h3 className="font-semibold mb-1">Created By</h3>
            <p className="text-muted-foreground">
              {question.createdBy?.name || 'Unknown'} ({question.createdBy?.email || 'No email'})
            </p>
          </div>
          
          <div className="flex gap-4">
            <div>
              <h3 className="font-semibold mb-1">Created At</h3>
              <p className="text-muted-foreground">
                {new Date(question.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Updated At</h3>
              <p className="text-muted-foreground">
                {new Date(question.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}