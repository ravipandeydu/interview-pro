'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuestionOperations } from '../../hooks/useQuestion';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter } from '../ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Question } from '../../services/questionService';
import { Badge } from '../ui/badge';
import { X } from 'lucide-react';

// Define the form schema with Zod
const questionFormSchema = z.object({
  content: z.string().min(5, { message: 'Question content must be at least 5 characters' }),
  category: z.enum([
    'TECHNICAL',
    'BEHAVIORAL',
    'SITUATIONAL',
    'EXPERIENCE',
    'CULTURAL_FIT',
    'PROBLEM_SOLVING'
  ]),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'EXPERT']),
  expectedAnswer: z.string().optional(),
  tags: z.string().optional(),
  isActive: z.boolean().default(true),
});

type QuestionFormValues = z.infer<typeof questionFormSchema>;

interface QuestionFormProps {
  question?: Question;
  isEditing?: boolean;
}

export default function QuestionForm({ question, isEditing = false }: QuestionFormProps) {
  const router = useRouter();
  const { createQuestion, updateQuestion } = useQuestionOperations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(question?.tags || []);

  // Convert tags array to comma-separated string for the form
  const defaultValues: Partial<QuestionFormValues> = {
    content: question?.content || '',
    category: question?.category || 'TECHNICAL',
    difficulty: question?.difficulty || 'MEDIUM',
    expectedAnswer: question?.expectedAnswer || '',
    isActive: question?.isActive !== undefined ? question.isActive : true,
  };

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
    defaultValues,
  });

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const onSubmit = async (data: QuestionFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Prepare the data for API
      const questionData = {
        ...data,
        tags, // Use the tags state instead of form data
      };
      
      if (isEditing && question) {
        // Update existing question
        await updateQuestion.mutateAsync({
          id: question.id,
          ...questionData,
        });
        
        toast.success('Question Updated', {
          description: 'The question has been successfully updated.',
        });
      } else {
        // Create new question
        await createQuestion.mutateAsync(questionData);
        
        toast.success('Question Created', {
          description: 'The question has been successfully created.',
        });
      }
      
      // Redirect to questions list
      router.push('/questions');
    } catch (error) {
      console.error('Failed to save question:', error);
      toast.error('Error', {
        description: 'Failed to save question. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter the question content"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The main content of your interview question.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="TECHNICAL">Technical</SelectItem>
                        <SelectItem value="BEHAVIORAL">Behavioral</SelectItem>
                        <SelectItem value="SITUATIONAL">Situational</SelectItem>
                        <SelectItem value="EXPERIENCE">Experience</SelectItem>
                        <SelectItem value="CULTURAL_FIT">Cultural Fit</SelectItem>
                        <SelectItem value="PROBLEM_SOLVING">Problem Solving</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The category of the question.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="EASY">Easy</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HARD">Hard</SelectItem>
                        <SelectItem value="EXPERT">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The difficulty level of the question.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="expectedAnswer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expected Answer (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter the expected answer or evaluation criteria"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Guidelines for evaluating candidate responses.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Tags</FormLabel>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Add tags (press Enter)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1"
                />
                <Button type="button" onClick={addTag} variant="secondary">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <FormDescription className="mt-2">
                Add relevant tags to help with question categorization and searching.
              </FormDescription>
            </div>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Status</FormLabel>
                    <FormDescription>
                      Inactive questions won't appear in question selectors.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/questions')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : isEditing ? 'Update Question' : 'Create Question'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}