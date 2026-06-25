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
        className={`${className} shrink-0 rounded-full border border-slate-100 object-cover`}
      />
    );
  }

  return (
    <span
      className={`${className} flex shrink-0 items-center justify-center rounded-full bg-slate-100 text-[7px] font-bold text-slate-500`}
      aria-label={`${name}'s initials`}
    >
      {initials}
    </span>
  );
};
