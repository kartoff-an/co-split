import type React from 'react';

interface AvatarProps {
  avatarUrl?: string | null;
  name: string;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  avatarUrl,
  name,
  className,
}) => {
  const initials = name.slice(0, 1).toUpperCase();

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={`${name}'s avatar`}
        className={`${className} border-border-subtle shrink-0 rounded-full border object-cover`}
      />
    );
  }

  return (
    <span
      className={`${className} bg-surface-subtle text-text-muted flex shrink-0 items-center justify-center rounded-full text-[7px] font-bold`}
      aria-label={`${name}'s initials`}
    >
      {initials}
    </span>
  );
};
