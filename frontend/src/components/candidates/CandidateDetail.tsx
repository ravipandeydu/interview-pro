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

  const formatStatus = (status: string) => {
    return status.replace('_', ' ');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !candidate) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Failed to load candidate details</CardDescription>
          </CardHeader>
          <CardContent>
            <p>There was an error loading the candidate information. Please try again later.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push('/candidates')}>Back to Candidates</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{candidate.fullName}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/candidates/${candidateId}/edit`)}>
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the candidate and all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{candidate.fullName}</CardTitle>
              <CardDescription>{candidate.email}</CardDescription>
            </div>
            <Badge variant={getStatusBadgeVariant(candidate.status) as any}>
              {formatStatus(candidate.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Email</Label>
                  <p className="text-sm">{candidate.email}</p>
                </div>
                <div>
                  <Label>Phone</Label>
                  <p className="text-sm">{candidate.phone || 'Not provided'}</p>
                </div>
                <div>
                  <Label>Current Position</Label>
                  <p className="text-sm">{candidate.currentPosition || 'Not provided'}</p>
                </div>
                <div>
                  <Label>Current Company</Label>
                  <p className="text-sm">{candidate.currentCompany || 'Not provided'}</p>
                </div>
                <div>
                  <Label>Experience (Years)</Label>
                  <p className="text-sm">{candidate.experienceYears || 'Not provided'}</p>
                </div>
                <div>
                  <Label>Education Level</Label>
                  <p className="text-sm">{candidate.educationLevel || 'Not provided'}</p>
                </div>
                <div>
                  <Label>Education Field</Label>
                  <p className="text-sm">{candidate.educationField || 'Not provided'}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Links</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {candidate.resumeUrl && (
                    <Button variant="outline" size="sm" asChild className="justify-start">
                      <a href={candidate.resumeUrl} target="_blank" rel="noopener noreferrer">
                        Resume
                      </a>
                    </Button>
                  )}
                  {candidate.linkedinUrl && (
                    <Button variant="outline" size="sm" asChild className="justify-start">
                      <a href={candidate.linkedinUrl} target="_blank" rel="noopener noreferrer">
                        LinkedIn
                      </a>
                    </Button>
                  )}
                  {candidate.githubUrl && (
                    <Button variant="outline" size="sm" asChild className="justify-start">
                      <a href={candidate.githubUrl} target="_blank" rel="noopener noreferrer">
                        GitHub
                      </a>
                    </Button>
                  )}
                  {candidate.portfolioUrl && (
                    <Button variant="outline" size="sm" asChild className="justify-start">
                      <a href={candidate.portfolioUrl} target="_blank" rel="noopener noreferrer">
                        Portfolio
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="skills" className="mt-4">
              <div className="space-y-4">
                <div>
                  <Label>Skills</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {candidate.skills && candidate.skills.length > 0 ? (
                      candidate.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No skills listed</p>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notes" className="mt-4">
              <div className="space-y-4">
                <div>
                  <Label>Notes</Label>
                  <div className="mt-2 p-4 bg-muted rounded-md">
                    {candidate.notes ? (
                      <p className="whitespace-pre-wrap">{candidate.notes}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">No notes available</p>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push('/candidates')}>
            Back to Candidates
          </Button>
          <Button onClick={() => router.push(`/interviews/new?candidateId=${candidateId}`)}>
            Schedule Interview
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}