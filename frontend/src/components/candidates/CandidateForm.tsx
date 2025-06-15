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
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Candidate' : 'Add New Candidate'}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email*</FormLabel>
                    <FormControl>
                      <Input placeholder="john.doe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status*</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currentPosition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Position</FormLabel>
                    <FormControl>
                      <Input placeholder="Software Engineer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currentCompany"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Company</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Inc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="experienceYears"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experience (Years)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="educationLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Education Level</FormLabel>
                    <FormControl>
                      <Input placeholder="Bachelor's Degree" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="educationField"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Education Field</FormLabel>
                    <FormControl>
                      <Input placeholder="Computer Science" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="skills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skills</FormLabel>
                  <FormControl>
                    <Input placeholder="JavaScript, React, Node.js" {...field} />
                  </FormControl>
                  <FormDescription>Enter skills separated by commas</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="resumeUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resume URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/resume.pdf" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="linkedInUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://linkedin.com/in/johndoe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="githubUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GitHub URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://github.com/johndoe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="portfolioUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Portfolio URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://johndoe.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes about the candidate"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Candidate' : 'Create Candidate'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}