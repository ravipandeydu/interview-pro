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
import { CalendarIcon, ClockIcon, UserIcon, Search, Filter, Plus } from 'lucide-react';
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
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Scheduled</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">In Progress</Badge>;
      case 'COMPLETED':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case 'CANCELLED':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Interviews</h1>
          <Button onClick={() => router.push('/interviews/new')}>
            <Plus className="mr-2 h-4 w-4" /> Create Interview
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search interviews..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div className="w-full md:w-[200px]">
            <Select value={status || 'ALL'} onValueChange={handleStatusChange}>
              <SelectTrigger>
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
          <Button onClick={handleSearch}>
            <Filter className="h-4 w-4 mr-2" /> Filter
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-8 w-20" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            Error loading interviews. Please try again.
          </div>
        ) : data?.data && data.data.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.data.map((interview) => (
              <Card 
                key={interview.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(`/interviews/${interview.id}`)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{interview.title}</CardTitle>
                    {getStatusBadge(interview.status)}
                  </div>
                  <CardDescription className="line-clamp-2">
                    {interview.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                      <span>{formatInterviewDate(interview.scheduledDate)}</span>
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="mr-2 h-4 w-4 opacity-70" />
                      <span>{interview.duration} minutes</span>
                    </div>
                    <div className="flex items-center">
                      <UserIcon className="mr-2 h-4 w-4 opacity-70" />
                      <span>{interview.questions?.length || 0} questions</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    variant={interview.status === 'SCHEDULED' ? 'default' : 'outline'}
                  >
                    {interview.status === 'SCHEDULED' ? 'Join Interview' : 'View Details'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No interviews found</p>
            <Button onClick={() => router.push('/interviews/new')} className="mt-4">
              Create Your First Interview
            </Button>
          </div>
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
                  className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
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
                  className={page >= Math.ceil(data.pagination.total / limit) ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}