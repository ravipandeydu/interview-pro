'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import InterviewService from '@/services/interviewService';

interface Candidate {
  id: string;
  fullName: string;
  email: string;
}

interface SendInvitationDialogProps {
  open: boolean;
  onClose: () => void;
  interviewId: string;
  candidates: Candidate[];
}

const SendInvitationDialog: React.FC<SendInvitationDialogProps> = ({
  open,
  onClose,
  interviewId,
  candidates,
}) => {
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [accessTokenExpires, setAccessTokenExpires] = useState<string | null>(null);

  const handleSendInvitation = async () => {
    if (!selectedCandidateId) {
      setError('Please select a candidate');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await InterviewService.sendInterviewInvitation(interviewId, selectedCandidateId);
      
      setSuccess(true);
      setAccessToken(result.accessToken);
      setAccessTokenExpires(result.accessTokenExpires);
      
      toast.success('Interview invitation sent successfully');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send invitation');
      toast.error('Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setSelectedCandidateId('');
      setError(null);
      setSuccess(false);
      setAccessToken(null);
      setAccessTokenExpires(null);
      onClose();
    }
  };

  const formatExpiryDate = (dateString: string | null) => {
    if (!dateString) return '';
    
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Interview Invitation</DialogTitle>
          <DialogDescription>
            Select a candidate to send an interview invitation email
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success ? (
          <div className="space-y-4">
            <Alert className="mb-4">
              <AlertDescription>Invitation sent successfully!</AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <h4 className="font-medium">Access Details:</h4>
              
              <div className="text-sm">
                <p className="font-medium">Access Token:</p>
                <p className="font-mono bg-muted p-2 rounded-md overflow-x-auto">{accessToken}</p>
              </div>
              
              <div className="text-sm">
                <p className="font-medium">Expires:</p>
                <p>{formatExpiryDate(accessTokenExpires)}</p>
              </div>
            </div>
            
            <Alert className="mt-4">
              <AlertDescription>
                The candidate has received an email with instructions to access the interview.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <div className="py-4">
            <Select 
              value={selectedCandidateId} 
              onValueChange={setSelectedCandidateId}
              disabled={loading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a candidate" />
              </SelectTrigger>
              <SelectContent>
                {candidates.map((candidate) => (
                  <SelectItem key={candidate.id} value={candidate.id}>
                    {candidate.fullName} ({candidate.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        <DialogFooter className="flex justify-between sm:justify-end">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            {success ? 'Close' : 'Cancel'}
          </Button>
          {!success && (
            <Button
              onClick={handleSendInvitation}
              disabled={loading || !selectedCandidateId}
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Sending...
                </>
              ) : (
                'Send Invitation'
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SendInvitationDialog;