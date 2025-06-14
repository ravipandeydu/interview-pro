'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useInterview, useInterviewOperations, useInterviewSubmissions } from '@/hooks/useInterview';
import { useAuth } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Calendar, Clock, User, FileText, Edit, Trash2, Share2, Copy, Plus, X } from 'lucide-react';
import { QuestionSelector } from '@/components/questions/QuestionSelector';
import { format } from 'date-fns';

export default function InterviewDetailsPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('details');
  const [showQuestionSelector, setShowQuestionSelector] = useState(false);
  
  // Fetch interview data
  const { data: interview, isLoading: isLoadingInterview } = useInterview(id as string);
  
  // Fetch submissions
  const { data: submissions, isLoading: isLoadingSubmissions } = useInterviewSubmissions(id as string);
  
  // Interview operations
  const { 
    updateInterview, 
    deleteInterview, 
    addQuestionsToInterview,
    removeQuestionFromInterview,
    isUpdating, 
    isDeleting,
    isAddingQuestionsToInterview,
    isRemovingQuestionFromInterview
  } = useInterviewOperations();
  
  // Handle interview deletion
  const handleDeleteInterview = () => {
    if (!id) return;
    
    deleteInterview(id as string, {
      onSuccess: () => {
        toast.success('Interview deleted successfully');
        router.push('/dashboard');
      },
      onError: (error) => {
        toast.error('Failed to delete interview');
        console.error('Delete interview error:', error);
      },
    });
  };
  
  // Handle copy interview link
  const handleCopyLink = () => {
    const link = `${window.location.origin}/interviews/${id}/join`;
    navigator.clipboard.writeText(link);
    toast.success('Interview link copied to clipboard');
  };

  // Handle adding questions to interview
  const handleAddQuestions = (questions: Array<{ questionId: string }>) => {
    if (!id) return;
    
    addQuestionsToInterview(
      { 
        interviewId: id as string, 
        questions 
      },
      {
        onSuccess: () => {
          toast.success('Questions added successfully');
          setShowQuestionSelector(false);
        },
        onError: (error) => {
          toast.error('Failed to add questions');
          console.error('Add questions error:', error);
        },
      }
    );
  };

  // Handle removing a question from interview
  const handleRemoveQuestion = (questionId: string) => {
    if (!id) return;
    
    removeQuestionFromInterview(
      { 
        interviewId: id as string, 
        questionId 
      },
      {
        onSuccess: () => {
          toast.success('Question removed successfully');
        },
        onError: (error) => {
          toast.error('Failed to remove question');
          console.error('Remove question error:', error);
        },
      }
    );
  };
  
  if (isLoadingInterview) {
    return (
      <div className="container py-10">
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">Loading interview details...</p>
        </div>
      </div>
    );
  }
  
  if (!interview) {
    return (
      <div className="container py-10">
        <div className="flex justify-center items-center h-64">
          <p className="text-destructive">Interview not found</p>
        </div>
      </div>
    );
  }

  console.log(interview, "interview")
  
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">{interview.title}</h1>
          <p className="text-muted-foreground mt-1">{interview.description}</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCopyLink}>
            <Copy className="h-4 w-4 mr-2" />
            Copy Link
          </Button>
          
          <Button variant="outline" onClick={() => router.push(`/interviews/${id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the interview
                  and all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteInterview}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className="text-base font-medium">{interview.status}</Badge>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Scheduled Date</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{interview.scheduledDate ? format(new Date(interview.scheduledDate), 'PPP') : 'Not scheduled'}</span>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Duration</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{interview.duration} minutes</span>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Interview Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">Candidate</h3>
                <div className="flex items-center mt-1">
                  <User className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>
                    {interview.candidateId ? interview.candidate?.fullName : 'No candidate assigned'}
                  </span>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium">Recruiter</h3>
                <div className="flex items-center mt-1">
                  <User className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>
                    {interview.recruiterId ? interview.recruiter?.name : 'No recruiter assigned'}
                  </span>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium">Description</h3>
                <p className="mt-1">{interview.description || 'No description provided'}</p>
              </div>
            </CardContent>
          </Card>
          
          {interview.instructions && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{interview.instructions}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="questions" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Questions</CardTitle>
                <CardDescription>
                  This interview contains {interview.questions?.length || 0} questions
                </CardDescription>
              </div>
              <Button onClick={() => setShowQuestionSelector(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Questions
              </Button>
            </CardHeader>
            <CardContent>
              {showQuestionSelector ? (
                <QuestionSelector
                  interviewId={id as string}
                  onAddQuestions={handleAddQuestions}
                  existingQuestionIds={interview.questions?.map(q => q.id) || []}
                  onCancel={() => setShowQuestionSelector(false)}
                />
              ) : (
                <div className="space-y-6">
                  {interview.questions?.map((question, index) => (
                    <div key={question.id} className="space-y-2">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-medium">
                          {index + 1}. {question.question.content}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Badge>{question.question.category}</Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveQuestion(question.question.id)}
                            disabled={isRemovingQuestionFromInterview}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {question.question.difficulty} • {question?.question?.points} points
                      </p>
                      <p className="mt-2">{question.description}</p>
                      
                      {index < (interview.questions?.length || 0) - 1 && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  ))}
                  
                  {(!interview.questions || interview.questions.length === 0) && (
                    <p className="text-muted-foreground">No questions have been added to this interview.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="submissions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Submissions</CardTitle>
              <CardDescription>
                View candidate submissions for this interview
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingSubmissions ? (
                <p className="text-muted-foreground">Loading submissions...</p>
              ) : submissions && submissions.length > 0 ? (
                <div className="space-y-4">
                  {submissions.map((submission) => (
                    <div key={submission.id} className="border rounded-md p-4">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium">
                          {interview.questions?.find(q => q.id === submission.questionId)?.title || 'Unknown Question'}
                        </h3>
                        <Badge>{submission.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Submitted: {new Date(submission.createdAt).toLocaleString()}
                      </p>
                      <div className="mt-2">
                        <h4 className="text-sm font-medium">Answer:</h4>
                        <pre className="mt-1 p-2 bg-muted rounded-md overflow-x-auto">
                          {submission.answer}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No submissions yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}