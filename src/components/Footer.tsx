import type React from 'react';

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = 'max-w-6xl' }) => {
  return (
    <footer
      className={`text-text-muted mx-auto mt-16 w-full pb-6 text-center text-[10px] font-medium ${className}`}
    >
      <div className="flex flex-col items-center justify-center gap-2 px-4 sm:flex-row sm:gap-x-4 sm:gap-y-0">
        <span>&copy; {new Date().getFullYear()} Co-Split.</span>
        <span className="text-border-strong hidden sm:inline">|</span>
        <a href="#" className="hover:text-text-primary transition-colors">
          Terms
        </a>
        <span className="text-border-strong hidden sm:inline">|</span>
        <a href="#" className="hover:text-text-primary transition-colors">
          Privacy
        </a>
        <span className="text-border-strong hidden sm:inline">|</span>
        <a href="#" className="hover:text-text-primary transition-colors">
          Support
        </a>
        <span className="text-border-strong hidden sm:inline">|</span>
        <span className="flex items-center justify-center gap-1.5">
          <span>Free & Open Source</span>
          <a
            href="https://github.com/kartoff-an/co-split"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-muted hover:text-text-primary transition-colors"
            title="GitHub Repository"
          >
            <span
              className="block h-3.5 w-3.5 bg-current"
              style={{
                mask: 'url(/icons/github-icon.svg) no-repeat center',
                WebkitMask: 'url(/icons/github-icon.svg) no-repeat center',
              }}
            />
          </a>
        </span>
      </div>
    </footer>
  );
};
