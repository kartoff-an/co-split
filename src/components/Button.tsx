import type React from 'react';
import { Spinner } from './Spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-green text-white hover:bg-primary-green-hover shadow-xs active:scale-[0.98]',
  secondary:
    'bg-surface-subtle text-text-secondary hover:text-text-primary hover:bg-surface border border-border-subtle shadow-xs active:scale-[0.98]',
  ghost: 'text-text-muted hover:text-text-primary hover:bg-surface-subtle',
  danger:
    'bg-surface-subtle text-text-secondary hover:bg-rose-600 hover:text-white active:scale-[0.98]',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-2.5 py-1.5 text-[11px]',
  md: 'px-3 py-2 text-xs',
  lg: 'px-4 py-2.5 text-sm',
};

const baseStyles =
  'inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-green focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  className = '',
  children,
  ...props
}) => {
  const combinedClassName = [
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      disabled={disabled || isLoading}
      className={combinedClassName}
      {...props}
    >
      {isLoading && <Spinner className="h-3.5 w-3.5 shrink-0 animate-spin" />}
      {children}
    </button>
  );
};
