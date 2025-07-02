import React from 'react';
import clsx from 'clsx';

interface StatusPillProps {
  isActive: boolean;
}

export const StatusPill: React.FC<StatusPillProps> = ({ isActive }) => {
  return (
    <span
      className={clsx(
        'px-3 py-1 text-xs font-medium rounded-full',
        isActive
          ? 'bg-green-100 text-green-800'
          : 'bg-red-100 text-red-800'
      )}
    >
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}; 