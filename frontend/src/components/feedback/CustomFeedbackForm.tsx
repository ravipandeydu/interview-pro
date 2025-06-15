import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FeedbackOptions } from '@/services/feedbackService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';

interface CustomFeedbackFormProps {
  onSubmit: (options: FeedbackOptions) => void;
  isLoading?: boolean;
  responseId: string;
}

export const CustomFeedbackForm: React.FC<CustomFeedbackFormProps> = ({
  onSubmit,
  isLoading = false,
  responseId,
}) => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FeedbackOptions>({
    defaultValues: {
      includeHeader: true,
      includeScore: true,
      includeStrengths: true,
      includeWeaknesses: true,
      includeSuggestions: true,
      includeCodeQualityMetrics: true,
      includeFooter: true,
      customHeader: '',
      customFooter: '',
    },
  });

  const includeHeader = watch('includeHeader');
  const includeFooter = watch('includeFooter');

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Customize Feedback</CardTitle>
        <CardDescription>
          Select which elements to include in the generated feedback for response ID: {responseId}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="custom-feedback-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeHeader"
                {...register('includeHeader')}
                defaultChecked
              />
              <Label htmlFor="includeHeader" className="font-medium">Include Header</Label>
            </div>
            
            {includeHeader && (
              <div className="ml-6">
                <Label htmlFor="customHeader" className="text-sm text-muted-foreground mb-2 block">
                  Custom Header (optional)
                </Label>
                <Textarea
                  id="customHeader"
                  placeholder="Enter a custom header for your feedback..."
                  className="resize-none"
                  {...register('customHeader')}
                />
              </div>
            )}

            <Separator />
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeScore"
                {...register('includeScore')}
                defaultChecked
              />
              <Label htmlFor="includeScore" className="font-medium">Include Score</Label>
            </div>

            <Separator />
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeStrengths"
                {...register('includeStrengths')}
                defaultChecked
              />
              <Label htmlFor="includeStrengths" className="font-medium">Include Strengths</Label>
            </div>

            <Separator />
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeWeaknesses"
                {...register('includeWeaknesses')}
                defaultChecked
              />
              <Label htmlFor="includeWeaknesses" className="font-medium">Include Areas for Improvement</Label>
            </div>

            <Separator />
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeSuggestions"
                {...register('includeSuggestions')}
                defaultChecked
              />
              <Label htmlFor="includeSuggestions" className="font-medium">Include Suggestions</Label>
            </div>

            <Separator />
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeCodeQualityMetrics"
                {...register('includeCodeQualityMetrics')}
                defaultChecked
              />
              <Label htmlFor="includeCodeQualityMetrics" className="font-medium">Include Code Quality Metrics</Label>
            </div>

            <Separator />
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeFooter"
                {...register('includeFooter')}
                defaultChecked
              />
              <Label htmlFor="includeFooter" className="font-medium">Include Footer</Label>
            </div>
            
            {includeFooter && (
              <div className="ml-6">
                <Label htmlFor="customFooter" className="text-sm text-muted-foreground mb-2 block">
                  Custom Footer (optional)
                </Label>
                <Textarea
                  id="customFooter"
                  placeholder="Enter a custom footer for your feedback..."
                  className="resize-none"
                  {...register('customFooter')}
                />
              </div>
            )}
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button
          type="submit"
          form="custom-feedback-form"
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Custom Feedback'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CustomFeedbackForm;