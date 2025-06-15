'use client';

import { useState, use } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useInterview, useInterviewResult, useInterviewSubmissions, useSubmissionOperations } from '@/hooks/useInterview';
import { useFeedbackOperations, useInterviewFeedback } from '@/hooks/useFeedback';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Editor } from '@monaco-editor/react';
import { TipTapEditor } from '@/components/TipTapEditor';
import { Submission } from '@/services/interviewService';
import { FeedbackUI, InterviewFeedbackUI, FeedbackDialog, InterviewFeedbackDialog, CustomFeedbackForm } from '@/components/feedback';
import { PlagiarismDialog } from '@/components/plagiarism';
import { CheckCircle, XCircle, AlertCircle, Download, FileText, ActivitySquare, ShieldCheck, Lock, Gauge, Sparkles, AlertTriangle, Loader2 } from 'lucide-react';

export default function SubmissionResultsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const id = use(params).id;
  const [activeTab, setActiveTab] = useState('overview');
  const [showCustomFeedbackForm, setShowCustomFeedbackForm] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  
  // Fetch interview data
  const { data: interview, isLoading: isLoadingInterview } = useInterview(id as string);
  
  // Fetch interview result
  const { data: result, isLoading: isLoadingResult } = useInterviewResult(id as string);
  
  // Fetch submissions
  const { data: submissions, isLoading: isLoadingSubmissions } = useInterviewSubmissions(id as string);
  
  // Fetch interview feedback
  const { data: interviewFeedback, isLoading: isLoadingInterviewFeedback } = useInterviewFeedback(id as string);
  
  // PDF generation, submission analysis, and plagiarism detection
  const { 
    generatePdfReport, 
    isGeneratingPdfReport, 
    analyzeSubmission, 
    isAnalyzingSubmission,
    detectPlagiarismMutation,
    isDetectingPlagiarism
  } = useSubmissionOperations();
  
  // Feedback operations
  const {
    generateInterviewFeedback,
    isGeneratingInterviewFeedback,
    generateResponseFeedback,
    isGeneratingResponseFeedback,
    generateCustomFeedback,
    isGeneratingCustomFeedback
  } = useFeedbackOperations();
  
  // Handle PDF download
  const handleDownloadPdf = () => {
    if (!id) return;
    
    generatePdfReport(id as string, {
      onSuccess: (data) => {
        // Open the PDF in a new tab
        window.open(data.url, '_blank');
        toast.success('PDF report generated successfully');
      },
      onError: (error) => {
        toast.error('Failed to generate PDF report');
        console.error('Generate PDF error:', error);
      },
    });
  };

  // Handle submission analysis
  const handleAnalyzeSubmission = (submissionId: string) => {
    analyzeSubmission(submissionId, {
      onSuccess: () => {
        toast.success('Submission analyzed successfully');
      },
      onError: (error) => {
        toast.error('Failed to analyze submission');
        console.error('Analyze submission error:', error);
      },
    });
  };
  
  // Handle plagiarism detection
  const handleDetectPlagiarism = (submissionId: string) => {
    detectPlagiarismMutation(submissionId, {
      onSuccess: () => {
        toast.success('Plagiarism detection completed');
      },
      onError: (error) => {
        toast.error('Failed to detect plagiarism');
        console.error('Plagiarism detection error:', error);
      },
    });
  };
  
  // Handle generating comprehensive interview feedback
  const handleGenerateInterviewFeedback = () => {
    if (!id) return;
    
    generateInterviewFeedback(id as string, {
      onSuccess: () => {
        toast.success('Comprehensive interview feedback generated successfully');
      },
      onError: (error) => {
        toast.error('Failed to generate comprehensive feedback');
        console.error('Generate interview feedback error:', error);
      },
    });
  };
  
  // Handle generating feedback for a specific response
  const handleGenerateResponseFeedback = (responseId: string) => {
    generateResponseFeedback(responseId, {
      onSuccess: () => {
        toast.success('Response feedback generated successfully');
      },
      onError: (error) => {
        toast.error('Failed to generate response feedback');
        console.error('Generate response feedback error:', error);
      },
    });
  };
  
  // Handle generating custom feedback
  const handleGenerateCustomFeedback = (options: any) => {
    if (!selectedSubmissionId) return;
    
    generateCustomFeedback({ responseId: selectedSubmissionId, options }, {
      onSuccess: (data) => {
        toast.success('Custom feedback generated successfully');
        setShowCustomFeedbackForm(false);
      },
      onError: (error) => {
        toast.error('Failed to generate custom feedback');
        console.error('Generate custom feedback error:', error);
      },
    });
  };

  // Loading state
  if (isLoadingInterview || isLoadingResult || isLoadingSubmissions) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading results...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (!interview || !result || !submissions) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Error loading results</h2>
          <p className="text-gray-500 mb-4">Unable to load interview results. Please try again later.</p>
          <Button onClick={() => router.push('/interviews')}>Back to Interviews</Button>
        </div>
      </div>
    );
  }
  
  // Custom feedback form dialog
  const renderCustomFeedbackForm = () => {
    if (!showCustomFeedbackForm || !selectedSubmissionId) return null;
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
          <h2 className="text-xl font-bold mb-4">Customize Feedback</h2>
          <CustomFeedbackForm 
            onSubmit={handleGenerateCustomFeedback}
            onCancel={() => setShowCustomFeedbackForm(false)}
            isLoading={isGeneratingCustomFeedback}
          />
        </div>
      </div>
    );
  };

  // Get score color based on value
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Get status icon
  const getStatusIcon = (submission: Submission) => {
    if (submission.status === 'completed') {
      if (submission.executionResult?.passed) {
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      } else {
        return <XCircle className="h-5 w-5 text-red-500" />;
      }
    } else if (submission.status === 'failed') {
      return <XCircle className="h-5 w-5 text-red-500" />;
    } else {
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {renderCustomFeedbackForm()}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{interview.title} - Results</h1>
          <p className="text-muted-foreground">
            Completed on {new Date(result.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleGenerateInterviewFeedback}
            disabled={isGeneratingInterviewFeedback}
            className="flex items-center"
            variant="outline"
          >
            {isGeneratingInterviewFeedback ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-primary rounded-full"></div>
                Generating Feedback...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate AI Feedback
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdfReport}
          >
            <Download className="mr-2 h-4 w-4" />
            {isGeneratingPdfReport ? 'Generating...' : 'Download PDF'}
          </Button>
          <Button onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Overall Score</CardTitle>
            <CardDescription>Based on all submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-4xl font-bold ${getScoreColor(result.overallScore)}`}>
              {result.overallScore}/100
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Questions</CardTitle>
            <CardDescription>Completion rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {submissions.filter(s => s.status === 'completed').length}/{interview.questions.length}
            </div>
            <Progress 
              value={(submissions.filter(s => s.status === 'completed').length / interview.questions.length) * 100} 
              className="h-2 mt-2"
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Plagiarism</CardTitle>
            <CardDescription>Similarity score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <div className="text-4xl font-bold">
                {submissions.some(s => s.plagiarismReport) 
                  ? `${Math.max(...submissions.map(s => s.plagiarismReport?.score || 0))}%` 
                  : 'N/A'}
              </div>
              {submissions.some(s => s.plagiarismReport) && (
                <div className="mt-2 text-sm text-muted-foreground">
                  {submissions.filter(s => s.plagiarismReport).length} of {submissions.length} submissions checked
                </div>
              )}
              {!submissions.some(s => s.plagiarismReport) && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => {
                    if (submissions.length > 0) {
                      handleDetectPlagiarism(submissions[0].id);
                    }
                  }}
                  disabled={isDetectingPlagiarism || submissions.length === 0}
                >
                  {isDetectingPlagiarism ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-primary rounded-full"></div>
                      Checking...
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Check for Plagiarism
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full md:w-[800px] grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="ai-feedback">AI Feedback</TabsTrigger>
          <TabsTrigger value="plagiarism">Plagiarism</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Interview Summary</CardTitle>
              <CardDescription>
                Summary of your performance in this interview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">Overall Feedback</h3>
                  <p className="mt-2">{result.recommendation}</p>
                </div>
                
                <Separator />
                
                {/* Comprehensive AI Feedback */}
                {interviewFeedback && (
                  <div className="mt-4">
                    <h3 className="text-lg font-medium mb-2">Comprehensive AI Feedback</h3>
                    <InterviewFeedbackUI feedback={interviewFeedback} />
                  </div>
                )}
                
                {!interviewFeedback && (
                  <div className="mt-4 text-center py-4">
                    <p className="text-gray-500 mb-4">No comprehensive feedback available yet.</p>
                    <Button 
                      onClick={handleGenerateInterviewFeedback} 
                      disabled={isGeneratingInterviewFeedback}
                    >
                      {isGeneratingInterviewFeedback ? (
                        <>
                          <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-primary rounded-full"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate Comprehensive Feedback
                        </>
                      )}
                    </Button>
                  </div>
                )}
                
                <div>
                  <h3 className="text-lg font-medium">Question Performance</h3>
                  <div className="mt-4 space-y-4">
                    {interview.questions.map((question, index) => {
                      const submission = submissions.find(s => s.questionId === question.id);
                      return (
                        <div key={question.id} className="flex items-start gap-4">
                          <div className="mt-1">
                            {submission ? getStatusIcon(submission) : <AlertCircle className="h-5 w-5 text-yellow-500" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <h4 className="font-medium">{question.question.content}</h4>
                              <Badge>{question.type}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {question.difficulty} • {question.points} points
                            </p>
                            {submission?.aiAnalysis && (
                              <div className="mt-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">Score:</span>
                                  <span className={`${getScoreColor(submission.aiAnalysis.score)}`}>
                                    {submission.aiAnalysis.score}/100
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                

              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="submissions" className="mt-6">
          <div className="space-y-6">
            {submissions.map((submission) => {
              const question = interview.questions.find(q => q.questionId === submission.questionId);
              return (
                <Card key={submission.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{question?.title || 'Question'}</CardTitle>
                        <CardDescription>
                          {question?.type || 'Unknown'} • Submitted on {new Date(submission.createdAt).toLocaleString()}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={submission.executionResult?.passed ? 'default' : 'destructive'}
                      >
                        {submission.executionResult?.passed ? 'Passed' : 'Failed'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Your Answer */}
                      <div>
                        <h3 className="text-lg font-medium mb-2">Your Answer</h3>
                        {question?.type === 'coding' ? (
                          <div className="border rounded-md overflow-hidden">
                            <Editor
                              height="200px"
                              language={submission.language || 'javascript'}
                              value={submission.answer}
                              options={{ readOnly: true, minimap: { enabled: false } }}
                              theme="vs-dark"
                            />
                          </div>
                        ) : (
                          <div className="border rounded-md p-4">
                            <div dangerouslySetInnerHTML={{ __html: submission.answer }} />
                          </div>
                        )}
                      </div>
                      
                      {/* Execution Results */}
                      {submission.executionResult && (
                        <div>
                          <h3 className="text-lg font-medium mb-2">Execution Results</h3>
                          <div className="border rounded-md p-4 bg-muted/50">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium">Status:</span>
                              <Badge
                                variant={submission.executionResult.passed ? 'default' : 'destructive'}
                              >
                                {submission.executionResult.passed ? 'Passed' : 'Failed'}
                              </Badge>
                            </div>
                            {submission.executionTime !== undefined && (
                              <div className="mb-2">
                                <span className="font-medium">Execution Time:</span> {submission.executionTime}ms
                              </div>
                            )}
                            {submission.executionResult.output && (
                              <div className="mt-2">
                                <h4 className="font-medium mb-1">Output:</h4>
                                <pre className="bg-muted p-2 rounded-md overflow-x-auto text-sm">
                                  {submission.executionResult.output}
                                </pre>
                              </div>
                            )}
                            {submission.executionResult.error && (
                              <div className="mt-2">
                                <h4 className="font-medium mb-1 text-red-500">Error:</h4>
                                <pre className="bg-red-50 text-red-700 p-2 rounded-md overflow-x-auto text-sm">
                                  {submission.executionResult.error}
                                </pre>
                              </div>
                            )}
                            {submission.executionResult.testResults && (
                              <div className="mt-4">
                                <h4 className="font-medium mb-2">Test Results:</h4>
                                <div className="space-y-2">
                                  {submission.executionResult.testResults.map((test, index) => (
                                    <div key={index} className="border rounded-md p-2">
                                      <div className="flex items-center gap-2">
                                        {test.passed ? (
                                          <CheckCircle className="h-4 w-4 text-green-500" />
                                        ) : (
                                          <XCircle className="h-4 w-4 text-red-500" />
                                        )}
                                        <span className="font-medium">Test {index + 1}</span>
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                                        <div>
                                          <div className="text-xs text-muted-foreground">Input:</div>
                                          <pre className="bg-muted p-1 rounded-md overflow-x-auto text-xs">
                                            {test.input}
                                          </pre>
                                        </div>
                                        <div>
                                          <div className="text-xs text-muted-foreground">Expected Output:</div>
                                          <pre className="bg-muted p-1 rounded-md overflow-x-auto text-xs">
                                            {test.expectedOutput}
                                          </pre>
                                        </div>
                                        {!test.passed && (
                                          <div className="md:col-span-2">
                                            <div className="text-xs text-muted-foreground">Actual Output:</div>
                                            <pre className="bg-red-50 text-red-700 p-1 rounded-md overflow-x-auto text-xs">
                                              {test.actualOutput}
                                            </pre>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* AI Analysis and Feedback Buttons */}
                      <div className="flex justify-end mt-4 space-x-2">
                        {!submission.aiAnalysis && (
                          <Button 
                            onClick={() => handleAnalyzeSubmission(submission.id)}
                            disabled={isAnalyzingSubmission}
                            variant="outline"
                          >
                            {isAnalyzingSubmission ? (
                              <>
                                <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-primary rounded-full"></div>
                                Analyzing...
                              </>
                            ) : (
                              <>Analyze with AI</>
                            )}
                          </Button>
                        )}
                        
                        <Button 
                          onClick={() => handleGenerateResponseFeedback(submission.id)}
                          disabled={isGeneratingResponseFeedback}
                          variant="outline"
                        >
                          {isGeneratingResponseFeedback ? (
                            <>
                              <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-primary rounded-full"></div>
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="mr-2 h-4 w-4" />
                              Generate Feedback
                            </>
                          )}
                        </Button>
                        
                        {submission.aiAnalysis && (
                          <FeedbackDialog 
                            feedback={submission.aiAnalysis} 
                            title={question?.title || 'Question'}
                            onCustomize={() => {
                              setSelectedSubmissionId(submission.id);
                              setShowCustomFeedbackForm(true);
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
        
        <TabsContent value="ai-feedback" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Analysis</CardTitle>
              <CardDescription>
                Detailed feedback on your performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {interviewFeedback && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Comprehensive Interview Feedback</CardTitle>
                      <CardDescription>
                        Overall assessment of your interview performance
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <InterviewFeedbackDialog
                        trigger={
                          <Button variant="outline">
                            <FileText className="mr-2 h-4 w-4" />
                            View Full Interview Feedback
                          </Button>
                        }
                        title="Comprehensive Interview Feedback"
                        description="AI-generated analysis of your overall interview performance"
                        feedback={interviewFeedback}
                        onGenerate={handleGenerateInterviewFeedback}
                        isLoading={isGeneratingInterviewFeedback}
                      />
                    </CardContent>
                  </Card>
                )}
                
                {submissions.map((submission) => {
                  if (!submission.aiAnalysis) return null;
                  const question = interview.questions.find(q => q.id === submission.questionId);
                  if (!question) return null;
                  
                  return (
                    <Card key={submission.id} className="mb-6">
                      <CardHeader>
                        <CardTitle>{question.title}</CardTitle>
                        <CardDescription>
                          {question.type} · {question.difficulty} · {question.points} points
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <FeedbackUI feedback={submission.aiAnalysis} />
                          <div className="flex justify-end space-x-2 mt-4">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedSubmissionId(submission.id);
                                setShowCustomFeedbackForm(true);
                              }}
                            >
                              Customize Feedback
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleGenerateResponseFeedback(submission.id)}
                              disabled={isGeneratingResponseFeedback}
                            >
                              {isGeneratingResponseFeedback ? 'Regenerating...' : 'Regenerate Feedback'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {submissions.filter(s => s.aiAnalysis).length === 0 && (
                  <div className="text-center py-6">
                    <p className="text-gray-500 mb-4">No AI analysis available for any submissions.</p>
                    <Button 
                      onClick={handleGenerateInterviewFeedback}
                      disabled={isGeneratingInterviewFeedback}
                    >
                      {isGeneratingInterviewFeedback ? (
                        <>
                          <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate Comprehensive Feedback
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="plagiarism" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Plagiarism Reports</CardTitle>
              <CardDescription>
                Plagiarism detection results for code submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {submissions.map((submission) => {
                  // Only show coding submissions
                  const question = interview.questions.find(q => q.id === submission.questionId);
                  if (!question || question.type !== 'coding') return null;
                  
                  // Get plagiarism report from the submission data instead of using a hook
                  const plagiarismReport = submission.plagiarismReport;
                  const isLoadingPlagiarismReport = false; // We're not loading it dynamically
                  
                  return (
                    <Card key={submission.id} className="mb-6">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{question.title}</CardTitle>
                            <CardDescription>
                              {question.type} · {question.difficulty} · {question.points} points
                            </CardDescription>
                          </div>
                          {plagiarismReport && (
                            <div className={`px-2 py-1 rounded text-xs font-medium ${
                              plagiarismReport.score < 15 ? 'bg-green-100 text-green-800' : 
                              plagiarismReport.score < 30 ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'
                            }`}>
                              {plagiarismReport.score}% similarity
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {isLoadingPlagiarismReport ? (
                            <div className="flex flex-col items-center justify-center py-8">
                              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                              <p className="text-muted-foreground">Loading plagiarism report...</p>
                            </div>
                          ) : plagiarismReport ? (
                            <>
                              <div className="text-sm text-muted-foreground mb-4">
                                Report generated on {new Date(plagiarismReport.createdAt).toLocaleString()}
                              </div>
                              <PlagiarismDialog 
                                report={plagiarismReport}
                                title={`Plagiarism Report: ${question.title}`}
                                onDetect={() => handleDetectPlagiarism(submission.id)}
                                isLoading={isDetectingPlagiarism}
                                trigger={
                                  <Button variant="outline">
                                    <AlertTriangle className="mr-2 h-4 w-4" />
                                    View Full Report
                                  </Button>
                                }
                              />
                            </>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-8">
                              <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
                              <p className="text-muted-foreground mb-4">No plagiarism report available for this submission.</p>
                              <Button
                                onClick={() => handleDetectPlagiarism(submission.id)}
                                disabled={isDetectingPlagiarism}
                              >
                                {isDetectingPlagiarism ? (
                                  <>
                                    <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                                    Checking...
                                  </>
                                ) : (
                                  <>
                                    <AlertTriangle className="mr-2 h-4 w-4" />
                                    Check for Plagiarism
                                  </>
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {submissions.filter(s => interview.questions.find(q => q.id === s.questionId)?.type === 'coding').length === 0 && (
                  <div className="text-center py-6">
                    <p className="text-gray-500 mb-4">No coding submissions available for plagiarism detection.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}