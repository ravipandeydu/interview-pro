'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useInterviews } from '@/hooks/useInterview';
import { useAuth } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, ClockIcon, CodeIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Interview } from '@/services/interviewService';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('upcoming');
  
  // Fetch interviews with pagination
  const { data: interviewsData, isLoading, error } = useInterviews();

  // Handle interview card click
  const handleInterviewClick = (interview: Interview) => {
    router.push(`/interviews/${interview.id}`);
  };

  // Handle join interview
  const handleJoinInterview = (interviewId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    router.push(`/interviews/${interviewId}/join`);
  };

  // Format interview date
  const formatInterviewDate = (dateString: string) => {
    return format(new Date(dateString), 'PPP');
  };

  // Format interview time
  const formatInterviewTime = (dateString: string) => {
    return format(new Date(dateString), 'p');
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Scheduled</Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">In Progress</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Filter interviews by status
  const upcomingInterviews = interviewsData?.data.filter(
    (interview) => interview.status === 'scheduled'
  ) || [];
  
  const pastInterviews = interviewsData?.data.filter(
    (interview) => ['completed', 'cancelled'].includes(interview.status)
  ) || [];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button onClick={() => router.push('/interviews/new')}>
          Create New Interview
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Upcoming Interviews</CardTitle>
            <CardDescription>Scheduled interviews</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{upcomingInterviews.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Completed Interviews</CardTitle>
            <CardDescription>Past interviews</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {pastInterviews.filter(i => i.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Success Rate</CardTitle>
            <CardDescription>Based on completed interviews</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {pastInterviews.length > 0 
                ? `${Math.round((pastInterviews.filter(i => i.status === 'completed').length / pastInterviews.length) * 100)}%` 
                : 'N/A'}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="upcoming" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="mt-6">
          {isLoading ? (
            <div className="text-center py-8">Loading interviews...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              Error loading interviews. Please try again.
            </div>
          ) : upcomingInterviews.length === 0 ? (
            <div className="text-center py-8">
              No upcoming interviews found.
              <div className="mt-4">
                <Button onClick={() => router.push('/interviews/new')}>
                  Schedule an Interview
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingInterviews.map((interview) => (
                <Card 
                  key={interview.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleInterviewClick(interview)}
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
                        <span>{formatInterviewDate(interview.startTime)}</span>
                      </div>
                      <div className="flex items-center">
                        <ClockIcon className="mr-2 h-4 w-4 opacity-70" />
                        <span>
                          {formatInterviewTime(interview.startTime)} - {formatInterviewTime(interview.endTime)}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <CodeIcon className="mr-2 h-4 w-4 opacity-70" />
                        <span>{interview.questions.length} questions</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      onClick={(e) => handleJoinInterview(interview.id, e)}
                    >
                      Join Interview
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="past" className="mt-6">
          {isLoading ? (
            <div className="text-center py-8">Loading interviews...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              Error loading interviews. Please try again.
            </div>
          ) : pastInterviews.length === 0 ? (
            <div className="text-center py-8">No past interviews found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastInterviews.map((interview) => (
                <Card 
                  key={interview.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleInterviewClick(interview)}
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
                        <span>{formatInterviewDate(interview.startTime)}</span>
                      </div>
                      <div className="flex items-center">
                        <ClockIcon className="mr-2 h-4 w-4 opacity-70" />
                        <span>
                          {formatInterviewTime(interview.startTime)} - {formatInterviewTime(interview.endTime)}
                        </span>
                      </div>
                      <div className="flex items-center">
                        {interview.status === 'completed' ? (
                          <CheckCircleIcon className="mr-2 h-4 w-4 text-green-500" />
                        ) : (
                          <XCircleIcon className="mr-2 h-4 w-4 text-red-500" />
                        )}
                        <span>
                          {interview.status === 'completed' ? 'Completed' : 'Cancelled'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      variant={interview.status === 'completed' ? 'default' : 'outline'}
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/submissions/${interview.id}/results`);
                      }}
                    >
                      {interview.status === 'completed' ? 'View Results' : 'View Details'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}