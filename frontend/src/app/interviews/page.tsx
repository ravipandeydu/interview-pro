import { Metadata } from 'next';
import InterviewList from '../../components/interviews/InterviewList';

export const metadata: Metadata = {
  title: 'Interviews | Interview Pro',
  description: 'Manage and track all your technical interviews in one place',
};

export default function InterviewsPage() {
  return (
    <main className="flex-1 overflow-hidden">
      <InterviewList />
    </main>
  );
}