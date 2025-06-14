import { Metadata } from 'next';
import QuestionList from '../../components/questions/QuestionList';

export const metadata: Metadata = {
  title: 'Questions | Recruitment Platform',
  description: 'Manage interview questions for recruitment process',
};

export default function QuestionsPage() {
  return (
    <main className="flex-1">
      <QuestionList />
    </main>
  );
}