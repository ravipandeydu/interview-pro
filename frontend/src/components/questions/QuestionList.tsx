'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuestions } from '@/hooks/useQuestion';
import { QuestionCard } from './QuestionCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination2 } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Filter, Plus } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export default function QuestionList() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('');
  const [showInactive, setShowInactive] = useState(false);
  
  // Fetch questions with filters and pagination
  const { data, isLoading, error } = useQuestions({
    page,
    limit: 10,
    search,
    category: category || undefined,
    difficulty: difficulty || undefined,
    isActive: showInactive ? undefined : true,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The search is already reactive due to the useQuestions hook
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Interview Questions</h1>
        <Button onClick={() => router.push('/questions/new')}>
          <Plus className="mr-2 h-4 w-4" /> Add Question
        </Button>
      </div>

      <div className="bg-card rounded-lg p-4 mb-6 space-y-4">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {/* <SelectLabel>All Categories</SelectLabel> */}
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
                {/* <SelectLabel>All Difficulties</SelectLabel> */}
                <SelectItem value="EASY">Easy</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HARD">Hard</SelectItem>
                <SelectItem value="EXPERT">Expert</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" variant="secondary">
              <Filter className="h-4 w-4 mr-2" /> Filter
            </Button>
          </div>
        </form>
        
        <div className="flex items-center">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <Switch
              checked={showInactive}
              onCheckedChange={setShowInactive}
            />
            <span>Show inactive questions</span>
          </label>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-[180px] w-full" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-10">
          <p className="text-destructive">Error loading questions. Please try again.</p>
        </div>
      ) : data?.data?.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No questions found. Try adjusting your filters or create a new question.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data?.data?.map((question) => (
            <QuestionCard key={question.id} question={question} />
          ))}
          
          {data && data?.pagination?.totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination2
                currentPage={page}
                totalPages={data.pagination.totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}