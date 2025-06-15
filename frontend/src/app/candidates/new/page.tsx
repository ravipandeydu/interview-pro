import { Metadata } from 'next';
import CandidateForm from '../../../components/candidates/CandidateForm';

export const metadata: Metadata = {
  title: 'Add New Candidate | Recruitment Platform',
  description: 'Create a new candidate profile',
};

export default function NewCandidatePage() {
  return (
    <main className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Add New Candidate</h1>
      <CandidateForm />
    </main>
  );
}