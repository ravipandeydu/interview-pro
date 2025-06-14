import { Metadata } from 'next';
import QuestionForm from '../../../components/questions/QuestionForm';

export const metadata: Metadata = {
  title: 'Add New Question | Recruitment Platform',
  description: 'Create a new interview question',
};

export default function NewQuestionPage() {
  return (
    <main className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Add New Question</h1>
      <QuestionForm />
    </main>
  );
}