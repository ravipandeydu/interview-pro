import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FeedbackResponse, InterviewFeedback } from '@/services/feedbackService';
import {
  CheckCircle,
  XCircle,
  FileText,
  ActivitySquare,
  ShieldCheck,
  Lock,
  Gauge,
  Award,
  AlertTriangle,
  Lightbulb,
  BarChart,
} from 'lucide-react';

interface FeedbackUIProps {
  feedback: FeedbackResponse;
  questionTitle?: string;
  questionType?: string;
}

interface InterviewFeedbackUIProps {
  feedback: InterviewFeedback;
}

// Helper function to get color based on score
const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-amber-600';
  return 'text-red-600';
};

// Helper function to get progress color based on score
const getProgressColor = (score: number) => {
  if (score >= 80) return 'bg-green-600';
  if (score >= 60) return 'bg-amber-600';
  return 'bg-red-600';
};

/**
 * Component to display feedback for a single response
 */
export const FeedbackUI: React.FC<FeedbackUIProps> = ({
  feedback,
  questionTitle = 'Question',
  questionType = 'coding',
}) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{questionTitle}</CardTitle>
            <CardDescription className="mt-1">AI-Generated Feedback</CardDescription>
          </div>
          <div className="flex flex-col items-end">
            <div className="text-2xl font-bold flex items-center gap-2">
              <span className={getScoreColor(feedback.score)}>{feedback.score}</span>
              <span className="text-sm text-muted-foreground">/100</span>
            </div>
            <Progress
              value={feedback.score}
              max={100}
              className={`h-2 w-24 mt-1 ${getProgressColor(feedback.score)}`}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* General Feedback */}
        <div>
          <h3 className="text-lg font-medium mb-2">Feedback</h3>
          <p className="text-muted-foreground">{feedback.feedback}</p>
        </div>

        <Separator />

        {/* Strengths and Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-medium text-green-600">Strengths</h3>
            </div>
            <ul className="space-y-2">
              {feedback.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <XCircle className="h-5 w-5 text-red-500" />
              <h3 className="text-lg font-medium text-red-600">Areas for Improvement</h3>
            </div>
            <ul className="space-y-2">
              {feedback.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator />

        {/* Suggestions */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-medium text-blue-600">Suggestions</h3>
          </div>
          <ul className="space-y-2">
            {feedback.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Code Quality Metrics - Only shown for coding questions */}
        {questionType === 'coding' && feedback.codeQualityMetrics && (
          <>
            <Separator />

            <div>
              <div className="flex items-center gap-2 mb-3">
                <BarChart className="h-5 w-5 text-purple-500" />
                <h3 className="text-lg font-medium text-purple-600">Code Quality Metrics</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="border rounded-md p-3 bg-purple-50">
                  <div className="text-sm text-muted-foreground">Maintainability</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-lg font-semibold">
                      {feedback.codeQualityMetrics.maintainability}/100
                    </span>
                    <ActivitySquare className="h-5 w-5 text-purple-500" />
                  </div>
                </div>
                <div className="border rounded-md p-3 bg-blue-50">
                  <div className="text-sm text-muted-foreground">Reliability</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-lg font-semibold">
                      {feedback.codeQualityMetrics.reliability}/100
                    </span>
                    <ShieldCheck className="h-5 w-5 text-blue-500" />
                  </div>
                </div>
                <div className="border rounded-md p-3 bg-red-50">
                  <div className="text-sm text-muted-foreground">Security</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-lg font-semibold">
                      {feedback.codeQualityMetrics.security}/100
                    </span>
                    <Lock className="h-5 w-5 text-red-500" />
                  </div>
                </div>
                <div className="border rounded-md p-3 bg-green-50">
                  <div className="text-sm text-muted-foreground">Performance</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-lg font-semibold">
                      {feedback.codeQualityMetrics.performance}/100
                    </span>
                    <Gauge className="h-5 w-5 text-green-500" />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Code Quality Details - Only shown for coding questions */}
        {questionType === 'coding' && feedback.codeQualityDetails && (
          <>
            <Separator />

            <Tabs defaultValue="static" className="w-full">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="static">Static Analysis</TabsTrigger>
                <TabsTrigger value="best">Best Practices</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>
              <TabsContent value="static" className="space-y-2">
                {feedback.codeQualityDetails.staticAnalysis.map((finding, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-indigo-500 mt-1">•</span>
                    <span>{finding}</span>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="best" className="space-y-2">
                {feedback.codeQualityDetails.bestPractices.map((practice, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-1">•</span>
                    <span>{practice}</span>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="performance" className="space-y-2">
                {feedback.codeQualityDetails.performanceIssues.map((issue, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-amber-500 mt-1">•</span>
                    <span>{issue}</span>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="security" className="space-y-2">
                {feedback.codeQualityDetails.securityVulnerabilities.map((vulnerability, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-rose-500 mt-1">•</span>
                    <span>{vulnerability}</span>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Component to display comprehensive feedback for an entire interview
 */
export const InterviewFeedbackUI: React.FC<InterviewFeedbackUIProps> = ({ feedback }) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">Interview Performance</CardTitle>
            <CardDescription className="mt-1">Comprehensive AI-Generated Feedback</CardDescription>
          </div>
          <div className="flex flex-col items-end">
            <div className="text-2xl font-bold flex items-center gap-2">
              <span className={getScoreColor(feedback.overallScore)}>{feedback.overallScore}</span>
              <span className="text-sm text-muted-foreground">/100</span>
            </div>
            <Progress
              value={feedback.overallScore}
              max={100}
              className={`h-2 w-24 mt-1 ${getProgressColor(feedback.overallScore)}`}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* General Feedback */}
        <div>
          <h3 className="text-lg font-medium mb-2">Overall Assessment</h3>
          <p className="text-muted-foreground">{feedback.feedback}</p>
        </div>

        <Separator />

        {/* Recommendation */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-medium text-blue-700">Recommendation</h3>
          </div>
          <p>{feedback.recommendation}</p>
        </div>

        <Separator />

        {/* Category Scores */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <BarChart className="h-5 w-5 text-purple-500" />
            <h3 className="text-lg font-medium text-purple-600">Performance by Category</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(feedback.categoryScores).map(([category, score]) => (
              <div key={category} className="border rounded-md p-3">
                <div className="text-sm font-medium">{category}</div>
                <div className="flex items-center gap-2 mt-2">
                  <Progress
                    value={score}
                    max={100}
                    className={`h-2 flex-1 ${getProgressColor(score)}`}
                  />
                  <span className={`text-sm font-medium ${getScoreColor(score)}`}>{score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Strengths and Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-medium text-green-600">Key Strengths</h3>
            </div>
            <ul className="space-y-2">
              {feedback.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <XCircle className="h-5 w-5 text-red-500" />
              <h3 className="text-lg font-medium text-red-600">Areas for Improvement</h3>
            </div>
            <ul className="space-y-2">
              {feedback.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator />

        {/* Suggestions */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-medium text-blue-600">Improvement Suggestions</h3>
          </div>
          <ul className="space-y-2">
            {feedback.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedbackUI;