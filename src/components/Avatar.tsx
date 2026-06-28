import React from 'react';

interface AvatarProps {
  name: string;
  src?: string;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ name, src, className = 'w-10 h-10 text-xs' }) => {
  const getInitials = (n: string): string => {
    if (!n) return '?';
    const parts = n.trim().split(/\s+/);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  if (src && src.trim() !== '') {
    return (
      <img
        src={src}
        alt={name}
        referrerPolicy="no-referrer"
        className={`${className} rounded-full object-cover`}
      />
    );
  }

  // Choose a stylish gradient based on the name hash
  const bgGradients = [
    'from-indigo-400 via-indigo-500 to-purple-600',
    'from-emerald-400 via-teal-500 to-cyan-600',
    'from-amber-400 via-orange-500 to-rose-600',
    'from-pink-400 via-pink-500 to-rose-600',
    'from-sky-400 via-blue-500 to-indigo-600',
  ];
  
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  const gradient = bgGradients[sum % bgGradients.length];

  return (
    <div
      className={`${className} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-slate-950 font-bold font-display select-none shrink-0`}
    >
      <span>{getInitials(name)}</span>
    </div>
  );
};
