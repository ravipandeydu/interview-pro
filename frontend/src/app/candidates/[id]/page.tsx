import { Metadata } from 'next';
import CandidateDetail from '../../../components/candidates/CandidateDetail';

export const metadata: Metadata = {
  title: 'Candidate Details | Recruitment Platform',
  description: 'View detailed information about a candidate',
};

interface CandidateDetailPageProps {
  params: {
    id: string;
  };
}

export default function CandidateDetailPage({ params }: CandidateDetailPageProps) {
  return (
    <main className="flex-1">
      <CandidateDetail candidateId={params.id} />
    </main>
  );
}