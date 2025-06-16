"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuestions } from "@/hooks/useQuestion";
import { QuestionCard } from "./QuestionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pagination2 } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, Plus, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export default function QuestionList() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [difficulty, setDifficulty] = useState<string>("All");
  const [showInactive, setShowInactive] = useState(false);

  // Fetch questions with filters and pagination
  const { data, isLoading, error } = useQuestions({
    page,
    limit: 10,
    search,
    category: category === "All" ? undefined : category || undefined,
    difficulty: difficulty === "All" ? undefined : difficulty || undefined,
    isActive: showInactive ? undefined : true,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The search is already reactive due to the useQuestions hook
  };

  // Category and difficulty options with colors
  const categoryOptions = [
    {
      value: "TECHNICAL",
      label: "Technical",
      color:
        "bg-blue-500/20 text-blue-600 dark:text-blue-300 border-blue-500/30",
    },
    {
      value: "BEHAVIORAL",
      label: "Behavioral",
      color:
        "bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-500/30",
    },
    {
      value: "SITUATIONAL",
      label: "Situational",
      color:
        "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30",
    },
    {
      value: "EXPERIENCE",
      label: "Experience",
      color:
        "bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/30",
    },
    {
      value: "CULTURAL_FIT",
      label: "Cultural Fit",
      color:
        "bg-rose-500/20 text-rose-600 dark:text-rose-300 border-rose-500/30",
    },
    {
      value: "PROBLEM_SOLVING",
      label: "Problem Solving",
      color:
        "bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border-cyan-500/30",
    },
  ];

  const difficultyOptions = [
    {
      value: "EASY",
      label: "Easy",
      color:
        "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30",
    },
    {
      value: "MEDIUM",
      label: "Medium",
      color:
        "bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/30",
    },
    {
      value: "HARD",
      label: "Hard",
      color:
        "bg-orange-500/20 text-orange-600 dark:text-orange-300 border-orange-500/30",
    },
    {
      value: "EXPERT",
      label: "Expert",
      color:
        "bg-rose-500/20 text-rose-600 dark:text-rose-300 border-rose-500/30",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900/10 via-background to-violet-900/10 dark:from-indigo-950/30 dark:via-background dark:to-violet-950/20 relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-emerald-600/5 rounded-full blur-3xl" />

      <div className="container mx-auto py-8 px-4 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 dark:from-indigo-400 dark:via-purple-400 dark:to-violet-400">
              Interview Questions
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your interview question library
            </p>
          </div>
          <Button
            onClick={() => router.push("/questions/new")}
            className="backdrop-blur-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/30 border-0 transition-all duration-300 hover:scale-105"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Question
          </Button>
        </div>

        <div className="backdrop-blur-md bg-background/40 border border-indigo-500/20 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 mb-8 space-y-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />

          <form
            onSubmit={handleSearch}
            className="flex flex-col lg:flex-row gap-4 relative z-10"
          >
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                className="pl-10 bg-background/50 backdrop-blur-sm border-indigo-500/30 focus:border-indigo-500/50 h-12 rounded-lg"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-[180px] bg-background/50 backdrop-blur-sm border-indigo-500/30 focus:border-indigo-500/50 h-12 rounded-lg">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  {categoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger className="w-[180px] bg-background/50 backdrop-blur-sm border-indigo-500/30 focus:border-indigo-500/50 h-12 rounded-lg">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Difficulties</SelectItem>
                  {difficultyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="submit"
                variant="secondary"
                className="bg-background/50 backdrop-blur-sm border border-indigo-500/30 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 h-12 rounded-lg"
              >
                <Filter className="h-4 w-4 mr-2" /> Filter
              </Button>
            </div>
          </form>

          <div className="flex items-center justify-between flex-wrap gap-4 relative z-10">
            <div className="flex items-center">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Switch
                  checked={showInactive}
                  onCheckedChange={setShowInactive}
                />
                <span>Show inactive questions</span>
              </label>
            </div>

            {/* Active filters display */}
            <div className="flex flex-wrap gap-2">
              {category && (
                <Badge
                  variant="outline"
                  className={
                    categoryOptions.find((o) => o.value === category)?.color ||
                    ""
                  }
                >
                  {categoryOptions.find((o) => o.value === category)?.label}
                </Badge>
              )}
              {difficulty && (
                <Badge
                  variant="outline"
                  className={
                    difficultyOptions.find((o) => o.value === difficulty)
                      ?.color || ""
                  }
                >
                  {difficultyOptions.find((o) => o.value === difficulty)?.label}
                </Badge>
              )}
              {showInactive && (
                <Badge
                  variant="outline"
                  className="bg-gray-500/20 text-gray-600 dark:text-gray-300 border-gray-500/30"
                >
                  Including Inactive
                </Badge>
              )}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="backdrop-blur-md bg-background/40 border border-indigo-500/10 rounded-xl p-6 overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />
                <div className="flex justify-between items-start gap-4 mb-4">
                  <Skeleton className="h-6 w-3/4" />
                  <div className="flex flex-col gap-2 items-end">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </div>
                <Skeleton className="h-16 w-full mt-4" />
                <div className="flex justify-end gap-2 mt-6">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            ))}
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-16 backdrop-blur-md bg-background/40 border border-red-500/20 rounded-xl">
            <div className="text-destructive text-lg font-medium">
              Error loading questions
            </div>
            <p className="text-muted-foreground mt-2">
              Please try refreshing the page
            </p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="mt-4 border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50/20 dark:hover:bg-red-950/20"
            >
              Retry
            </Button>
          </div>
        ) : data?.data?.length === 0 ? (
          <div className="text-center py-16 backdrop-blur-md bg-background/40 border border-indigo-500/20 rounded-xl">
            <div className="text-xl font-medium">No questions found</div>
            <p className="text-muted-foreground mt-2">
              Try adjusting your filters or create a new question
            </p>
            <Button
              onClick={() => router.push("/questions/new")}
              className="mt-4 backdrop-blur-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/30 border-0 transition-all duration-300 hover:scale-105"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Question
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {data?.data?.map((question) => (
              <QuestionCard key={question.id} question={question} />
            ))}

            {data && data?.pagination?.totalPages > 1 && (
              <div className="mt-8 flex justify-center">
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
    </div>
  );
}
