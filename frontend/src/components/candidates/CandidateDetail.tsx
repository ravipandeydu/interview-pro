'use client';

import { useState } from 'react';
import { useCandidate } from '../../hooks/useCandidate';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { toast } from 'sonner';
import { User, Briefcase, Building, GraduationCap, BookOpen, FileText, Linkedin, Github, Globe, Pencil, Trash2, ArrowLeft, Calendar } from 'lucide-react';

interface CandidateDetailProps {
  candidateId: string;
}

export default function CandidateDetail({ candidateId }: CandidateDetailProps) {
  const router = useRouter();
  const { getCandidate, deleteCandidate } = useCandidate();
  const { data: candidate, isLoading, isError } = getCandidate(candidateId);
  const deleteMutation = deleteCandidate();

  const [activeTab, setActiveTab] = useState('details');

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(candidateId);
      toast.success('Candidate deleted successfully');
      router.push('/candidates');
    } catch (error) {
      console.error('Error deleting candidate:', error);
      toast.error('Failed to delete candidate');
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'default';
      case 'CONTACTED':
        return 'secondary';
      case 'INTERVIEW_SCHEDULED':
        return 'outline';
      case 'IN_PROCESS':
        return 'secondary';
      case 'OFFER_SENT':
        return 'destructive';
      case 'HIRED':
        return 'default';
      case 'REJECTED':
        return 'destructive';
      case 'ON_HOLD':
        return 'outline';
      default:
        return 'default';
    }
  };

  // Status color mappings for modern UI
  const getStatusColors = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-500/20 text-blue-600 dark:text-blue-300 border-blue-500/30';
      case 'CONTACTED':
        return 'bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-500/30';
      case 'INTERVIEW_SCHEDULED':
        return 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/30';
      case 'IN_PROCESS':
        return 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border-cyan-500/30';
      case 'OFFER_SENT':
        return 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30';
      case 'HIRED':
        return 'bg-green-500/20 text-green-600 dark:text-green-300 border-green-500/30';
      case 'REJECTED':
        return 'bg-rose-500/20 text-rose-600 dark:text-rose-300 border-rose-500/30';
      case 'ON_HOLD':
        return 'bg-gray-500/20 text-gray-600 dark:text-gray-300 border-gray-500/30';
      default:
        return 'bg-blue-500/20 text-blue-600 dark:text-blue-300 border-blue-500/30';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900/10 via-background to-violet-900/10 dark:from-indigo-950/30 dark:via-background dark:to-violet-950/20 relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-emerald-600/5 rounded-full blur-3xl animate-blob animation-delay-4000" />
        
        <div className="container mx-auto py-8 px-4 relative z-10">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-xl bg-indigo-500/10" />
              <Skeleton className="h-8 w-48 bg-indigo-500/10" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-20 rounded-md bg-indigo-500/10" />
              <Skeleton className="h-10 w-20 rounded-md bg-indigo-500/10" />
            </div>
          </div>

          <Card className="backdrop-blur-md bg-background/40 border border-indigo-500/20 shadow-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />
            <CardHeader className="relative z-10">
              <div className="flex justify-between items-center">
                <div>
                  <Skeleton className="h-6 w-48 bg-indigo-500/10" />
                  <Skeleton className="h-4 w-32 mt-2 bg-indigo-500/10" />
                </div>
                <Skeleton className="h-6 w-24 rounded-full bg-indigo-500/10" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="space-y-4">
                <Skeleton className="h-10 w-full bg-indigo-500/10" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-24 bg-indigo-500/10" />
                      <Skeleton className="h-5 w-full bg-indigo-500/10" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isError || !candidate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900/10 via-background to-violet-900/10 dark:from-indigo-950/30 dark:via-background dark:to-violet-950/20 relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-rose-600/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
        
        <div className="container mx-auto py-8 px-4 relative z-10">
          <Card className="backdrop-blur-md bg-background/40 border border-rose-500/20 shadow-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-red-500/5 pointer-events-none" />
            <CardHeader className="relative z-10">
              <CardTitle className="text-xl font-semibold text-rose-950 dark:text-rose-100">Error</CardTitle>
              <CardDescription className="text-rose-700/70 dark:text-rose-300/70">
                Failed to load candidate details
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <p>There was an error loading the candidate information. Please try again later.</p>
            </CardContent>
            <CardFooter className="relative z-10">
              <Button 
                onClick={() => router.push('/candidates')}
                className="backdrop-blur-sm bg-background/50 border border-indigo-500/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 transition-all duration-300"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Candidates
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900/10 via-background to-violet-900/10 dark:from-indigo-950/30 dark:via-background dark:to-violet-950/20 relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl animate-blob" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-emerald-600/5 rounded-full blur-3xl animate-blob animation-delay-4000" />
      
      <div className="container mx-auto py-8 px-4 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/10 rounded-xl backdrop-blur-sm border border-indigo-500/30">
              <User className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 dark:from-indigo-400 dark:via-purple-400 dark:to-violet-400">
              {candidate.fullName}
            </h1>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => router.push(`/candidates/${candidateId}/edit`)}
              className="backdrop-blur-sm bg-background/50 border-indigo-500/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 transition-all duration-300"
            >
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive"
                  className="backdrop-blur-sm bg-rose-500/80 hover:bg-rose-600/80 border-rose-500/30 text-white transition-all duration-300"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="backdrop-blur-md bg-background/80 border border-rose-500/20">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-red-500/5 pointer-events-none rounded-lg" />
                <AlertDialogHeader className="relative z-10">
                  <AlertDialogTitle className="text-rose-950 dark:text-rose-100">Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription className="text-rose-700/70 dark:text-rose-300/70">
                    This action cannot be undone. This will permanently delete the candidate and all associated data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="relative z-10">
                  <AlertDialogCancel className="backdrop-blur-sm bg-background/50 border-rose-500/30 text-rose-600 dark:text-rose-300 hover:bg-rose-50/20 dark:hover:bg-rose-950/20">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDelete}
                    className="backdrop-blur-sm bg-rose-500/80 hover:bg-rose-600/80 border-rose-500/30 text-white"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <Card className="backdrop-blur-md bg-background/40 border border-indigo-500/20 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />
          <CardHeader className="relative z-10">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl font-semibold text-indigo-950 dark:text-indigo-100">
                  {candidate.fullName}
                </CardTitle>
                <CardDescription className="text-indigo-700/70 dark:text-indigo-300/70">
                  {candidate.email}
                </CardDescription>
              </div>
              <Badge 
                className={`px-3 py-1 backdrop-blur-sm ${getStatusColors(candidate.status)}`}
              >
                {formatStatus(candidate.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 backdrop-blur-sm bg-background/50 border border-indigo-500/20 rounded-lg p-1">
                <TabsTrigger 
                  value="details" 
                  className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-indigo-500/30"
                >
                  Details
                </TabsTrigger>
                <TabsTrigger 
                  value="skills" 
                  className="data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[state=active]:shadow-purple-500/30"
                >
                  Skills
                </TabsTrigger>
                <TabsTrigger 
                  value="notes" 
                  className="data-[state=active]:bg-violet-500 data-[state=active]:text-white data-[state=active]:shadow-violet-500/30"
                >
                  Notes
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="mt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 backdrop-blur-sm bg-background/30 p-4 rounded-xl border border-indigo-500/20">
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                      <User className="h-4 w-4" />
                      <Label className="font-medium">Contact Information</Label>
                    </div>
                    <div className="grid grid-cols-1 gap-3 pt-2">
                      <div>
                        <Label className="text-xs text-muted-foreground">Email</Label>
                        <p className="text-sm font-medium">{candidate.email}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Phone</Label>
                        <p className="text-sm font-medium">{candidate.phone || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 backdrop-blur-sm bg-background/30 p-4 rounded-xl border border-indigo-500/20">
                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                      <Briefcase className="h-4 w-4" />
                      <Label className="font-medium">Current Position</Label>
                    </div>
                    <div className="grid grid-cols-1 gap-3 pt-2">
                      <div>
                        <Label className="text-xs text-muted-foreground">Position</Label>
                        <p className="text-sm font-medium">{candidate.currentPosition || 'Not provided'}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Company</Label>
                        <p className="text-sm font-medium">{candidate.currentCompany || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 backdrop-blur-sm bg-background/30 p-4 rounded-xl border border-indigo-500/20">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                      <GraduationCap className="h-4 w-4" />
                      <Label className="font-medium">Education</Label>
                    </div>
                    <div className="grid grid-cols-1 gap-3 pt-2">
                      <div>
                        <Label className="text-xs text-muted-foreground">Education Level</Label>
                        <p className="text-sm font-medium">{candidate.educationLevel || 'Not provided'}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Field of Study</Label>
                        <p className="text-sm font-medium">{candidate.educationField || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 backdrop-blur-sm bg-background/30 p-4 rounded-xl border border-indigo-500/20">
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                      <Calendar className="h-4 w-4" />
                      <Label className="font-medium">Experience</Label>
                    </div>
                    <div className="grid grid-cols-1 gap-3 pt-2">
                      <div>
                        <Label className="text-xs text-muted-foreground">Years of Experience</Label>
                        <p className="text-sm font-medium">{candidate.experienceYears || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 backdrop-blur-sm bg-background/30 p-4 rounded-xl border border-indigo-500/20">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <Globe className="h-4 w-4" />
                    <Label className="font-medium">Links</Label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                    {candidate.resumeUrl && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="justify-start backdrop-blur-sm bg-background/50 border-indigo-500/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 transition-all duration-300"
                        asChild
                      >
                        <a href={candidate.resumeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center">
                          <FileText className="mr-2 h-4 w-4" /> Resume
                        </a>
                      </Button>
                    )}
                    {candidate.linkedinUrl && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="justify-start backdrop-blur-sm bg-background/50 border-indigo-500/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 transition-all duration-300"
                        asChild
                      >
                        <a href={candidate.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center">
                          <Linkedin className="mr-2 h-4 w-4" /> LinkedIn
                        </a>
                      </Button>
                    )}
                    {candidate.githubUrl && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="justify-start backdrop-blur-sm bg-background/50 border-indigo-500/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 transition-all duration-300"
                        asChild
                      >
                        <a href={candidate.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center">
                          <Github className="mr-2 h-4 w-4" /> GitHub
                        </a>
                      </Button>
                    )}
                    {candidate.portfolioUrl && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="justify-start backdrop-blur-sm bg-background/50 border-indigo-500/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 transition-all duration-300"
                        asChild
                      >
                        <a href={candidate.portfolioUrl} target="_blank" rel="noopener noreferrer" className="flex items-center">
                          <Globe className="mr-2 h-4 w-4" /> Portfolio
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="skills" className="mt-6">
                <div className="space-y-4 backdrop-blur-sm bg-background/30 p-6 rounded-xl border border-purple-500/20">
                  <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-4">
                    <BookOpen className="h-5 w-5" />
                    <Label className="text-lg font-medium">Skills & Expertise</Label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills && candidate.skills.length > 0 ? (
                      candidate.skills.map((skill, index) => (
                        <Badge 
                          key={index} 
                          className="px-3 py-1 backdrop-blur-sm bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-500/30 text-sm font-medium"
                        >
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No skills listed</p>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="notes" className="mt-6">
                <div className="space-y-4 backdrop-blur-sm bg-background/30 p-6 rounded-xl border border-violet-500/20">
                  <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 mb-4">
                    <FileText className="h-5 w-5" />
                    <Label className="text-lg font-medium">Notes</Label>
                  </div>
                  <div className="p-4 bg-background/50 rounded-md border border-violet-500/20">
                    {candidate.notes ? (
                      <p className="whitespace-pre-wrap">{candidate.notes}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">No notes available</p>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="relative z-10 flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => router.push('/candidates')}
              className="backdrop-blur-sm bg-background/50 border-indigo-500/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 transition-all duration-300"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Candidates
            </Button>
            <Button 
              onClick={() => router.push(`/interviews/new?candidateId=${candidateId}`)}
              className="backdrop-blur-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/30 border-0 transition-all duration-300 hover:scale-105"
            >
              <Calendar className="mr-2 h-4 w-4" /> Schedule Interview
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}