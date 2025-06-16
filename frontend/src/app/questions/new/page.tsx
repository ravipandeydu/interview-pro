import { Metadata } from 'next';
import QuestionForm from '../../../components/questions/QuestionForm';

export const metadata: Metadata = {
  title: 'Add New Question | Recruitment Platform',
  description: 'Create a new interview question',
};

export default function NewQuestionPage() {
  return (
    <main className="container mx-auto py-6 px-4 sm:px-6 relative">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 dark:from-indigo-400 dark:via-purple-400 dark:to-violet-400 inline-block">
            Create New Question
          </h1>
          <p className="text-foreground/70 mt-1">
            Add a new question to your interview question bank
          </p>
        </div>
        <QuestionForm />
      </div>
    </main>
  );
}