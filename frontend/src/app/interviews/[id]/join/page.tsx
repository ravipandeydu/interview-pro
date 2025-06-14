'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useInterview, useInterviewOperations, useSubmissionOperations } from '@/hooks/useInterview';
import { useAuth } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Question } from '@/services/interviewService';
import { Editor } from '@monaco-editor/react';
import { TipTapEditor } from '@/components/TipTapEditor'; // We'll create this component later
import { VideoChat } from '@/components/VideoChat'; // We'll create this component later

export default function InterviewJoinPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [code, setCode] = useState<string>('');
  const [writtenAnswer, setWrittenAnswer] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Fetch interview data
  const { data: interview, isLoading, error } = useInterview(id as string);
  
  // Interview operations
  const { joinInterview, isJoiningInterview, joinInterviewError } = useInterviewOperations();
  
  // Submission operations
  const { submitAnswer, isSubmittingAnswer } = useSubmissionOperations();

  // Get current question
  const currentQuestion = interview?.questions[activeQuestionIndex];

  // Handle joining the interview
  useEffect(() => {
    if (id && !isLoading && !error && interview) {
      joinInterview(id as string, {
        onSuccess: (data) => {
          toast.success('Successfully joined the interview');
          // Initialize timer for the first question
          if (interview.questions.length > 0) {
            startTimer(interview.questions[0].timeLimit);
          }
        },
        onError: (error) => {
          toast.error('Failed to join the interview');
          console.error('Join interview error:', error);
        },
      });
    }
    
    return () => {
      // Clear timer on unmount
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [id, interview, isLoading, error, joinInterview]);

  // Start timer for a question
  const startTimer = (minutes: number) => {
    // Clear existing timer if any
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Set initial time in seconds
    const initialTime = minutes * 60;
    setRemainingTime(initialTime);
    
    // Start countdown
    timerRef.current = setInterval(() => {
      setRemainingTime((prevTime) => {
        if (prevTime === null || prevTime <= 1) {
          // Time's up
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          handleTimeUp();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  // Handle time up
  const handleTimeUp = () => {
    toast.warning("Time's up! Submitting your answer...");
    handleSubmitAnswer();
  };

  // Format remaining time
  const formatTime = (seconds: number | null) => {
    if (seconds === null) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle question change
  const handleQuestionChange = (index: number) => {
    // Submit current answer before changing
    handleSubmitAnswer();
    
    // Change to new question
    setActiveQuestionIndex(index);
    
    // Reset state for new question
    const newQuestion = interview?.questions[index];
    if (newQuestion) {
      setCode(newQuestion.codeTemplate || '');
      setWrittenAnswer('');
      startTimer(newQuestion.timeLimit);
    }
  };

  // Handle submit answer
  const handleSubmitAnswer = async () => {
    if (!currentQuestion || !interview) return;
    
    // Prepare answer based on question type
    let answer = '';
    if (currentQuestion.type === 'coding') {
      answer = code;
    } else if (currentQuestion.type === 'written') {
      answer = writtenAnswer;
    } else if (currentQuestion.type === 'multiple-choice') {
      // For multiple choice, we'd need to track selected options
      // This is simplified for now
      answer = 'Selected option';
    }
    
    // Submit the answer
    try {
      await submitAnswer({
        interviewId: interview.id,
        questionId: currentQuestion.id,
        answerData: {
          answer,
          language: currentQuestion.type === 'coding' ? selectedLanguage : undefined,
        },
      });
      
      toast.success('Answer submitted successfully');
      
      // Move to next question if available
      if (activeQuestionIndex < interview.questions.length - 1) {
        handleQuestionChange(activeQuestionIndex + 1);
      } else {
        // All questions completed
        toast.success('Interview completed! Redirecting to results...');
        setTimeout(() => {
          router.push(`/submissions/${interview.id}/results`);
        }, 2000);
      }
    } catch (error) {
      toast.error('Failed to submit answer');
      console.error('Submit answer error:', error);
    }
  };

  // Handle language change for code editor
  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <p>Loading interview...</p>
      </div>
    );
  }

  // Error state
  if (error || !interview) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <p className="text-red-500">Error loading interview. Please try again.</p>
        <Button className="mt-4" onClick={() => router.push('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 px-4">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left sidebar - Video and questions */}
        <div className="w-full lg:w-1/3 space-y-4">
          {/* Video chat */}
          <Card>
            <CardHeader>
              <CardTitle>Video Interview</CardTitle>
              <CardDescription>Connect with your interviewer</CardDescription>
            </CardHeader>
            <CardContent>
              <VideoChat interviewId={interview.id} />
            </CardContent>
          </Card>
          
          {/* Questions list */}
          <Card>
            <CardHeader>
              <CardTitle>Questions</CardTitle>
              <CardDescription>
                {activeQuestionIndex + 1} of {interview.questions.length} questions
              </CardDescription>
              <Progress 
                value={((activeQuestionIndex + 1) / interview.questions.length) * 100} 
                className="h-2"
              />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {interview.questions.map((question, index) => (
                  <Button
                    key={question.id}
                    variant={index === activeQuestionIndex ? 'default' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => handleQuestionChange(index)}
                  >
                    <span className="mr-2">{index + 1}.</span>
                    <span className="truncate">{question.title}</span>
                    <Badge 
                      variant="outline" 
                      className={`ml-auto ${index === activeQuestionIndex ? 'bg-white/20' : ''}`}
                    >
                      {question.type}
                    </Badge>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main content - Current question and editor */}
        <div className="w-full lg:w-2/3 space-y-4">
          {/* Timer and info */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">{interview.title}</h1>
              <p className="text-muted-foreground">Question {activeQuestionIndex + 1} of {interview.questions.length}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-lg py-1 px-3">
                {formatTime(remainingTime)}
              </Badge>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => router.push('/dashboard')}
              >
                Exit Interview
              </Button>
            </div>
          </div>
          
          {/* Current question */}
          {currentQuestion && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{currentQuestion.title}</CardTitle>
                    <CardDescription>
                      {currentQuestion.difficulty} • {currentQuestion.points} points • {currentQuestion.timeLimit} min
                    </CardDescription>
                  </div>
                  <Badge>{currentQuestion.type}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none">
                  <p>{currentQuestion.description}</p>
                </div>
                
                {currentQuestion.type === 'coding' && currentQuestion.expectedOutput && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Expected Output:</h4>
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                      {currentQuestion.expectedOutput}
                    </pre>
                  </div>
                )}
                
                {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium mb-2">Options:</h4>
                    {currentQuestion.options.map((option) => (
                      <div key={option.id} className="flex items-center">
                        <input 
                          type="radio" 
                          id={option.id} 
                          name="option" 
                          className="mr-2"
                        />
                        <label htmlFor={option.id}>{option.text}</label>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Editor based on question type */}
          {currentQuestion && (
            <Card className="min-h-[400px]">
              <CardHeader className="pb-2">
                <CardTitle>Your Answer</CardTitle>
                {currentQuestion.type === 'coding' && (
                  <div className="flex justify-between items-center">
                    <CardDescription>Write your code solution</CardDescription>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => handleLanguageChange(e.target.value)}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="typescript">TypeScript</option>
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                      <option value="csharp">C#</option>
                    </select>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {currentQuestion.type === 'coding' && (
                  <div className="h-[400px] border rounded-md overflow-hidden">
                    <Editor
                      height="100%"
                      language={selectedLanguage}
                      value={code}
                      onChange={(value) => setCode(value || '')}
                      theme="vs-dark"
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        wordWrap: 'on',
                      }}
                    />
                  </div>
                )}
                
                {currentQuestion.type === 'written' && (
                  <div className="min-h-[300px] border rounded-md">
                    <TipTapEditor 
                      content={writtenAnswer}
                      onChange={setWrittenAnswer}
                    />
                  </div>
                )}
                
                {currentQuestion.type === 'multiple-choice' && (
                  <div className="text-center py-8">
                    <p>Please select an option above</p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={handleSubmitAnswer}
                  disabled={isSubmittingAnswer}
                >
                  {isSubmittingAnswer ? 'Submitting...' : 'Submit Answer'}
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}