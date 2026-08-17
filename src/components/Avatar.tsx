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
        className={`${className} shrink-0 rounded-full border border-border-subtle object-cover`}
      />
    );
  }

  return (
    <span
      className={`${className} flex shrink-0 items-center justify-center rounded-full bg-surface-subtle text-[7px] font-bold text-text-muted`}
      aria-label={`${name}'s initials`}
    >
      {initials}
    </span>
  );
};
