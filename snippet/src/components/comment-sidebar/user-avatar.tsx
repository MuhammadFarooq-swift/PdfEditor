import { h } from 'preact';

interface UserAvatarProps {
  name?: string;
  className?: string;
}

const getInitials = (name?: string): string => {
  if (!name) return 'G';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getAvatarColor = (name?: string): string => {
  if (!name) return 'bg-red-500';
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
  ];
  const index = name.length > 0 ? name.charCodeAt(0) % colors.length : 0;
  return colors[index];
};

export const UserAvatar = ({ name, className = '' }: UserAvatarProps) => (
  <div
    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium text-white ${getAvatarColor(name)} ${className}`}
  >
    {getInitials(name)}
  </div>
);
