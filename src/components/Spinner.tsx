import type { ComponentProps } from 'react';

interface SpinnerProps extends ComponentProps<'svg'> {
  size?: number;
}

export const Spinner = ({ size = 20, className, ...props }: SpinnerProps) => {
  return (
    <svg
      className={`text-primary animate-spin ${className ?? ''}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="status"
      aria-label="Loading"
      {...props}
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-90" fill="currentColor" d="M12 2a10 10 0 00-10 10h3a7 7 0 017-7V2z" />
    </svg>
  );
};
