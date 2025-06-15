import { Metadata } from 'next';
import CandidateList from '../../components/candidates/CandidateList';

export const metadata: Metadata = {
  title: 'Candidates | Recruitment Platform',
  description: 'Manage and track candidates in the recruitment process',
};

export default function CandidatesPage() {
  return (
    <main className="flex-1">
      <CandidateList />
    </main>
  );
}