import React, { useState } from 'react';

export const Avatar = ({ src, profilePic, seed = 'default', name = '', size = 'md', className = '' }) => {
  const [error, setError] = useState(false);

  const sizeClasses = {
    xs: 'w-7 h-7 text-[10px]',
    sm: 'w-9 h-9 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-3xl',
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;
  const imageSrc = src || profilePic;
  const avatarUrl = (imageSrc && !error)
    ? imageSrc
    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed || 'default')}`;

  if (error && !imageSrc) {
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    return (
      <div className={`${currentSize} rounded-2xl bg-[#FF5A5F] text-white border-2 border-slate-900 flex items-center justify-center font-extrabold shadow-[2px_2px_0px_0px_#000] ${className}`}>
        {initial}
      </div>
    );
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <img
        src={avatarUrl}
        alt={name || seed}
        onError={() => setError(true)}
        className={`${currentSize} rounded-2xl object-cover bg-amber-50 border-2 border-slate-900 shadow-[2px_2px_0px_0px_#000] transition duration-200 hover:translate-x-[-1px] hover:translate-y-[-1px]`}
      />
    </div>
  );
};
