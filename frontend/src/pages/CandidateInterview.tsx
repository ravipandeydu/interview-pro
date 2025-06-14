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
  const handleResponseChange = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };
  
  // Submit a response for the current question
  const handleQuestionSubmit = async () => {
    if (!interview) return;
    
    const currentQuestion = interview.questions[currentQuestionIndex];
    
    try {
      await candidateAccessService.submitResponse(
        token, 
        currentQuestion.id, 
        responses[currentQuestion.id] || ''
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
      <div className="container mx-auto max-w-3xl">
        <div className="flex justify-center items-center min-h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto max-w-3xl">
        <div className="bg-white rounded-lg shadow-md p-8 my-8">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="mb-4">{error}</p>
          <Button 
            variant="default" 
            onClick={() => router.push('/')} 
            className="mt-4"
          >
            Return to Home
          </Button>
        </div>
      </div>
    );
  }
  
  if (completed) {
    return (
      <div className="container mx-auto max-w-3xl">
        <div className="bg-white rounded-lg shadow-md p-8 my-8">
          <h2 className="text-2xl font-bold text-primary mb-4">Interview Completed</h2>
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
      </div>
    );
  }
  
  if (!interview) {
    return (
      <div className="container mx-auto max-w-3xl">
        <Alert variant="destructive" className="my-8">
          <AlertDescription>Interview not found or access has expired.</AlertDescription>
        </Alert>
      </div>
    );
  }
  
  if (!started) {
    return (
      <div className="container mx-auto max-w-3xl">
        <Card className="my-8">
          <CardHeader>
            <CardTitle className="text-2xl">{interview.title}</CardTitle>
            <CardDescription>{interview.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="font-medium">Position:</p>
                <p>{interview.position}</p>
              </div>
              <div>
                <p className="font-medium">Questions:</p>
                <p>{interview.questions.length}</p>
              </div>
              {interview.timeLimit && (
                <div>
                  <p className="font-medium">Time Limit:</p>
                  <p>{interview.timeLimit} minutes</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleStart}>Start Interview</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  const currentQuestion = interview.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / interview.questions.length) * 100;
  
  return (
    <div className="container mx-auto max-w-3xl">
      <Card className="my-8">
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
          
          <QuestionCard>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">{currentQuestion.text}</h3>
              <Textarea
                value={responses[currentQuestion.id] || ''}
                onChange={(e) => handleResponseChange(currentQuestion.id, e.target.value)}
                placeholder="Type your answer here..."
                className="w-full min-h-[150px]"
              />
            </CardContent>
          </QuestionCard>
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
            <Button onClick={() => setConfirmDialogOpen(true)}>
              Complete Interview
            </Button>
          )}
        </CardFooter>
      </Card>
      
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