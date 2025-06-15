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
import { X, Sparkles, CheckCircle } from 'lucide-react';

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

// Category and difficulty color mappings
const categoryColors = {
  TECHNICAL: 'from-blue-500 to-cyan-500 border-blue-500/30 text-blue-600 dark:text-blue-300',
  BEHAVIORAL: 'from-purple-500 to-violet-500 border-purple-500/30 text-purple-600 dark:text-purple-300',
  SITUATIONAL: 'from-emerald-500 to-green-500 border-emerald-500/30 text-emerald-600 dark:text-emerald-300',
  EXPERIENCE: 'from-amber-500 to-yellow-500 border-amber-500/30 text-amber-600 dark:text-amber-300',
  CULTURAL_FIT: 'from-rose-500 to-pink-500 border-rose-500/30 text-rose-600 dark:text-rose-300',
  PROBLEM_SOLVING: 'from-indigo-500 to-blue-500 border-indigo-500/30 text-indigo-600 dark:text-indigo-300',
};

const difficultyColors = {
  EASY: 'from-emerald-500 to-green-500 border-emerald-500/30 text-emerald-600 dark:text-emerald-300',
  MEDIUM: 'from-blue-500 to-cyan-500 border-blue-500/30 text-blue-600 dark:text-blue-300',
  HARD: 'from-amber-500 to-orange-500 border-amber-500/30 text-amber-600 dark:text-amber-300',
  EXPERT: 'from-rose-500 to-red-500 border-rose-500/30 text-rose-600 dark:text-rose-300',
};

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
    <div className="relative">
      {/* Abstract Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl animate-blob" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-emerald-600/5 rounded-full blur-3xl animation-delay-4000" />
      
      <Card className="backdrop-blur-md bg-background/60 border border-indigo-500/20 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden relative z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />
        
        <CardContent className="pt-6 relative z-10">
          <div className="mb-6">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 dark:from-indigo-400 dark:via-purple-400 dark:to-violet-400 inline-flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-500" />
              {isEditing ? 'Edit Question' : 'Create New Question'}
            </h2>
            <p className="text-foreground/70 mt-1">
              {isEditing ? 'Update the details of your interview question' : 'Add a new question to your interview question bank'}
            </p>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-medium">Question Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter the question content"
                        className="min-h-[100px] backdrop-blur-sm bg-background/50 border-indigo-500/20 focus:border-indigo-500/40 focus:ring-indigo-500/30 transition-all"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-foreground/60">
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
                      <FormLabel className="text-foreground font-medium">Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="backdrop-blur-sm bg-background/50 border-indigo-500/20 focus:border-indigo-500/40 focus:ring-indigo-500/30 transition-all">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="backdrop-blur-md bg-background/80 border-indigo-500/20">
                          <SelectItem value="TECHNICAL">Technical</SelectItem>
                          <SelectItem value="BEHAVIORAL">Behavioral</SelectItem>
                          <SelectItem value="SITUATIONAL">Situational</SelectItem>
                          <SelectItem value="EXPERIENCE">Experience</SelectItem>
                          <SelectItem value="CULTURAL_FIT">Cultural Fit</SelectItem>
                          <SelectItem value="PROBLEM_SOLVING">Problem Solving</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-foreground/60">
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
                      <FormLabel className="text-foreground font-medium">Difficulty</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="backdrop-blur-sm bg-background/50 border-indigo-500/20 focus:border-indigo-500/40 focus:ring-indigo-500/30 transition-all">
                            <SelectValue placeholder="Select difficulty level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="backdrop-blur-md bg-background/80 border-indigo-500/20">
                          <SelectItem value="EASY">Easy</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="HARD">Hard</SelectItem>
                          <SelectItem value="EXPERT">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-foreground/60">
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
                    <FormLabel className="text-foreground font-medium">Expected Answer (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter the expected answer or evaluation criteria"
                        className="min-h-[100px] backdrop-blur-sm bg-background/50 border-indigo-500/20 focus:border-indigo-500/40 focus:ring-indigo-500/30 transition-all"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-foreground/60">
                      Guidelines for evaluating candidate responses.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel className="text-foreground font-medium">Tags</FormLabel>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add tags (press Enter)"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 backdrop-blur-sm bg-background/50 border-indigo-500/20 focus:border-indigo-500/40 focus:ring-indigo-500/30 transition-all"
                  />
                  <Button 
                    type="button" 
                    onClick={addTag} 
                    variant="secondary"
                    className="backdrop-blur-sm bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30 transition-all"
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="px-3 py-1 backdrop-blur-sm bg-background/50 border border-indigo-500/30 text-indigo-600 dark:text-indigo-300 flex items-center gap-1 transition-all hover:bg-indigo-500/10"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-indigo-500/70 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <FormDescription className="text-foreground/60 mt-2">
                  Add relevant tags to help with question categorization and searching.
                </FormDescription>
              </div>

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-indigo-500/20 p-4 backdrop-blur-sm bg-background/50 shadow-sm transition-all hover:bg-indigo-500/5">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base font-medium">Active Status</FormLabel>
                      <FormDescription className="text-foreground/60">
                        Inactive questions won't appear in question selectors.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-gradient-to-r from-indigo-600 to-purple-600 data-[state=checked]:border-indigo-500/30"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/questions')}
                  className="backdrop-blur-sm bg-background/50 border-indigo-500/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 transition-all"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="backdrop-blur-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/30 border-0 transition-all duration-300 hover:scale-105"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white/80 rounded-full animate-spin"></div>
                      <span>{isEditing ? 'Updating...' : 'Creating...'}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {isEditing ? 'Update Question' : 'Create Question'}
                      {!isSubmitting && <CheckCircle className="h-4 w-4" />}
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}