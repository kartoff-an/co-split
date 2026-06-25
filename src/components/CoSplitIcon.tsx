import type React from 'react';

interface CoSplitIconProps {
  className?: string;
}

export const CoSplitIcon: React.FC<CoSplitIconProps> = ({
  className = 'h-8 w-8 shrink-0',
}) => {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background Square with rounded corners (rounded-xl roughly equals rx="10") */}
      <rect width="32" height="32" rx="10" fill="#2e5c45" />

      <text
        x="16"
        y="16"
        fill="#FFFFFF"
        fontSize="13"
        fontWeight="800"
        fontFamily="system-ui, -apple-system, sans-serif"
        textAnchor="middle"
        dominantBaseline="central"
        letterSpacing="-0.02em"
      >
        Co
      </text>
    </svg>
  );
};
