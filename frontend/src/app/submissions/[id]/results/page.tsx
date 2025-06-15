'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useInterview, useInterviewResult, useInterviewSubmissions, useSubmissionOperations } from '@/hooks/useInterview';
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
import { CheckCircle, XCircle, AlertCircle, Download, FileText, ActivitySquare, ShieldCheck, Lock, Gauge } from 'lucide-react';

export default function SubmissionResultsPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Fetch interview data
  const { data: interview, isLoading: isLoadingInterview } = useInterview(id as string);
  
  // Fetch interview result
  const { data: result, isLoading: isLoadingResult } = useInterviewResult(id as string);
  
  // Fetch submissions
  const { data: submissions, isLoading: isLoadingSubmissions } = useInterviewSubmissions(id as string);
  
  // PDF generation
  const { generatePdfReport, isGeneratingPdfReport, analyzeSubmission, isAnalyzingSubmission } = useSubmissionOperations();
  
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

  // Loading state
  if (isLoadingInterview || isLoadingResult || isLoadingSubmissions) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <p>Loading results...</p>
      </div>
    );
  }

  // Error state
  if (!interview || !result || !submissions) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <p className="text-red-500">Error loading results. Please try again.</p>
        <Button className="mt-4" onClick={() => router.push('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{interview.title} - Results</h1>
          <p className="text-muted-foreground">
            Completed on {new Date(result.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
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
            <div className="text-4xl font-bold">
              {submissions.some(s => s.plagiarismReport) 
                ? `${Math.max(...submissions.map(s => s.plagiarismReport?.score || 0))}%` 
                : 'N/A'}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full md:w-[600px] grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="feedback">AI Feedback</TabsTrigger>
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
                  <p className="mt-2">{result.feedback}</p>
                </div>
                
                <Separator />
                
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
                      
                      {/* AI Analysis Button */}
                      {!submission.aiAnalysis && (
                        <div className="mt-4">
                          <Button 
                            onClick={() => handleAnalyzeSubmission(submission.id)}
                            className="w-full"
                            disabled={isAnalyzingSubmission}
                          >
                            {isAnalyzingSubmission ? 'Analyzing...' : 'Analyze with AI'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
        
        <TabsContent value="feedback" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Analysis</CardTitle>
              <CardDescription>
                Detailed feedback on your performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {submissions.map((submission) => {
                  if (!submission.aiAnalysis) return null;
                  const question = interview.questions.find(q => q.questionId === submission.questionId);
                  return (
                    <div key={submission.id} className="space-y-4">
                      <div className="flex items-start gap-4">
                        <FileText className="h-5 w-5 mt-1 text-blue-500" />
                        <div>
                          <h3 className="text-lg font-medium">{question?.title || 'Question'}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-medium">Score:</span>
                            <span className={`${getScoreColor(submission.aiAnalysis.score)}`}>
                              {submission.aiAnalysis.score}/100
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-9 space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Feedback</h4>
                          <p>{submission.aiAnalysis.feedback}</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2 text-green-600">Strengths</h4>
                            <ul className="list-disc pl-5 space-y-1">
                              {submission.aiAnalysis.strengths.map((strength, index) => (
                                <li key={index}>{strength}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2 text-red-600">Areas for Improvement</h4>
                            <ul className="list-disc pl-5 space-y-1">
                              {submission.aiAnalysis.weaknesses.map((weakness, index) => (
                                <li key={index}>{weakness}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2 text-blue-600">Suggestions</h4>
                          <ul className="list-disc pl-5 space-y-1">
                            {submission.aiAnalysis.suggestions.map((suggestion, index) => (
                              <li key={index}>{suggestion}</li>
                            ))}
                          </ul>
                        </div>
                        
                        {/* Code Quality Metrics - Only shown for coding questions */}
                        {question?.type === 'coding' && submission.aiAnalysis.codeQualityMetrics && (
                          <div>
                            <h4 className="font-medium mb-2 text-purple-600">Code Quality Metrics</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="border rounded-md p-3 bg-purple-50">
                                <div className="text-sm text-muted-foreground">Maintainability</div>
                                <div className="flex items-center justify-between mt-1">
                                  <span className="text-lg font-semibold">
                                    {submission.aiAnalysis.codeQualityMetrics.maintainability}/100
                                  </span>
                                  <ActivitySquare className="h-5 w-5 text-purple-500" />
                                </div>
                              </div>
                              <div className="border rounded-md p-3 bg-blue-50">
                                <div className="text-sm text-muted-foreground">Reliability</div>
                                <div className="flex items-center justify-between mt-1">
                                  <span className="text-lg font-semibold">
                                    {submission.aiAnalysis.codeQualityMetrics.reliability}/100
                                  </span>
                                  <ShieldCheck className="h-5 w-5 text-blue-500" />
                                </div>
                              </div>
                              <div className="border rounded-md p-3 bg-red-50">
                                <div className="text-sm text-muted-foreground">Security</div>
                                <div className="flex items-center justify-between mt-1">
                                  <span className="text-lg font-semibold">
                                    {submission.aiAnalysis.codeQualityMetrics.security}/100
                                  </span>
                                  <Lock className="h-5 w-5 text-red-500" />
                                </div>
                              </div>
                              <div className="border rounded-md p-3 bg-green-50">
                                <div className="text-sm text-muted-foreground">Performance</div>
                                <div className="flex items-center justify-between mt-1">
                                  <span className="text-lg font-semibold">
                                    {submission.aiAnalysis.codeQualityMetrics.performance}/100
                                  </span>
                                  <Gauge className="h-5 w-5 text-green-500" />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Code Quality Details - Only shown for coding questions */}
                        {question?.type === 'coding' && submission.aiAnalysis.codeQualityDetails && (
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-2 text-indigo-600">Static Analysis</h4>
                              <ul className="list-disc pl-5 space-y-1">
                                {submission.aiAnalysis.codeQualityDetails.staticAnalysis.map((finding, index) => (
                                  <li key={index}>{finding}</li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <h4 className="font-medium mb-2 text-emerald-600">Best Practices</h4>
                              <ul className="list-disc pl-5 space-y-1">
                                {submission.aiAnalysis.codeQualityDetails.bestPractices.map((practice, index) => (
                                  <li key={index}>{practice}</li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <h4 className="font-medium mb-2 text-amber-600">Performance Issues</h4>
                              <ul className="list-disc pl-5 space-y-1">
                                {submission.aiAnalysis.codeQualityDetails.performanceIssues.map((issue, index) => (
                                  <li key={index}>{issue}</li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <h4 className="font-medium mb-2 text-rose-600">Security Vulnerabilities</h4>
                              <ul className="list-disc pl-5 space-y-1">
                                {submission.aiAnalysis.codeQualityDetails.securityVulnerabilities.map((vulnerability, index) => (
                                  <li key={index}>{vulnerability}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                        
                        
                        {submission.plagiarismReport && (
                          <div>
                            <h4 className="font-medium mb-2 text-amber-600">Plagiarism Report</h4>
                            <div className="border rounded-md p-4 bg-amber-50">
                              <div className="flex items-center gap-2 mb-4">
                                <span className="font-medium">Similarity Score:</span>
                                <span className={`${submission.plagiarismReport.score > 30 ? 'text-red-500' : 'text-green-500'}`}>
                                  {submission.plagiarismReport.score}%
                                </span>
                              </div>
                              
                              {submission.plagiarismReport.matches.length > 0 ? (
                                <div>
                                  <h5 className="font-medium mb-2">Matches Found:</h5>
                                  <div className="space-y-2">
                                    {submission.plagiarismReport.matches.map((match, index) => (
                                      <div key={index} className="border rounded-md p-2">
                                        <div className="flex justify-between items-center">
                                          <span className="font-medium">{match.source}</span>
                                          <Badge variant="outline">{match.similarity}% similar</Badge>
                                        </div>
                                        <div className="mt-2">
                                          <div className="text-xs text-muted-foreground">Matched Text:</div>
                                          <pre className="bg-muted p-2 rounded-md overflow-x-auto text-xs mt-1">
                                            {match.matchedText}
                                          </pre>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <p>No significant matches found.</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <Separator />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}