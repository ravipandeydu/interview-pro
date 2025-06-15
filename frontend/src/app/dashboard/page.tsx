'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useInterviews } from '@/hooks/useInterview';
import { useAuth } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, ClockIcon, CodeIcon, CheckCircleIcon, XCircleIcon, ArrowRight, PieChart, Calendar, Clock } from 'lucide-react';
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

  // Filter interviews by status
  const upcomingInterviews = interviewsData?.data.filter(
    (interview) => interview.status === 'SCHEDULED'
  ) || [];
  
  const pastInterviews = interviewsData?.data.filter(
    (interview) => ["COMPLETED", "CANCELLED"].includes(interview.status)
  ) || [];

  // Calculate stats
  const completedCount = pastInterviews.filter(i => i.status === 'COMPLETED').length;
  const successRate = pastInterviews.length > 0 
    ? Math.round((completedCount / pastInterviews.length) * 100)
    : 0;

  // Stats card colors
  const statsColors = [
    { bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', icon: 'text-indigo-500', iconBg: 'bg-indigo-500/20' },
    { bg: 'bg-purple-500/10', border: 'border-purple-500/30', icon: 'text-purple-500', iconBg: 'bg-purple-500/20' },
    { bg: 'bg-violet-500/10', border: 'border-violet-500/30', icon: 'text-violet-500', iconBg: 'bg-violet-500/20' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900/20 via-background to-violet-900/10 dark:from-indigo-950/30 dark:via-background dark:to-violet-950/20 relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-emerald-600/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 dark:from-indigo-400 dark:via-purple-400 dark:to-violet-400">Dashboard</h1>
            <p className="text-foreground/70 mt-1">Welcome back, {user?.name || 'User'}</p>
          </div>
          <Button 
            onClick={() => router.push('/interviews/new')} 
            className="backdrop-blur-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/20 border-0 transition-all duration-300 hover:scale-105"
          >
            <span className="flex items-center gap-2">Create New Interview <ArrowRight className="h-4 w-4" /></span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Upcoming Interviews Card */}
          <Card className="backdrop-blur-md bg-background/40 border border-indigo-500/20 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-70 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <CardHeader className="pb-2 relative z-10">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${statsColors[0].iconBg}`}>
                  <Calendar className={`h-5 w-5 ${statsColors[0].icon}`} />
                </div>
                <div>
                  <CardTitle>Upcoming Interviews</CardTitle>
                  <CardDescription>Scheduled interviews</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                {upcomingInterviews.length}
              </div>
            </CardContent>
          </Card>
          
          {/* Completed Interviews Card */}
          <Card className="backdrop-blur-md bg-background/40 border border-purple-500/20 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-violet-500/5 opacity-70 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <CardHeader className="pb-2 relative z-10">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${statsColors[1].iconBg}`}>
                  <CheckCircleIcon className={`h-5 w-5 ${statsColors[1].icon}`} />
                </div>
                <div>
                  <CardTitle>Completed Interviews</CardTitle>
                  <CardDescription>Past interviews</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-violet-600 dark:from-purple-400 dark:to-violet-400">
                {completedCount}
              </div>
            </CardContent>
          </Card>
          
          {/* Success Rate Card */}
          <Card className="backdrop-blur-md bg-background/40 border border-violet-500/20 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-indigo-500/5 opacity-70 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <CardHeader className="pb-2 relative z-10">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${statsColors[2].iconBg}`}>
                  <PieChart className={`h-5 w-5 ${statsColors[2].icon}`} />
                </div>
                <div>
                  <CardTitle>Success Rate</CardTitle>
                  <CardDescription>Based on completed interviews</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400">
                {pastInterviews.length > 0 ? `${successRate}%` : 'N/A'}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="backdrop-blur-md bg-background/40 border border-indigo-500/20 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 opacity-70 pointer-events-none" />
          <CardHeader className="relative z-10">
            <CardTitle className="text-2xl font-semibold text-indigo-950 dark:text-indigo-100">Interview Management</CardTitle>
            <CardDescription className="text-indigo-700/70 dark:text-indigo-300/70">
              View and manage your upcoming and past interviews
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10 pt-4">
            <Tabs defaultValue="upcoming" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="grid w-full md:w-[400px] grid-cols-2 backdrop-blur-sm bg-background/50 border border-indigo-500/20 rounded-lg p-1">
                <TabsTrigger 
                  value="upcoming"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-indigo-700 dark:data-[state=active]:text-indigo-300 data-[state=active]:shadow-sm rounded-md transition-all duration-300"
                >
                  Upcoming
                </TabsTrigger>
                <TabsTrigger 
                  value="past"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-violet-500/20 data-[state=active]:text-purple-700 dark:data-[state=active]:text-purple-300 data-[state=active]:shadow-sm rounded-md transition-all duration-300"
                >
                  Past
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="upcoming" className="mt-6">
                {isLoading ? (
                  <div className="text-center py-8">Loading interviews...</div>
                ) : error ? (
                  <div className="text-center py-8 text-red-500">
                    Error loading interviews. Please try again.
                  </div>
                ) : upcomingInterviews.length === 0 ? (
                  <div className="text-center py-12 space-y-4">
                    <p className="text-lg text-foreground/70">No upcoming interviews found.</p>
                    <Button 
                      onClick={() => router.push('/interviews/new')}
                      className="backdrop-blur-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md shadow-indigo-500/20 border-0 transition-all duration-300 hover:scale-105"
                    >
                      Schedule an Interview
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {upcomingInterviews.map((interview) => (
                      <Card 
                        key={interview.id} 
                        className="cursor-pointer backdrop-blur-md bg-background/40 border border-indigo-500/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-5px] overflow-hidden group"
                        onClick={() => handleInterviewClick(interview)}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
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
                              <span className="text-foreground/80">{formatInterviewDate(interview.candidateStartedAt)}</span>
                            </div>
                            <div className="flex items-center">
                              <ClockIcon className="mr-2 h-4 w-4 text-purple-500" />
                              <span className="text-foreground/80">
                                {formatInterviewTime(interview.candidateStartedAt)} - {formatInterviewTime(interview.candidateCompletedAt)}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <CodeIcon className="mr-2 h-4 w-4 text-violet-500" />
                              <span className="text-foreground/80">{interview.questions.length} questions</span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="relative z-10">
                          <Button 
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 shadow-md shadow-indigo-500/20 transition-all duration-300"
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
                  <div className="text-center py-12">
                    <p className="text-lg text-foreground/70">No past interviews found.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pastInterviews.map((interview) => (
                      <Card 
                        key={interview.id} 
                        className="cursor-pointer backdrop-blur-md bg-background/40 border border-purple-500/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-5px] overflow-hidden group"
                        onClick={() => handleInterviewClick(interview)}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
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
                              <CalendarIcon className="mr-2 h-4 w-4 text-purple-500" />
                              <span className="text-foreground/80">{formatInterviewDate(interview.candidateStartedAt)}</span>
                            </div>
                            <div className="flex items-center">
                              <ClockIcon className="mr-2 h-4 w-4 text-violet-500" />
                              <span className="text-foreground/80">
                                {formatInterviewTime(interview.candidateStartedAt)} - {formatInterviewTime(interview.candidateCompletedAt)}
                              </span>
                            </div>
                            <div className="flex items-center">
                              {interview.status === 'COMPLETED' ? (
                                <CheckCircleIcon className="mr-2 h-4 w-4 text-emerald-500" />
                              ) : (
                                <XCircleIcon className="mr-2 h-4 w-4 text-rose-500" />
                              )}
                              <span className="text-foreground/80">
                                {interview.status === 'COMPLETED' ? 'Completed' : 'Cancelled'}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="relative z-10">
                          <Button 
                            className="w-full"
                            variant={interview.status === 'COMPLETED' ? 'default' : 'outline'}
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/submissions/${interview.id}/results`);
                            }}
                          >
                            {interview.status === 'COMPLETED' ? 'View Results' : 'View Details'}
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}