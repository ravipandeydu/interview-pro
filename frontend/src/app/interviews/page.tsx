import { Metadata } from 'next';
import InterviewList from '../../components/interviews/InterviewList';

export const metadata: Metadata = {
  title: 'Interviews | Recruitment Platform',
  description: 'Manage and track all interviews in the recruitment process',
};

export default function InterviewsPage() {
  return (
    <main className="flex-1">
      <InterviewList />
    </main>
  );
}