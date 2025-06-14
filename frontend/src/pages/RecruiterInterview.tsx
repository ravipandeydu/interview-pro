'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useInterview, useInterviewOperations, useInterviewSubmissions } from '@/hooks/useInterview';
import { useAuth } from '@/store/useStore';
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { VideoChat } from '@/components/VideoChat';
import { format } from 'date-fns';
import { CodeEditor } from '@/components/CodeEditor';

interface RecruiterInterviewProps {
  interviewId: string;
}

export const RecruiterInterview = ({ interviewId }: RecruiterInterviewProps) => {
  const router = useRouter();
  const { user } = useAuth();
  
  // Fetch interview data
  const { data: interview, isLoading: isLoadingInterview, error: interviewError } = useInterview(interviewId);
  
  // Fetch submissions
  const { data: submissions, isLoading: isLoadingSubmissions } = useInterviewSubmissions(interviewId);
  
  // Interview operations
  const { joinInterview, isJoiningInterview } = useInterviewOperations();
  
  // State
  const [activeTab, setActiveTab] = useState('overview');
  const [joinedInterview, setJoinedInterview] = useState(false);
  
  // Join the interview when component mounts
  useEffect(() => {
    if (interviewId && !isLoadingInterview && !interviewError && interview) {
      joinInterview(interviewId, {
        onSuccess: () => {
          setJoinedInterview(true);
          toast.success('Successfully joined the interview as a recruiter');
        },
        onError: (error) => {
          toast.error('Failed to join the interview');
          console.error('Join interview error:', error);
        },
      });
    }
  }, [interviewId, interview, isLoadingInterview, interviewError, joinInterview]);
  
  // Format date
  const formatDate = (dateString: string | Date) => {
    return format(new Date(dateString), 'PPP p');
  };
  
  // Loading state
  if (isLoadingInterview || isLoadingSubmissions) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <p>Loading interview data...</p>
      </div>
    );
  }
  
  // Error state
  if (interviewError || !interview) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            Error loading interview. Please try again.
          </AlertDescription>
        </Alert>
        <Button onClick={() => router.push('/interviews')}>
          Back to Interviews
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-4 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{interview.title}</h1>
          <p className="text-muted-foreground">
            {interview.status} • Scheduled for {formatDate(interview.scheduledDate)}
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => router.push(`/interviews/${interviewId}`)}
        >
          Back to Details
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Video chat */}
          <Card>
            <CardHeader>
              <CardTitle>Video Interview</CardTitle>
              <CardDescription>Connect with the candidate</CardDescription>
            </CardHeader>
            <CardContent>
              <VideoChat interviewId={interviewId} userRole={user?.role} />
            </CardContent>
          </Card>
          
          {/* Interview info */}
          <Card>
            <CardHeader>
              <CardTitle>Interview Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm font-medium">Candidate</p>
                <p>{interview.candidate?.name || 'Not assigned'}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Duration</p>
                <p>{interview.duration} minutes</p>
              </div>
              <div>
                <p className="text-sm font-medium">Questions</p>
                <p>{interview.questions.length} questions</p>
              </div>
              <div>
                <p className="text-sm font-medium">Status</p>
                <Badge variant={interview.status === 'COMPLETED' ? 'success' : 'default'}>
                  {interview.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main content */}
        <div className="lg:col-span-2">
          <Card>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
            <CardHeader>
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="questions">Questions</TabsTrigger>
                  <TabsTrigger value="submissions">Submissions</TabsTrigger>
                </TabsList>
            </CardHeader>
            <CardContent>
              <TabsContent value="overview" className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Interview Description</h3>
                  <p className="mt-1">{interview.description}</p>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium">Progress</h3>
                  <div className="mt-2">
                    <Progress 
                      value={submissions?.length ? (submissions.length / interview.questions.length) * 100 : 0} 
                      className="h-2"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      {submissions?.length || 0} of {interview.questions.length} questions answered
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="questions" className="space-y-4">
                {interview.questions.map((question, index) => (
                  <Card key={question.id}>
                    <CardHeader>
                      <div className="flex justify-between">
                        <CardTitle>Question {index + 1}</CardTitle>
                        <Badge>{question.type}</Badge>
                      </div>
                      <CardDescription>
                        {question.difficulty} • {question.points} points • {question.timeLimit} min
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>{question.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
              
              <TabsContent value="submissions" className="space-y-4">
                {submissions && submissions.length > 0 ? (
                  submissions.map((submission) => {
                    const question = interview.questions.find(q => q.id === submission.questionId);
                    return (
                      <Card key={submission.id}>
                        <CardHeader>
                          <div className="flex justify-between">
                            <CardTitle>{question?.title || 'Question'}</CardTitle>
                            <Badge variant="outline">
                              {new Date(submission.submittedAt).toLocaleString()}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="mb-4">
                            <h4 className="text-sm font-medium mb-1">Candidate's Answer:</h4>
                            {question?.type === 'coding' ? (
                              <div className="rounded-md">
                                <CodeEditor
                                  value={submission.answer}
                                  language={submission.language || 'javascript'}
                                  readOnly={true}
                                  height="200px"
                                  onChange={() => {}}
                                />
                              </div>
                            ) : (
                              <div className="bg-muted p-3 rounded-md">
                                {submission.answer}
                              </div>
                            )}
                          </div>
                          
                          {submission.feedback && (
                            <div>
                              <h4 className="text-sm font-medium mb-1">Your Feedback:</h4>
                              <div className="bg-muted p-3 rounded-md">
                                {submission.feedback}
                              </div>
                            </div>
                          )}
                        </CardContent>
                        <CardFooter>
                          <Button variant="outline" className="w-full">
                            Add Feedback
                          </Button>
                        </CardFooter>
                      </Card>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No submissions yet</p>
                  </div>
                )}
              </TabsContent>
            </CardContent>
              </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
};