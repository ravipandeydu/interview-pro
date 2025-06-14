'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useInterviews, useInterviewSubmissions } from '@/hooks/useInterview';
import { useAuth } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Search, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function HistoryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  
  // Fetch interviews
  const { data: interviews, isLoading } = useInterviews();
  
  // Filter interviews based on search term, status, and date range
  const filteredInterviews = interviews?.filter(interview => {
    // Search term filter
    const matchesSearch = searchTerm === '' || 
      interview.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'completed' && interview.status === 'completed') ||
      (statusFilter === 'scheduled' && interview.status === 'scheduled') ||
      (statusFilter === 'cancelled' && interview.status === 'cancelled');
    
    // Date range filter
    let matchesDateRange = true;
    if (dateRange.from) {
      matchesDateRange = matchesDateRange && new Date(interview.scheduledAt) >= dateRange.from;
    }
    if (dateRange.to) {
      matchesDateRange = matchesDateRange && new Date(interview.scheduledAt) <= dateRange.to;
    }
    
    return matchesSearch && matchesStatus && matchesDateRange;
  });
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500">Completed</Badge>;
      case 'scheduled':
        return <Badge variant="outline" className="text-blue-500 border-blue-500">Scheduled</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };
  
  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'scheduled':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'PPP');
  };
  
  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'p');
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <p>Loading history...</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Interview History</h1>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search interviews..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
            icon={<Search className="h-4 w-4" />}
          />
        </div>
        
        <div className="w-full md:w-[200px]">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full md:w-[240px]">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, 'LLL dd, y')} - {format(dateRange.to, 'LLL dd, y')}
                    </>
                  ) : (
                    format(dateRange.from, 'LLL dd, y')
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      {/* Interview List */}
      {filteredInterviews && filteredInterviews.length > 0 ? (
        <div className="space-y-4">
          {filteredInterviews.map((interview) => (
            <Card key={interview.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{interview.title}</CardTitle>
                    {/* <CardDescription className="mt-1">
                      {formatDate(interview.scheduledAt)} at {formatTime(interview.scheduledAt)}
                    </CardDescription> */}
                  </div>
                  {getStatusBadge(interview.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {getStatusIcon(interview.status)}
                  </div>
                  <div>
                    <p className="text-sm">
                      {interview.description || 'No description provided.'}
                    </p>
                    <div className="mt-2">
                      <span className="text-sm font-medium">Questions:</span>{' '}
                      <span className="text-sm">{interview.questions?.length || 0}</span>
                    </div>
                    {interview.candidate && (
                      <div className="mt-1">
                        <span className="text-sm font-medium">Candidate:</span>{' '}
                        <span className="text-sm">{interview.candidate.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/50 flex justify-end gap-2 pt-2 pb-2">
                {interview.status === 'completed' && (
                  <Button 
                    onClick={() => router.push(`/submissions/${interview.id}/results`)}
                    variant="default"
                  >
                    View Results
                  </Button>
                )}
                {interview.status === 'scheduled' && (
                  <Button 
                    onClick={() => router.push(`/interviews/${interview.id}/join`)}
                    variant="default"
                  >
                    Join Interview
                  </Button>
                )}
                <Button 
                  onClick={() => router.push(`/interviews/${interview.id}`)}
                  variant="outline"
                >
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm || statusFilter !== 'all' || dateRange.from ? 
              'No interviews match your filters.' : 
              'No interviews found in your history.'}
          </p>
          <Button 
            onClick={() => router.push('/dashboard')} 
            className="mt-4"
          >
            Back to Dashboard
          </Button>
        </div>
      )}
    </div>
  );
}