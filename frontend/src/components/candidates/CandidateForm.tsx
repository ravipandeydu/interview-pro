'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCandidate } from '../../hooks/useCandidate';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Candidate } from '../../services/candidateService';
import { PencilIcon, UserPlusIcon } from 'lucide-react';

// Define the form schema with Zod
const candidateFormSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().optional(),
  resumeUrl: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),
  linkedInUrl: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),
  githubUrl: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),
  portfolioUrl: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),
  skills: z.string().optional(),
  experienceYears: z.coerce.number().min(0).optional(),
  currentPosition: z.string().optional(),
  currentCompany: z.string().optional(),
  educationLevel: z.string().optional(),
  educationField: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum([
    'NEW',
    'CONTACTED',
    'INTERVIEW_SCHEDULED',
    'IN_PROCESS',
    'OFFER_SENT',
    'HIRED',
    'REJECTED',
    'ON_HOLD'
  ]),
});

type CandidateFormValues = z.infer<typeof candidateFormSchema>;

interface CandidateFormProps {
  candidate?: Candidate;
  isEditing?: boolean;
}

export default function CandidateForm({ candidate, isEditing = false }: CandidateFormProps) {
  const router = useRouter();
  const { createCandidate, updateCandidate } = useCandidate();
  const createMutation = createCandidate();
  const updateMutation = updateCandidate(candidate?.id || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Convert skills array to comma-separated string for the form
  const defaultValues: Partial<CandidateFormValues> = {
    fullName: candidate?.fullName || '',
    email: candidate?.email || '',
    phone: candidate?.phone || '',
    resumeUrl: candidate?.resumeUrl || '',
    linkedInUrl: candidate?.linkedInUrl || '',
    githubUrl: candidate?.githubUrl || '',
    portfolioUrl: candidate?.portfolioUrl || '',
    skills: candidate?.skills ? candidate.skills.join(', ') : '',
    experienceYears: candidate?.experienceYears || undefined,
    currentPosition: candidate?.currentPosition || '',
    currentCompany: candidate?.currentCompany || '',
    educationLevel: candidate?.educationLevel || '',
    educationField: candidate?.educationField || '',
    notes: candidate?.notes || '',
    status: candidate?.status || 'NEW',
  };

  const form = useForm<CandidateFormValues>({
    resolver: zodResolver(candidateFormSchema),
    defaultValues,
  });

  const onSubmit = async (data: CandidateFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Convert comma-separated skills string to array
      const formattedData = {
        ...data,
        skills: data.skills ? data.skills.split(',').map(skill => skill.trim()).filter(Boolean) : [],
      };

      if (isEditing && candidate) {
        await updateMutation.mutateAsync(formattedData);
        toast.success('Candidate updated successfully');
      } else {
        await createMutation.mutateAsync(formattedData);
        toast.success('Candidate created successfully');
      }
      
      router.push('/candidates');
    } catch (error) {
      console.error('Error submitting candidate form:', error);
      toast.error(isEditing ? 'Failed to update candidate' : 'Failed to create candidate');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border border-border/40 bg-background/60 backdrop-blur-xl shadow-md hover:shadow-lg transition-all">
      <CardHeader className="border-b border-border/20">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent flex items-center gap-2">
          {isEditing ? (
            <>
              <PencilIcon className="h-5 w-5 text-primary" />
              Edit Candidate
            </>
          ) : (
            <>
              <UserPlusIcon className="h-5 w-5 text-primary" />
              Add New Candidate
            </>
          )}
        </CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="font-medium">Full Name*</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="John Doe" 
                        {...field} 
                        className="bg-background/50 border-border/50 focus-visible:ring-primary/70 transition-all"
                      />
                    </FormControl>
                    <FormMessage className="text-destructive/90" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="font-medium">Email*</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="john.doe@example.com" 
                        {...field} 
                        className="bg-background/50 border-border/50 focus-visible:ring-primary/70 transition-all"
                      />
                    </FormControl>
                    <FormMessage className="text-destructive/90" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="font-medium">Phone</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="+1 (555) 123-4567" 
                        {...field} 
                        className="bg-background/50 border-border/50 focus-visible:ring-primary/70 transition-all"
                      />
                    </FormControl>
                    <FormMessage className="text-destructive/90" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="font-medium">Status*</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background/50 border-border/50 focus-visible:ring-primary/70 transition-all">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-background/95 backdrop-blur-xl border-border/50">
                        <SelectItem value="NEW">New</SelectItem>
                        <SelectItem value="CONTACTED">Contacted</SelectItem>
                        <SelectItem value="INTERVIEW_SCHEDULED">Interview Scheduled</SelectItem>
                        <SelectItem value="IN_PROCESS">In Process</SelectItem>
                        <SelectItem value="OFFER_SENT">Offer Sent</SelectItem>
                        <SelectItem value="HIRED">Hired</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                        <SelectItem value="ON_HOLD">On Hold</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-destructive/90" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currentPosition"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="font-medium">Current Position</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Software Engineer" 
                        {...field} 
                        className="bg-background/50 border-border/50 focus-visible:ring-primary/70 transition-all"
                      />
                    </FormControl>
                    <FormMessage className="text-destructive/90" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currentCompany"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="font-medium">Current Company</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Acme Inc." 
                        {...field} 
                        className="bg-background/50 border-border/50 focus-visible:ring-primary/70 transition-all"
                      />
                    </FormControl>
                    <FormMessage className="text-destructive/90" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="experienceYears"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="font-medium">Experience (Years)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        {...field} 
                        className="bg-background/50 border-border/50 focus-visible:ring-primary/70 transition-all"
                      />
                    </FormControl>
                    <FormMessage className="text-destructive/90" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="educationLevel"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="font-medium">Education Level</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Bachelor's Degree" 
                        {...field} 
                        className="bg-background/50 border-border/50 focus-visible:ring-primary/70 transition-all"
                      />
                    </FormControl>
                    <FormMessage className="text-destructive/90" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="educationField"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="font-medium">Education Field</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Computer Science" 
                        {...field} 
                        className="bg-background/50 border-border/50 focus-visible:ring-primary/70 transition-all"
                      />
                    </FormControl>
                    <FormMessage className="text-destructive/90" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="skills"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="font-medium">Skills</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="JavaScript, React, Node.js" 
                      {...field} 
                      className="bg-background/50 border-border/50 focus-visible:ring-primary/70 transition-all"
                    />
                  </FormControl>
                  <FormDescription className="text-muted-foreground/80">Enter skills separated by commas</FormDescription>
                  <FormMessage className="text-destructive/90" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="resumeUrl"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="font-medium">Resume URL</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://example.com/resume.pdf" 
                        {...field} 
                        className="bg-background/50 border-border/50 focus-visible:ring-primary/70 transition-all"
                      />
                    </FormControl>
                    <FormMessage className="text-destructive/90" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="linkedInUrl"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="font-medium">LinkedIn URL</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://linkedin.com/in/johndoe" 
                        {...field} 
                        className="bg-background/50 border-border/50 focus-visible:ring-primary/70 transition-all"
                      />
                    </FormControl>
                    <FormMessage className="text-destructive/90" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="githubUrl"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="font-medium">GitHub URL</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://github.com/johndoe" 
                        {...field} 
                        className="bg-background/50 border-border/50 focus-visible:ring-primary/70 transition-all"
                      />
                    </FormControl>
                    <FormMessage className="text-destructive/90" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="portfolioUrl"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="font-medium">Portfolio URL</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://johndoe.com" 
                        {...field} 
                        className="bg-background/50 border-border/50 focus-visible:ring-primary/70 transition-all"
                      />
                    </FormControl>
                    <FormMessage className="text-destructive/90" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="font-medium">Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes about the candidate"
                      className="min-h-[100px] bg-background/50 border-border/50 focus-visible:ring-primary/70 transition-all"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-destructive/90" />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between border-t border-border/20 pt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.back()}
              className="border-border/50 bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-all"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-primary/90 hover:bg-primary transition-all"
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Candidate' : 'Create Candidate'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}