'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { AlertTriangle, FileCode, Globe, Users, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../ui/button';

export interface PlagiarismSource {
  content: string;
  similarity: number;
  url?: string;
  submissionId?: string;
  candidateName?: string;
  interviewTitle?: string;
  sourceType?: 'internal' | 'external';
}

export interface PlagiarismReport {
  id: string;
  submissionId: string;
  score: number;
  status: 'clean' | 'suspected' | 'confirmed';
  summary: string;
  webSources: PlagiarismSource[];
  internalSources: PlagiarismSource[];
  createdAt: string;
}

interface PlagiarismReportUIProps {
  report: PlagiarismReport;
  onDetectPlagiarism?: () => void;
  isDetecting?: boolean;
}

// Helper function to get color based on plagiarism score
const getScoreColor = (score: number) => {
  if (score < 15) return 'text-green-500';
  if (score < 30) return 'text-yellow-500';
  return 'text-red-500';
};

// Helper function to get progress color based on plagiarism score
const getProgressColor = (score: number) => {
  if (score < 15) return 'bg-green-500';
  if (score < 30) return 'bg-yellow-500';
  return 'bg-red-500';
};

// Helper function to get status badge color
const getStatusColor = (status: 'clean' | 'suspected' | 'confirmed') => {
  switch (status) {
    case 'clean':
      return 'text-green-500 bg-green-50';
    case 'suspected':
      return 'text-yellow-500 bg-yellow-50';
    case 'confirmed':
      return 'text-red-500 bg-red-50';
    default:
      return 'text-gray-500 bg-gray-50';
  }
};

// Helper function to get status icon
const getStatusIcon = (status: 'clean' | 'suspected' | 'confirmed') => {
  switch (status) {
    case 'clean':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'suspected':
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    case 'confirmed':
      return <XCircle className="h-5 w-5 text-red-500" />;
    default:
      return <AlertCircle className="h-5 w-5 text-gray-500" />;
  }
};

export const PlagiarismReportUI: React.FC<PlagiarismReportUIProps> = ({
  report,
  onDetectPlagiarism,
  isDetecting = false,
}) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">Plagiarism Report</CardTitle>
            <CardDescription className="mt-1">Generated on {new Date(report.createdAt).toLocaleString()}</CardDescription>
          </div>
          <div className="flex flex-col items-end">
            <div className="text-2xl font-bold flex items-center gap-2">
              <span className={getScoreColor(report.score)}>{report.score}%</span>
              <span className="text-sm text-muted-foreground">similarity</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Progress
                value={report.score}
                max={100}
                className={`h-2 w-24 ${getProgressColor(report.score)}`}
              />
              <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(report.status)}`}>
                {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h3 className="text-lg font-medium text-amber-600">Summary</h3>
          </div>
          <p className="text-muted-foreground">{report.summary}</p>
        </div>

        <Separator />

        {/* Sources Tabs */}
        <Tabs defaultValue="web" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="web">
              <Globe className="mr-2 h-4 w-4" />
              Web Sources
            </TabsTrigger>
            <TabsTrigger value="internal">
              <Users className="mr-2 h-4 w-4" />
              Internal Sources
            </TabsTrigger>
          </TabsList>
          
          {/* Web Sources */}
          <TabsContent value="web" className="space-y-4">
            {report.webSources.length > 0 ? (
              report.webSources.map((source, index) => (
                <div key={index} className="border rounded-md p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 text-blue-500 mr-2" />
                      <span className="font-medium">
                        {source.url ? (
                          <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                            {source.url.length > 50 ? `${source.url.substring(0, 50)}...` : source.url}
                          </a>
                        ) : (
                          'Web Source'
                        )}
                      </span>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${getScoreColor(source.similarity)}`}>
                      {source.similarity}% match
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md mt-2 text-sm">
                    <pre className="whitespace-pre-wrap">{source.content}</pre>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                No web sources detected.
              </div>
            )}
          </TabsContent>
          
          {/* Internal Sources */}
          <TabsContent value="internal" className="space-y-4">
            {report.internalSources.length > 0 ? (
              report.internalSources.map((source, index) => (
                <div key={index} className="border rounded-md p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      <FileCode className="h-4 w-4 text-purple-500 mr-2" />
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {source.candidateName || 'Another Candidate'}
                        </span>
                        {source.interviewTitle && (
                          <span className="text-xs text-muted-foreground">
                            Interview: {source.interviewTitle}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${getScoreColor(source.similarity)}`}>
                      {source.similarity}% match
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md mt-2 text-sm">
                    <pre className="whitespace-pre-wrap">{source.content}</pre>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                No internal sources detected.
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Detect Plagiarism Button */}
        {onDetectPlagiarism && (
          <div className="flex justify-end">
            <Button
              onClick={onDetectPlagiarism}
              disabled={isDetecting}
              variant="outline"
            >
              {isDetecting ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-primary rounded-full"></div>
                  Detecting...
                </>
              ) : (
                <>
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Re-check for Plagiarism
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlagiarismReportUI;