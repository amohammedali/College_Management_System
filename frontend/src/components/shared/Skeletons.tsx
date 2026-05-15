import React from 'react';

export const CardSkeleton = () => (
  <div className="dash-card p-6 animate-pulse">
    <div className="flex items-center gap-4">
      <div className="skeleton w-12 h-12 rounded-xl" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-4 w-2/3 rounded" />
        <div className="skeleton h-6 w-1/3 rounded" />
      </div>
    </div>
  </div>
);

export const TableRowSkeleton = () => (
  <tr>
    {[1,2,3,4,5].map(i => (
      <td key={i} className="px-4 py-4">
        <div className="skeleton h-4 rounded w-full" />
      </td>
    ))}
  </tr>
);

export const ChartSkeleton = () => (
  <div className="dash-card p-6 animate-pulse">
    <div className="skeleton h-5 w-1/4 rounded mb-6" />
    <div className="skeleton h-64 rounded-xl" />
  </div>
);

export const ProfileSkeleton = () => (
  <div className="dash-card p-6 animate-pulse">
    <div className="flex items-center gap-4 mb-6">
      <div className="skeleton w-20 h-20 rounded-full" />
      <div className="space-y-2">
        <div className="skeleton h-5 w-40 rounded" />
        <div className="skeleton h-4 w-28 rounded" />
      </div>
    </div>
    {[1,2,3].map(i => (
      <div key={i} className="skeleton h-4 rounded mb-3 w-full" />
    ))}
  </div>
);

interface SkeletonGridProps { count?: number; }
export const SkeletonGrid: React.FC<SkeletonGridProps> = ({ count = 4 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
    {Array.from({ length: count }).map((_, i) => <CardSkeleton key={i} />)}
  </div>
);
