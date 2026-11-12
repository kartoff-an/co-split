import { Spinner } from './Spinner';

export const LoadingPage: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner className="text-primary-green h-16 w-16" />
    </div>
  );
};
