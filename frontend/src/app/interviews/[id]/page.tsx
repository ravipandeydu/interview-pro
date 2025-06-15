'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useInterview, useInterviewOperations, useInterviewSubmissions } from '@/hooks/useInterview';
import { useAuth } from '@/store/useStore';
import { useAllCandidates } from '@/hooks/useCandidate';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Calendar, Clock, User, FileText, Edit, Trash2, Share2, Copy, Plus, X, ActivitySquare, ShieldCheck, Lock, Gauge } from 'lucide-react';
import { QuestionSelector } from '@/components/questions/QuestionSelector';
import { InterviewNotes } from '@/components/interviews/InterviewNotes';
import { format } from 'date-fns';
import InterviewService from '@/services/interviewService';

export default function InterviewDetailsPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('details');
  const [showQuestionSelector, setShowQuestionSelector] = useState(false);
  const [isSendingInvitation, setIsSendingInvitation] = useState(false);
  
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
  
  // Handle sending invitation directly
  const handleSendInvitation = async () => {
    if (!interview?.candidateId) {
      toast.error('No candidate associated with this interview');
      return;
    }
    
    try {
      setIsSendingInvitation(true);
      
      const result = await InterviewService.sendInterviewInvitation(id as string, interview.candidateId);
      
      toast.success(`Invitation sent successfully to candidate`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send invitation');
      console.error('Send invitation error:', err);
    } finally {
      setIsSendingInvitation(false);
    }
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
  
  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border p-6 mb-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{interview.title}</h1>
            <p className="text-muted-foreground mt-2">{interview.description}</p>
          </div>
          
          <div className="flex flex-wrap gap-2 justify-start md:justify-end">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={handleCopyLink}
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy Link
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  disabled={isSendingInvitation || !interview.candidateId}
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  Send Invitation
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Send Interview Invitation</AlertDialogTitle>
                  <AlertDialogDescription>
                    Send an invitation email to the candidate associated with this interview?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleSendInvitation}
                    disabled={isSendingInvitation}
                  >
                    {isSendingInvitation ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Sending...
                      </>
                    ) : (
                      'Send'
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => router.push(`/interviews/edit/${id}`)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="flex items-center gap-1">
                  <Trash2 className="h-4 w-4 mr-1" />
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
      
        {/* Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="bg-gray-50 dark:bg-gray-900 border-0 shadow-none">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className="text-base font-medium">{interview.status}</Badge>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-50 dark:bg-gray-900 border-0 shadow-none">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">Scheduled Date</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{interview.scheduledDate ? format(new Date(interview.scheduledDate), 'PPP') : 'Not scheduled'}</span>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-50 dark:bg-gray-900 border-0 shadow-none">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">Duration</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{interview.duration} minutes</span>
            </CardContent>
          </Card>
        </div>
      </div>
        
      {/* Tabs Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-0">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>
        
        {/* Details Tab */}
        <TabsContent value="details" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Interview Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">Candidate</h3>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="font-medium">
                      {interview.candidateId ? interview.candidate?.fullName : 'No candidate assigned'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">Recruiter</h3>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="font-medium">
                      {interview.recruiterId ? interview.recruiter?.name : 'No recruiter assigned'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                <p className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md">{interview.description || 'No description provided'}</p>
              </div>
            </CardContent>
          </Card>
          
          {interview.instructions && (
            <Card>
              <CardHeader>
                <CardTitle>Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md whitespace-pre-wrap">
                  {interview.instructions}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Questions Tab */}
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
                    <div key={question.id} className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-medium">
                          {index + 1}. {question.question.content}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{question.question.category}</Badge>
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
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{question.question.difficulty}</Badge>
                        <span className="text-sm text-muted-foreground">{question?.question?.points} points</span>
                      </div>
                      <p className="mt-3">{question.description}</p>
                      
                      {index < (interview.questions?.length || 0) - 1 && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  ))}
                  
                  {(!interview.questions || interview.questions.length === 0) && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No questions have been added to this interview.</p>
                      <Button variant="outline" className="mt-4" onClick={() => setShowQuestionSelector(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Questions
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Submissions Tab */}
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
                <div className="flex justify-center items-center py-8">
                  <p className="text-muted-foreground">Loading submissions...</p>
                </div>
              ) : submissions && submissions.length > 0 ? (
                <div className="space-y-6">
                  {submissions.map((submission) => {
                    const question = interview.questions?.find(q => q.id === submission.questionId);
                    return (
                      <div key={submission.id} className="border rounded-lg p-5 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
                          <h3 className="font-medium text-lg">
                            {question?.title || 'Unknown Question'}
                          </h3>
                          <Badge>{submission.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          Submitted: {new Date(submission.createdAt).toLocaleString()}
                        </p>
                        <div className="mb-4">
                          <h4 className="text-sm font-medium mb-2">Answer:</h4>
                          <pre className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md overflow-x-auto text-sm">
                            {submission.answer}
                          </pre>
                        </div>
                        
                        {/* AI Analysis Section */}
                        {submission.aiAnalysis && (
                          <div className="mt-6 space-y-5">
                            <Separator />
                            <div>
                              <h4 className="text-base font-medium mb-3">AI Analysis</h4>
                              <div className="flex items-center gap-2 mb-3 bg-gray-50 dark:bg-gray-900 p-3 rounded-md">
                                <span className="text-sm font-medium">Score:</span>
                                <span className={`text-sm font-bold ${submission.aiAnalysis.score >= 80 ? 'text-green-500' : submission.aiAnalysis.score >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>
                                  {submission.aiAnalysis.score}/100
                                </span>
                              </div>
                              <p className="text-sm bg-gray-50 dark:bg-gray-900 p-3 rounded-md">{submission.aiAnalysis.feedback}</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md">
                                <h4 className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">Strengths</h4>
                                <ul className="list-disc pl-5 space-y-1 text-sm">
                                  {submission.aiAnalysis.strengths.map((strength, index) => (
                                    <li key={index}>{strength}</li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
                                <h4 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">Areas for Improvement</h4>
                                <ul className="list-disc pl-5 space-y-1 text-sm">
                                  {submission.aiAnalysis.weaknesses.map((weakness, index) => (
                                    <li key={index}>{weakness}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                            
                            {submission.aiAnalysis.suggestions && submission.aiAnalysis.suggestions.length > 0 && (
                              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
                                <h4 className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">Suggestions</h4>
                                <ul className="list-disc pl-5 space-y-1 text-sm">
                                  {submission.aiAnalysis.suggestions.map((suggestion, index) => (
                                    <li key={index}>{suggestion}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Code Quality Metrics - Only shown for coding questions */}
                            {question?.type === 'coding' && submission.aiAnalysis.codeQualityMetrics && (
                              <div>
                                <h4 className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-3">Code Quality Metrics</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                  <div className="border rounded-md p-3 bg-purple-50 dark:bg-purple-900/20">
                                    <div className="text-xs text-muted-foreground">Maintainability</div>
                                    <div className="flex items-center justify-between mt-1">
                                      <span className="text-sm font-semibold">
                                        {submission.aiAnalysis.codeQualityMetrics.maintainability}/100
                                      </span>
                                      <ActivitySquare className="h-4 w-4 text-purple-500" />
                                    </div>
                                  </div>
                                  <div className="border rounded-md p-3 bg-blue-50 dark:bg-blue-900/20">
                                    <div className="text-xs text-muted-foreground">Reliability</div>
                                    <div className="flex items-center justify-between mt-1">
                                      <span className="text-sm font-semibold">
                                        {submission.aiAnalysis.codeQualityMetrics.reliability}/100
                                      </span>
                                      <ShieldCheck className="h-4 w-4 text-blue-500" />
                                    </div>
                                  </div>
                                  <div className="border rounded-md p-3 bg-red-50 dark:bg-red-900/20">
                                    <div className="text-xs text-muted-foreground">Security</div>
                                    <div className="flex items-center justify-between mt-1">
                                      <span className="text-sm font-semibold">
                                        {submission.aiAnalysis.codeQualityMetrics.security}/100
                                      </span>
                                      <Lock className="h-4 w-4 text-red-500" />
                                    </div>
                                  </div>
                                  <div className="border rounded-md p-3 bg-green-50 dark:bg-green-900/20">
                                    <div className="text-xs text-muted-foreground">Performance</div>
                                    <div className="flex items-center justify-between mt-1">
                                      <span className="text-sm font-semibold">
                                        {submission.aiAnalysis.codeQualityMetrics.performance}/100
                                      </span>
                                      <Gauge className="h-4 w-4 text-green-500" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {/* Code Quality Details - Only shown for coding questions */}
                            {question?.type === 'coding' && submission.aiAnalysis.codeQualityDetails && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-md">
                                  <h4 className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-2">Static Analysis</h4>
                                  <ul className="list-disc pl-5 space-y-1 text-xs">
                                    {submission.aiAnalysis.codeQualityDetails.staticAnalysis.map((finding, index) => (
                                      <li key={index}>{finding}</li>
                                    ))}
                                  </ul>
                                </div>
                                
                                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-md">
                                  <h4 className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-2">Best Practices</h4>
                                  <ul className="list-disc pl-5 space-y-1 text-xs">
                                    {submission.aiAnalysis.codeQualityDetails.bestPractices.map((practice, index) => (
                                      <li key={index}>{practice}</li>
                                    ))}
                                  </ul>
                                </div>
                                
                                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-md">
                                  <h4 className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-2">Performance Issues</h4>
                                  <ul className="list-disc pl-5 space-y-1 text-xs">
                                    {submission.aiAnalysis.codeQualityDetails.performanceIssues.map((issue, index) => (
                                      <li key={index}>{issue}</li>
                                    ))}
                                  </ul>
                                </div>
                                
                                <div className="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-md">
                                  <h4 className="text-sm font-medium text-rose-600 dark:text-rose-400 mb-2">Security Vulnerabilities</h4>
                                  <ul className="list-disc pl-5 space-y-1 text-xs">
                                    {submission.aiAnalysis.codeQualityDetails.securityVulnerabilities.map((vulnerability, index) => (
                                      <li key={index}>{vulnerability}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            )}
                            
                            {/* Plagiarism Report */}
                            {submission.plagiarismReport && (
                              <div className="mt-4">
                                <h4 className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-2">Plagiarism Report</h4>
                                <div className="border rounded-md p-4 bg-amber-50 dark:bg-amber-900/20">
                                  <div className="flex items-center gap-2 mb-3">
                                    <span className="text-sm font-medium">Similarity Score:</span>
                                    <span className={`text-sm font-bold ${submission.plagiarismReport.score > 30 ? 'text-red-500' : 'text-green-500'}`}>
                                      {submission.plagiarismReport.score}%
                                    </span>
                                  </div>
                                  
                                  {submission.plagiarismReport.matches.length > 0 ? (
                                    <div>
                                      <h5 className="text-sm font-medium mb-2">Matches Found:</h5>
                                      <div className="space-y-2">
                                        {submission.plagiarismReport.matches.map((match, index) => (
                                          <div key={index} className="border rounded-md p-3 bg-white dark:bg-gray-800">
                                            <div className="flex justify-between items-center">
                                              <span className="text-sm font-medium">{match.source}</span>
                                              <Badge variant="outline" className="text-xs">{match.similarity}% similar</Badge>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-sm">No significant matches found.</p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No submissions yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Notes Tab */}
        <TabsContent value="notes" className="mt-6">
          <InterviewNotes interviewId={id as string} />
        </TabsContent>
      </Tabs>
    </div>
  );
}