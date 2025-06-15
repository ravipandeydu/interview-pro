'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useInterviews } from '@/hooks/useInterview';
import { Interview } from '@/services/interviewService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { CalendarIcon, ClockIcon, UserIcon, Search, Filter, Plus, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

export default function InterviewList() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch interviews with filters and pagination
  const { data, isLoading, error } = useInterviews(page, limit, {
    status,
    search: searchQuery
  });

  const handleSearch = () => {
    setSearchQuery(search);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value === 'ALL' ? undefined : value);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Format interview date
  const formatInterviewDate = (dateString: string | Date) => {
    return format(new Date(dateString), 'PPP');
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'SCHEDULED':
        return <Badge variant="outline" className="bg-blue-500/20 text-blue-600 dark:text-blue-300 border-blue-500/30">Scheduled</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="outline" className="bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/30">In Progress</Badge>;
      case 'COMPLETED':
        return <Badge variant="outline" className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30">Completed</Badge>;
      case 'CANCELLED':
        return <Badge variant="outline" className="bg-rose-500/20 text-rose-600 dark:text-rose-300 border-rose-500/30">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Card colors based on status
  const getCardColors = (status: string) => {
    switch (status.toUpperCase()) {
      case 'SCHEDULED':
        return { border: 'border-blue-500/20', hover: 'group-hover:border-blue-500/40', gradient: 'from-blue-500/5 to-indigo-500/5' };
      case 'IN_PROGRESS':
        return { border: 'border-amber-500/20', hover: 'group-hover:border-amber-500/40', gradient: 'from-amber-500/5 to-orange-500/5' };
      case 'COMPLETED':
        return { border: 'border-emerald-500/20', hover: 'group-hover:border-emerald-500/40', gradient: 'from-emerald-500/5 to-green-500/5' };
      case 'CANCELLED':
        return { border: 'border-rose-500/20', hover: 'group-hover:border-rose-500/40', gradient: 'from-rose-500/5 to-pink-500/5' };
      default:
        return { border: 'border-indigo-500/20', hover: 'group-hover:border-indigo-500/40', gradient: 'from-indigo-500/5 to-purple-500/5' };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900/20 via-background to-violet-900/10 dark:from-indigo-950/30 dark:via-background dark:to-violet-950/20 relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-emerald-600/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto py-8 px-4 relative z-10">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 dark:from-indigo-400 dark:via-purple-400 dark:to-violet-400">Interviews</h1>
              <p className="text-foreground/70 mt-1">Manage and track all your technical interviews</p>
            </div>
            <Button 
              onClick={() => router.push('/interviews/new')} 
              className="backdrop-blur-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/20 border-0 transition-all duration-300 hover:scale-105"
            >
              <Plus className="mr-2 h-4 w-4" /> Create Interview
            </Button>
          </div>

          <Card className="backdrop-blur-md bg-background/40 border border-indigo-500/20 shadow-lg overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 opacity-70 pointer-events-none" />
            <CardHeader className="relative z-10 pb-0">
              <CardTitle className="text-xl font-semibold text-indigo-950 dark:text-indigo-100">Search & Filter</CardTitle>
              <CardDescription className="text-indigo-700/70 dark:text-indigo-300/70">
                Find interviews by title, description or filter by status
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 pt-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-indigo-500" />
                  <Input
                    placeholder="Search interviews..."
                    className="pl-8 backdrop-blur-sm bg-background/50 border-indigo-500/20 focus:border-indigo-500/50 transition-all"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <div className="w-full md:w-[200px]">
                  <Select value={status || 'ALL'} onValueChange={handleStatusChange}>
                    <SelectTrigger className="backdrop-blur-sm bg-background/50 border-indigo-500/20 focus:border-indigo-500/50 transition-all">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Statuses</SelectItem>
                      <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleSearch}
                  className="backdrop-blur-sm bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-md shadow-purple-500/20 border-0 transition-all duration-300 hover:scale-105"
                >
                  <Filter className="h-4 w-4 mr-2" /> Filter
                </Button>
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="backdrop-blur-md bg-background/40 border border-indigo-500/20 shadow-lg overflow-hidden">
                  <CardHeader className="pb-2 relative z-10">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </CardContent>
                  <CardFooter className="relative z-10">
                    <Skeleton className="h-9 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card className="backdrop-blur-md bg-background/40 border border-rose-500/20 shadow-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-red-500/5 opacity-70 pointer-events-none" />
              <CardContent className="relative z-10 py-8 text-center">
                <p className="text-rose-600 dark:text-rose-400 font-medium">Error loading interviews. Please try again.</p>
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline" 
                  className="mt-4 border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-50/20"
                >
                  Retry
                </Button>
              </CardContent>
            </Card>
          ) : data?.data && data.data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.data.map((interview) => {
                const colors = getCardColors(interview.status);
                return (
                  <Card 
                    key={interview.id} 
                    className={`cursor-pointer backdrop-blur-md bg-background/40 border ${colors.border} shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-5px] overflow-hidden group`}
                    onClick={() => router.push(`/interviews/${interview.id}`)}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />
                    <CardHeader className="relative z-10">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl">{interview.title}</CardTitle>
                        {getStatusBadge(interview.status)}
                      </div>
                      <CardDescription className="line-clamp-2">
                        {interview.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <CalendarIcon className="mr-2 h-4 w-4 text-indigo-500" />
                          <span className="text-foreground/80">{formatInterviewDate(interview.scheduledDate)}</span>
                        </div>
                        <div className="flex items-center">
                          <ClockIcon className="mr-2 h-4 w-4 text-purple-500" />
                          <span className="text-foreground/80">{interview.duration} minutes</span>
                        </div>
                        <div className="flex items-center">
                          <UserIcon className="mr-2 h-4 w-4 text-violet-500" />
                          <span className="text-foreground/80">{interview.questions?.length || 0} questions</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="relative z-10">
                      <Button 
                        className="w-full"
                        variant={interview.status === 'SCHEDULED' ? 'default' : 'outline'}
                      >
                        {interview.status === 'SCHEDULED' ? (
                          <span className="flex items-center gap-2">Join Interview <ArrowRight className="h-4 w-4" /></span>
                        ) : (
                          'View Details'
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="backdrop-blur-md bg-background/40 border border-indigo-500/20 shadow-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 opacity-70 pointer-events-none" />
              <CardContent className="relative z-10 py-12 text-center">
                <p className="text-lg text-foreground/70 mb-4">No interviews found</p>
                <Button 
                  onClick={() => router.push('/interviews/new')} 
                  className="backdrop-blur-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md shadow-indigo-500/20 border-0 transition-all duration-300 hover:scale-105"
                >
                  <span className="flex items-center gap-2">Create Your First Interview <ArrowRight className="h-4 w-4" /></span>
                </Button>
              </CardContent>
            </Card>
          )}

          {data && data.pagination.total > limit && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page > 1) handlePageChange(page - 1);
                    }}
                    className={`${page <= 1 ? 'pointer-events-none opacity-50' : ''} backdrop-blur-sm bg-background/50 border-indigo-500/20 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 transition-all`}
                  />
                </PaginationItem>
                {Array.from({ length: Math.ceil(data.pagination.total / limit) }, (_, i) => i + 1).map((p) => (
                  <PaginationItem key={p}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(p);
                      }}
                      isActive={page === p}
                      className={`${page === p ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-500/30' : 'backdrop-blur-sm bg-background/50 border-indigo-500/20 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20'} transition-all`}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page < Math.ceil(data.pagination.total / limit)) handlePageChange(page + 1);
                    }}
                    className={`${page >= Math.ceil(data.pagination.total / limit) ? 'pointer-events-none opacity-50' : ''} backdrop-blur-sm bg-background/50 border-indigo-500/20 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 transition-all`}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </div>
    </div>
  );
}