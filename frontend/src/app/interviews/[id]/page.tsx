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
import { Calendar, Clock, User, FileText, Edit, Trash2, Share2, Copy } from 'lucide-react';

export default function InterviewDetailsPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('details');
  
  // Fetch interview data
  const { data: interview, isLoading: isLoadingInterview } = useInterview(id as string);
  
  // Fetch submissions
  const { data: submissions, isLoading: isLoadingSubmissions } = useInterviewSubmissions(id as string);
  
  // Interview operations
  const { updateInterview, deleteInterview, isUpdating, isDeleting } = useInterviewOperations();
  
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
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  // Format time
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // Loading state
  if (isLoadingInterview || isLoadingSubmissions) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <p>Loading interview details...</p>
      </div>
    );
  }
  
  // Error state
  if (!interview) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <p className="text-red-500">Interview not found or you don't have permission to view it.</p>
        <Button className="mt-4" onClick={() => router.push('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500">Completed</Badge>;
      case 'scheduled':
        return <Badge variant="outline" className="text-blue-500 border-blue-500">Scheduled</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{interview.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            {getStatusBadge(interview.status)}
            <span className="text-muted-foreground">
              Created on {new Date(interview.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleCopyLink}
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy Link
          </Button>
          {interview.status === 'scheduled' && (
            <Button
              onClick={() => router.push(`/interviews/${id}/join`)}
            >
              Join Interview
            </Button>
          )}
          {interview.status === 'completed' && (
            <Button
              onClick={() => router.push(`/submissions/${id}/results`)}
            >
              View Results
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Interview Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formatDate(interview.scheduledAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{formatTime(interview.scheduledAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>
                  {interview.candidate ? interview.candidate.name : 'No candidate assigned'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>{interview.questions?.length || 0} Questions</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={() => router.push(`/interviews/${id}/edit`)}
                  disabled={interview.status === 'completed'}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Interview
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleCopyLink}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Interview
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      className="w-full justify-start"
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Interview
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the
                        interview and all associated data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDeleteInterview}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <div>
          <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="questions">Questions</TabsTrigger>
              {interview.status === 'completed' && (
                <TabsTrigger value="submissions">Submissions</TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="details" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Interview Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{interview.description || 'No description provided.'}</p>
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
                <CardHeader>
                  <CardTitle>Questions</CardTitle>
                  <CardDescription>
                    This interview contains {interview.questions?.length || 0} questions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {interview.questions?.map((question, index) => (
                      <div key={question.id} className="space-y-2">
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-medium">
                            {index + 1}. {question.title}
                          </h3>
                          <Badge>{question.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {question.difficulty} • {question.points} points
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
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="submissions" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Submissions</CardTitle>
                  <CardDescription>
                    Answers submitted during the interview
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {submissions?.map((submission) => {
                      const question = interview.questions?.find(q => q.id === submission.questionId);
                      return (
                        <div key={submission.id} className="space-y-2">
                          <div className="flex justify-between items-start">
                            <h3 className="text-lg font-medium">
                              {question?.title || 'Unknown Question'}
                            </h3>
                            <Badge
                              variant={submission.executionResult?.passed ? 'default' : 'destructive'}
                            >
                              {submission.executionResult?.passed ? 'Passed' : 'Failed'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Submitted on {new Date(submission.createdAt).toLocaleString()}
                          </p>
                          
                          {submission.aiAnalysis && (
                            <div className="mt-2">
                              <span className="text-sm font-medium">AI Score:</span>{' '}
                              <span className={submission.aiAnalysis.score >= 70 ? 'text-green-500' : 'text-red-500'}>
                                {submission.aiAnalysis.score}/100
                              </span>
                            </div>
                          )}
                          
                          {index < (submissions?.length || 0) - 1 && (
                            <Separator className="mt-4" />
                          )}
                        </div>
                      );
                    })}
                    
                    {(!submissions || submissions.length === 0) && (
                      <p className="text-muted-foreground">No submissions found for this interview.</p>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={() => router.push(`/submissions/${id}/results`)}
                    className="w-full"
                  >
                    View Detailed Results
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}