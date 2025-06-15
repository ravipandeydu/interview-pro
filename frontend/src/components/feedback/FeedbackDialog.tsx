import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FeedbackUI, InterviewFeedbackUI } from './FeedbackUI';
import { FeedbackResponse, InterviewFeedback } from '@/services/feedbackService';
import { Loader2 } from 'lucide-react';

interface FeedbackDialogProps {
  trigger: React.ReactNode;
  title: string;
  description?: string;
  isLoading?: boolean;
  onGenerate?: () => void;
  feedback?: FeedbackResponse;
  questionTitle?: string;
  questionType?: string;
}

interface InterviewFeedbackDialogProps {
  trigger: React.ReactNode;
  title: string;
  description?: string;
  isLoading?: boolean;
  onGenerate?: () => void;
  feedback?: InterviewFeedback;
}

/**
 * Dialog component to display feedback for a single response
 */
export const FeedbackDialog: React.FC<FeedbackDialogProps> = ({
  trigger,
  title,
  description,
  isLoading = false,
  onGenerate,
  feedback,
  questionTitle,
  questionType,
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {feedback ? (
          <FeedbackUI
            feedback={feedback}
            questionTitle={questionTitle}
            questionType={questionType}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            {isLoading ? (
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Generating feedback...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <p className="text-muted-foreground">No feedback generated yet.</p>
                {onGenerate && (
                  <Button onClick={onGenerate} disabled={isLoading}>
                    Generate Feedback
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" type="button" className="mt-4">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Dialog component to display comprehensive feedback for an entire interview
 */
export const InterviewFeedbackDialog: React.FC<InterviewFeedbackDialogProps> = ({
  trigger,
  title,
  description,
  isLoading = false,
  onGenerate,
  feedback,
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {feedback ? (
          <InterviewFeedbackUI feedback={feedback} />
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            {isLoading ? (
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Generating comprehensive feedback...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <p className="text-muted-foreground">No interview feedback generated yet.</p>
                {onGenerate && (
                  <Button onClick={onGenerate} disabled={isLoading}>
                    Generate Comprehensive Feedback
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" type="button" className="mt-4">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackDialog;