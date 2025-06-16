'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Question } from '@/services/questionService';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, Loader2 } from 'lucide-react';
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

// Category and difficulty colors mapping
const categoryColors: Record<string, string> = {
  'TECHNICAL': 'bg-blue-500/20 text-blue-600 dark:text-blue-300 border-blue-500/30',
  'BEHAVIORAL': 'bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-500/30',
  'SITUATIONAL': 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30',
  'EXPERIENCE': 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/30',
  'CULTURAL_FIT': 'bg-rose-500/20 text-rose-600 dark:text-rose-300 border-rose-500/30',
  'PROBLEM_SOLVING': 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border-cyan-500/30',
};

const difficultyColors: Record<string, string> = {
  'EASY': 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30',
  'MEDIUM': 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/30',
  'HARD': 'bg-orange-500/20 text-orange-600 dark:text-orange-300 border-orange-500/30',
  'EXPERT': 'bg-rose-500/20 text-rose-600 dark:text-rose-300 border-rose-500/30',
};

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

  const categoryColor = categoryColors[question.category] || 'bg-gray-500/20 text-gray-600 dark:text-gray-300 border-gray-500/30';
  const difficultyColor = difficultyColors[question.difficulty] || 'bg-gray-500/20 text-gray-600 dark:text-gray-300 border-gray-500/30';

  return (
    <>
      <Card className={`overflow-hidden backdrop-blur-md bg-background/40 border border-indigo-500/20 shadow-lg hover:shadow-xl transition-all duration-300 ${!question.isActive ? 'opacity-60' : ''}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />
        
        <CardContent className="p-6 relative z-10">
          <div className="flex justify-between items-start gap-4">
            <h3 className="text-lg font-medium">{question.content}</h3>
            <div className="flex flex-col gap-2 items-end">
              <Badge variant="outline" className={categoryColor}>
                {question.category}
              </Badge>
              <Badge variant="outline" className={difficultyColor}>
                {question.difficulty}
              </Badge>
              {!question.isActive && (
                <Badge variant="outline" className="bg-gray-500/20 text-gray-600 dark:text-gray-300 border-gray-500/30">
                  Inactive
                </Badge>
              )}
            </div>
          </div>

          {question.expectedAnswer && (
            <div className="mt-4 bg-background/30 p-3 rounded-lg border border-indigo-500/10">
              <p className="text-sm text-muted-foreground font-medium">Expected Answer:</p>
              <p className="text-sm mt-1">{question.expectedAnswer}</p>
            </div>
          )}

          {question.tags && question.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {question.tags.map((tag, index) => (
                <span
                  key={index}
                  className="text-xs bg-background/50 border border-indigo-500/20 px-2 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-4 text-xs text-muted-foreground flex items-center">
            <span className="inline-block w-2 h-2 rounded-full bg-indigo-500/50 mr-2"></span>
            Created {new Date(question.createdAt).toLocaleDateString()}
            {question.createdBy && ` by ${question.createdBy.name}`}
          </div>
        </CardContent>

        <CardFooter className="px-6 py-4 bg-muted/40 flex justify-end gap-2 relative z-10 border-t border-indigo-500/10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/questions/${question.id}`)}
            className="hover:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300"
          >
            <Eye className="h-4 w-4 mr-1" /> View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/questions/${question.id}/edit`)}
            className="hover:bg-purple-500/10 text-purple-700 dark:text-purple-300"
          >
            <Edit className="h-4 w-4 mr-1" /> Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="hover:bg-rose-500/10 text-rose-700 dark:text-rose-300"
          >
            <Trash2 className="h-4 w-4 mr-1" /> Delete
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="backdrop-blur-md bg-background/80 border border-red-500/20">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Question</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this question? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="border-gray-500/30">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 flex items-center gap-2"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}