'use client';

import React from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { PlagiarismReportUI, PlagiarismReport } from './PlagiarismReportUI';
import { AlertTriangle } from 'lucide-react';

interface PlagiarismDialogProps {
  trigger?: React.ReactNode;
  title?: string;
  description?: string;
  report: PlagiarismReport;
  isLoading?: boolean;
  onDetect?: () => void;
}

export const PlagiarismDialog: React.FC<PlagiarismDialogProps> = ({
  trigger,
  title = 'Plagiarism Report',
  description = 'Detailed analysis of code similarity',
  report,
  isLoading = false,
  onDetect,
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <AlertTriangle className="mr-2 h-4 w-4" />
            View Plagiarism Report
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <PlagiarismReportUI 
            report={report} 
            onDetectPlagiarism={onDetect}
            isDetecting={isLoading}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlagiarismDialog;