'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import candidateAccessService from '../services/candidateAccessService';
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
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CodeEditor } from '@/components/CodeEditor';
import { VideoChat } from '@/components/VideoChat';
import { InterviewNotes } from '@/components/interviews/InterviewNotes';

const QuestionCard = ({ children, className, ...props }: React.ComponentProps<typeof Card>) => (
  <Card className={`mb-6 shadow-md ${className}`} {...props}>
    {children}
  </Card>
);

interface CandidateInterviewProps {
  token: string;
}

export const CandidateInterview = ({ token }: CandidateInterviewProps) => {
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [interview, setInterview] = useState<candidateAccessService.CandidateInterview | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);

  console.log(interview, "interview")
  
  // Fetch interview details using the token
  useEffect(() => {
    const fetchInterview = async () => {
      try {
        setLoading(true);
        const interviewData = await candidateAccessService.getInterviewByToken(token);
        setInterview(interviewData);
        
        // Initialize responses object
        const initialResponses: Record<string, string> = {};
        interviewData.questions.forEach(q => {
          initialResponses[q.id] = '';
        });
        setResponses(initialResponses);
        
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load interview');
        setLoading(false);
      }
    };
    
    if (token) {
      fetchInterview();
    }
  }, [token]);
  
  // Start the interview
  const handleStart = async () => {
    try {
      await candidateAccessService.startInterview(token);
      setStarted(true);
      
      // Set timer if interview has a time limit
      if (interview?.timeLimit) {
        const endTime = new Date();
        endTime.setMinutes(endTime.getMinutes() + interview.timeLimit);
        
        const intervalId = setInterval(() => {
          const now = new Date();
          const diff = endTime - now;
          
          if (diff <= 0) {
            clearInterval(intervalId);
            handleSubmit();
          } else {
            const minutes = Math.floor(diff / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            setTimeRemaining(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
          }
        }, 1000);
        
        return () => clearInterval(intervalId);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to start interview');
    }
  };
  
  // Handle response changes
  const handleResponseChange = (questionId: string, value: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };
  
  // Handle code editor language change
  const handleLanguageChange = (questionId: string, language: string) => {
    setSelectedLanguage(prev => ({
      ...prev,
      [questionId]: language
    }));
  };
  
  // Determine if the current question is a coding question
  const isCodingQuestion = (question: candidateAccessService.InterviewQuestion) => {
    return question.question.category === 'TECHNICAL' || question.question.category === 'CODING';
  };
  
  // State for selected programming language
  const [selectedLanguage, setSelectedLanguage] = useState<Record<string, string>>({});
  
  // Submit a response for the current question
  const handleQuestionSubmit = async () => {
    if (!interview) return;
    
    const currentQuestion = interview.questions[currentQuestionIndex];
    const isCoding = isCodingQuestion(currentQuestion);
    
    try {
      await candidateAccessService.submitResponse(
        token, 
        currentQuestion.id, 
        responses[currentQuestion.id] || '',
        isCoding ? selectedLanguage[currentQuestion.id] || 'javascript' : undefined
      );
      
      if (currentQuestionIndex < interview.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        setConfirmDialogOpen(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit response');
    }
  };
  
  // Complete the interview
  const handleSubmit = async () => {
    try {
      await candidateAccessService.completeInterview(token);
      setCompleted(true);
      setConfirmDialogOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to complete interview');
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto py-4 px-4">
        <div className="flex justify-center items-center min-h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto py-4 px-4">
        <Card className="my-8">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{error}</p>
            <Button 
              variant="default" 
              onClick={() => router.push('/')} 
              className="mt-4"
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (completed) {
    return (
      <div className="container mx-auto py-4 px-4">
        <Card className="my-8">
          <CardHeader>
            <CardTitle className="text-primary">Interview Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-6 bg-muted/50 rounded-md text-center">
              <p className="mb-6">
                Thank you for completing the interview. Your responses have been submitted successfully.
              </p>
              <Button 
                variant="default" 
                onClick={() => router.push('/')} 
                className="mt-4"
              >
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!interview) {
    return (
      <div className="container mx-auto py-4 px-4">
        <Card className="my-8">
          <CardHeader>
            <CardTitle className="text-red-600">Interview Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="my-4">
              <AlertDescription>Interview not found or access has expired.</AlertDescription>
            </Alert>
            <Button 
              variant="default" 
              onClick={() => router.push('/')} 
              className="mt-4"
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!started) {
    return (
      <div className="container mx-auto py-4 px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">{interview.title}</h1>
            <p className="text-muted-foreground">{interview.description}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Interview Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Position</p>
                    <p>{interview.position}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Questions</p>
                    <p>{interview.questions.length}</p>
                  </div>
                  {interview.timeLimit && (
                    <div>
                      <p className="text-sm font-medium">Time Limit</p>
                      <p>{interview.timeLimit} minutes</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Ready to Begin?</CardTitle>
                <CardDescription>
                  Once you start the interview, the timer will begin and you'll be able to see and answer all questions.
                  Make sure you're in a quiet environment with a stable internet connection before starting.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-6 bg-muted/50 rounded-md text-center">
                  <p className="mb-4">Click the button below when you're ready to start the interview.</p>
                  <Button onClick={handleStart} size="lg">Start Interview</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }
  
  const currentQuestion = interview.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / interview.questions.length) * 100;

  console.log(interview, currentQuestion, "interview")
  
  return (
    <div className="container mx-auto py-4 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{interview.title}</h1>
          <p className="text-muted-foreground">
            {interview.description}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left sidebar - Video chat */}
        <div className="lg:col-span-1 space-y-4">
          {/* Video chat */}
          <Card>
            <CardHeader>
              <CardTitle>Video Interview</CardTitle>
              <CardDescription>Connect with the interviewer</CardDescription>
            </CardHeader>
            <CardContent>
              <VideoChat interviewId={token} userRole="CANDIDATE" />
            </CardContent>
          </Card>
          
          {/* Interview info */}
          <Card>
            <CardHeader>
              <CardTitle>Interview Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {timeRemaining && (
                <div>
                  <p className="text-sm font-medium">Time Remaining</p>
                  <p>{timeRemaining}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium">Questions</p>
                <p>{interview.questions.length}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Progress</p>
                <Progress value={progress} className="h-2 mt-2" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main content - Questions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{interview.title}</CardTitle>
              <CardDescription>
                Question {currentQuestionIndex + 1} of {interview.questions.length}
                {timeRemaining && (
                  <span className="ml-4 font-medium">Time Remaining: {timeRemaining}</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Progress value={progress} className="h-2" />
              </div>
              
              <Tabs defaultValue="question">
                <TabsList className="mb-4">
                  <TabsTrigger value="question">Question</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                </TabsList>
                
                <TabsContent value="question">
                  <QuestionCard>
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-medium mb-4">{currentQuestion.question.content}</h3>
                      
                      {isCodingQuestion(currentQuestion) ? (
                        <div className="space-y-4">
                          <div className="flex items-center space-x-4">
                            <label className="text-sm font-medium">Programming Language:</label>
                            <Select
                              value={selectedLanguage[currentQuestion.id] || 'javascript'}
                              onValueChange={(value) => handleLanguageChange(currentQuestion.id, value)}
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select language" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="javascript">JavaScript</SelectItem>
                                <SelectItem value="typescript">TypeScript</SelectItem>
                                <SelectItem value="python">Python</SelectItem>
                                <SelectItem value="java">Java</SelectItem>
                                <SelectItem value="csharp">C#</SelectItem>
                                <SelectItem value="cpp">C++</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <CodeEditor
                            value={responses[currentQuestion.id] || ''}
                            onChange={(value) => handleResponseChange(currentQuestion.id, value)}
                            language={selectedLanguage[currentQuestion.id] || 'javascript'}
                            height="300px"
                            isCandidate={true}
                          />
                        </div>
                      ) : (
                        <Textarea
                          value={responses[currentQuestion.id] || ''}
                          onChange={(e) => handleResponseChange(currentQuestion.id, e.target.value)}
                          placeholder="Type your answer here..."
                          className="w-full min-h-[150px]"
                        />
                      )}
                    </CardContent>
                  </QuestionCard>
                </TabsContent>
                
                <TabsContent value="notes">
                  <InterviewNotes interviewId={interview?.id || ''} accessToken={token} />
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>
              
              {currentQuestionIndex < interview.questions.length - 1 ? (
                <Button onClick={handleQuestionSubmit}>
                  Next
                </Button>
              ) : (
                <Button onClick={async () => {
                  await handleQuestionSubmit();
                  setConfirmDialogOpen(true)
                  }}>
                  Complete Interview
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
      
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Interview</DialogTitle>
            <DialogDescription>
              Are you sure you want to complete this interview? You won't be able to change your answers after submission.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Submit Interview</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CandidateInterview;