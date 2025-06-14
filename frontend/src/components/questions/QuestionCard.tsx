'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Question } from '@/services/questionService';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { useQuestionOperations } from '@/hooks/useQuestion';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface QuestionCardProps {
  question: Question;
}

export function QuestionCard({ question }: QuestionCardProps) {
  const router = useRouter();
  const { deleteQuestion } = useQuestionOperations();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteQuestion.mutateAsync(question.id);
      toast.success('Question Deleted', {
        description: 'The question has been successfully deleted.',
      });
    } catch (error) {
      console.error('Failed to delete question:', error);
      toast.error('Error', {
        description: 'Failed to delete question. Please try again.',
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <Card className={`overflow-hidden ${!question.isActive ? 'opacity-60' : ''}`}>
        <CardContent className="p-6">
          <div className="flex justify-between items-start gap-4">
            <h3 className="text-lg font-medium">{question.content}</h3>
            <div className="flex flex-col gap-2 items-end">
              <Badge>{question.category}</Badge>
              <Badge variant="secondary">{question.difficulty}</Badge>
              {!question.isActive && (
                <Badge variant="outline" className="text-muted-foreground">
                  Inactive
                </Badge>
              )}
            </div>
          </div>

          {question.expectedAnswer && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground font-medium">Expected Answer:</p>
              <p className="text-sm mt-1">{question.expectedAnswer}</p>
            </div>
          )}

          {question.tags && question.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1">
              {question.tags.map((tag, index) => (
                <span
                  key={index}
                  className="text-xs bg-secondary px-1.5 py-0.5 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-4 text-xs text-muted-foreground">
            Created {new Date(question.createdAt).toLocaleDateString()}
            {question.createdBy && ` by ${question.createdBy.name}`}
          </div>
        </CardContent>

        <CardFooter className="px-6 py-4 bg-muted/40 flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/questions/${question.id}`)}
          >
            <Eye className="h-4 w-4 mr-1" /> View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/questions/${question.id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-1" /> Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-1" /> Delete
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Question</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this question? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}