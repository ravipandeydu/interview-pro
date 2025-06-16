'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuestion, useQuestionOperations } from '../../../hooks/useQuestion';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Skeleton } from '../../../components/ui/skeleton';
import { toast } from 'sonner';
import { Pencil, Trash2, ArrowLeft, Tag, Calendar, User, Clock } from 'lucide-react';
import { useState, use } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../../components/ui/alert-dialog';

// Color mappings for categories and difficulties
const categoryColors = {
  'Frontend': 'bg-blue-500/20 text-blue-600 dark:text-blue-300 border-blue-500/30',
  'Backend': 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30',
  'DevOps': 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/30',
  'Database': 'bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-500/30',
  'System Design': 'bg-rose-500/20 text-rose-600 dark:text-rose-300 border-rose-500/30',
  'Algorithms': 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border-cyan-500/30',
  'default': 'bg-gray-500/20 text-gray-600 dark:text-gray-300 border-gray-500/30'
};

const difficultyColors = {
  'Easy': 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30',
  'Medium': 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/30',
  'Hard': 'bg-rose-500/20 text-rose-600 dark:text-rose-300 border-rose-500/30',
  'default': 'bg-gray-500/20 text-gray-600 dark:text-gray-300 border-gray-500/30'
};

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

  const getCategoryClass = (category: string) => {
    return categoryColors[category] || categoryColors.default;
  };

  const getDifficultyClass = (difficulty: string) => {
    return difficultyColors[difficulty] || difficultyColors.default;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900/10 via-background to-violet-900/10 dark:from-indigo-950/30 dark:via-background dark:to-violet-950/20 relative overflow-hidden py-6">
        {/* Abstract Background Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-emerald-600/5 rounded-full blur-3xl animate-blob animation-delay-4000" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-10 w-64" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
            
            <Card className="backdrop-blur-md bg-background/40 border border-indigo-500/20 shadow-xl overflow-hidden">
              <CardHeader>
                <Skeleton className="h-8 w-full mb-4" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Skeleton className="h-6 w-40 mb-2" />
                  <Skeleton className="h-24 w-full" />
                </div>
                <div>
                  <Skeleton className="h-6 w-24 mb-2" />
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
                <div>
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-6 w-64" />
                </div>
                <div className="flex gap-4">
                  <div>
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-6 w-48" />
                  </div>
                  <div>
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-6 w-48" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900/10 via-background to-violet-900/10 dark:from-indigo-950/30 dark:via-background dark:to-violet-950/20 relative overflow-hidden py-6">
        {/* Abstract Background Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center justify-center space-y-6 py-12">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-red-600 dark:from-rose-400 dark:to-red-400">Question Not Found</h1>
            <p className="text-muted-foreground text-center max-w-md">The question you're looking for doesn't exist or has been removed.</p>
            <Button 
              onClick={() => router.push('/questions')} 
              variant="outline" 
              className="backdrop-blur-sm bg-background/50 border-indigo-500/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 transition-all duration-300"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Questions
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900/10 via-background to-violet-900/10 dark:from-indigo-950/30 dark:via-background dark:to-violet-950/20 relative overflow-hidden py-6">
      {/* Abstract Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl animate-blob" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-emerald-600/5 rounded-full blur-3xl animate-blob animation-delay-4000" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 dark:from-indigo-400 dark:via-purple-400 dark:to-violet-400">Question Details</h1>
              <p className="text-muted-foreground">View and manage question information</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={() => router.push('/questions')} 
                variant="outline" 
                className="backdrop-blur-sm bg-background/50 border-indigo-500/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 transition-all duration-300"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button 
                onClick={() => router.push(`/questions/${id}/edit`)} 
                variant="outline" 
                className="backdrop-blur-sm bg-background/50 border-purple-500/30 text-purple-600 dark:text-purple-300 hover:bg-purple-50/20 dark:hover:bg-purple-950/20 transition-all duration-300"
              >
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </Button>
              <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    className="backdrop-blur-sm bg-rose-500/80 hover:bg-rose-600/80 text-white border-0 transition-all duration-300"
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="backdrop-blur-md bg-background/80 border border-rose-500/30">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-rose-600 dark:text-rose-400">Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the question.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="backdrop-blur-sm bg-background/50 border-gray-500/30 hover:bg-gray-50/20 dark:hover:bg-gray-900/30 transition-all duration-300">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDelete} 
                      disabled={isDeleting}
                      className="backdrop-blur-sm bg-rose-500/80 hover:bg-rose-600/80 text-white border-0 transition-all duration-300"
                    >
                      {isDeleting ? (
                        <>
                          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent mr-2" />
                          Deleting...
                        </>
                      ) : 'Delete'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <Card className="backdrop-blur-md bg-background/40 border border-indigo-500/20 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />
            <CardHeader className="relative z-10">
              <CardTitle className="text-2xl font-semibold">{question.content}</CardTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge 
                  variant="outline" 
                  className={`px-3 py-1 backdrop-blur-sm ${getCategoryClass(question.category)}`}
                >
                  {question.category}
                </Badge>
                <Badge 
                  variant="outline" 
                  className={`px-3 py-1 backdrop-blur-sm ${getDifficultyClass(question.difficulty)}`}
                >
                  {question.difficulty}
                </Badge>
                {question.isActive ? (
                  <Badge className="px-3 py-1 backdrop-blur-sm bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="px-3 py-1 backdrop-blur-sm">
                    Inactive
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6 relative z-10">
              {question.expectedAnswer && (
                <div className="p-4 rounded-lg backdrop-blur-sm bg-background/30 border border-indigo-500/20 shadow-sm">
                  <h3 className="font-semibold mb-2 flex items-center text-indigo-700 dark:text-indigo-300">
                    <span className="mr-2">Expected Answer</span>
                  </h3>
                  <p className="text-foreground/80 whitespace-pre-wrap">{question.expectedAnswer}</p>
                </div>
              )}
              
              {question.tags && question.tags.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center text-purple-700 dark:text-purple-300">
                    <Tag className="h-4 w-4 mr-2" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {question.tags.map((tag, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="px-3 py-1 backdrop-blur-sm bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/20 hover:bg-purple-500/20 transition-colors"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="p-4 rounded-lg backdrop-blur-sm bg-background/30 border border-indigo-500/20 shadow-sm">
                <h3 className="font-semibold mb-2 flex items-center text-blue-700 dark:text-blue-300">
                  <User className="h-4 w-4 mr-2" />
                  Created By
                </h3>
                <p className="text-foreground/80">
                  {question.createdBy?.name || 'Unknown'} ({question.createdBy?.email || 'No email'})
                </p>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4">
                <div className="p-4 rounded-lg backdrop-blur-sm bg-background/30 border border-indigo-500/20 shadow-sm flex-1">
                  <h3 className="font-semibold mb-2 flex items-center text-emerald-700 dark:text-emerald-300">
                    <Calendar className="h-4 w-4 mr-2" />
                    Created At
                  </h3>
                  <p className="text-foreground/80">
                    {new Date(question.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="p-4 rounded-lg backdrop-blur-sm bg-background/30 border border-indigo-500/20 shadow-sm flex-1">
                  <h3 className="font-semibold mb-2 flex items-center text-amber-700 dark:text-amber-300">
                    <Clock className="h-4 w-4 mr-2" />
                    Updated At
                  </h3>
                  <p className="text-foreground/80">
                    {new Date(question.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}