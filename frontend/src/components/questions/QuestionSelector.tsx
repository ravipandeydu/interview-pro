'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { QuestionService, Question } from '@/services/questionService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Pagination2 } from '@/components/ui/pagination';
import { Search, Filter, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

interface QuestionSelectorProps {
  interviewId: string;
  onAddQuestions: (questions: Array<{ questionId: string }>) => void;
  existingQuestionIds?: string[];
  onCancel?: () => void;
}

export function QuestionSelector({
  interviewId,
  onAddQuestions,
  existingQuestionIds = [],
  onCancel,
}: QuestionSelectorProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('');
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);

  // Fetch questions
  const { data, isLoading, error } = useQuery({
    queryKey: ['questions', page, search, category, difficulty],
    queryFn: () =>
      QuestionService.getQuestions(page, 10, {
        search,
        category: category || undefined,
        difficulty: difficulty || undefined,
      }),
  });

  // Reset selected questions when component mounts
  useEffect(() => {
    setSelectedQuestions([]);
  }, []);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The search is already handled by the useQuery hook
  };

  // Handle question selection
  const toggleQuestionSelection = (questionId: string) => {
    setSelectedQuestions((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  // Handle add selected questions
  const handleAddQuestions = () => {
    if (selectedQuestions.length === 0) {
      toast.error('Please select at least one question');
      return;
    }

    const questionsToAdd = selectedQuestions.map((questionId) => ({ questionId }));
    onAddQuestions(questionsToAdd);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Add Questions</CardTitle>
        <CardDescription>
          Select questions to add to this interview
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search and filters */}
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search questions..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {/* <SelectItem value="">All Categories</SelectItem> */}
                <SelectItem value="TECHNICAL">Technical</SelectItem>
                <SelectItem value="BEHAVIORAL">Behavioral</SelectItem>
                <SelectItem value="SITUATIONAL">Situational</SelectItem>
                <SelectItem value="EXPERIENCE">Experience</SelectItem>
                <SelectItem value="CULTURAL_FIT">Cultural Fit</SelectItem>
                <SelectItem value="PROBLEM_SOLVING">Problem Solving</SelectItem>
              </SelectContent>
            </Select>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                {/* <SelectItem value="">All Difficulties</SelectItem> */}
                <SelectItem value="EASY">Easy</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HARD">Hard</SelectItem>
                <SelectItem value="EXPERT">Expert</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" variant="secondary">
              <Filter className="h-4 w-4 mr-2" /> Filter
            </Button>
          </form>

          {/* Questions list */}
          {isLoading ? (
            <div className="py-8 text-center">Loading questions...</div>
          ) : error ? (
            <div className="py-8 text-center text-destructive">
              Error loading questions. Please try again.
            </div>
          ) : data?.data?.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No questions found. Try adjusting your filters.
            </div>
          ) : (
            <div className="space-y-4">
              {data?.data?.map((question) => {
                const isDisabled = existingQuestionIds.includes(question.id);
                return (
                  <div
                    key={question.id}
                    className={`p-4 border rounded-md ${isDisabled ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={`question-${question.id}`}
                        checked={selectedQuestions.includes(question.id)}
                        onCheckedChange={() => toggleQuestionSelection(question.id)}
                        disabled={isDisabled}
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <label
                            htmlFor={`question-${question.id}`}
                            className="text-base font-medium cursor-pointer"
                          >
                            {question.content}
                          </label>
                          <Badge>{question.category}</Badge>
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{question.difficulty}</span>
                          {question.tags?.length > 0 && (
                            <>
                              <span>•</span>
                              <div className="flex flex-wrap gap-1">
                                {question.tags.map((tag, i) => (
                                  <span key={i} className="text-xs bg-secondary px-1.5 py-0.5 rounded">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {isDisabled && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        This question is already added to the interview
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Pagination */}
              {data && data.pagination.totalPages > 0 && (
                <div className="mt-4">
                  <Pagination2
                    currentPage={page}
                    totalPages={data.pagination.totalPages}
                    onPageChange={(newPage) => setPage(newPage)}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" /> Cancel
        </Button>
        <Button onClick={handleAddQuestions} disabled={selectedQuestions.length === 0}>
          <Plus className="h-4 w-4 mr-2" /> Add Selected Questions
        </Button>
      </CardFooter>
    </Card>
  );
}

export default QuestionSelector;