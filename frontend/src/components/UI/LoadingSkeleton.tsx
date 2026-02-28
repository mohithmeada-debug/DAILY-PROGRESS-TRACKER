import React from 'react';

type SkeletonType = 'page' | 'card' | 'list';

interface LoadingSkeletonProps {
  type?: SkeletonType;
}

const shimmer =
  'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-800 dark:to-gray-700';

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ type = 'card' }) => {
  if (type === 'page') {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className={`h-10 w-1/3 rounded-xl ${shimmer}`} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((key) => (
            <div
              key={key}
              className="glass-card rounded-2xl p-5 flex flex-col gap-3"
            >
              <div className={`h-4 w-1/2 rounded-full ${shimmer}`} />
              <div className={`h-8 w-1/3 rounded-full ${shimmer}`} />
              <div className={`h-3 w-full rounded-full ${shimmer}`} />
              <div className={`h-3 w-3/4 rounded-full ${shimmer}`} />
            </div>
          ))}
        </div>
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className={`h-4 w-24 rounded-full ${shimmer}`} />
          <div className={`h-72 w-full rounded-2xl ${shimmer}`} />
        </div>
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="space-y-3 animate-pulse">
        {[1, 2, 3, 4].map((key) => (
          <div
            key={key}
            className="flex items-center justify-between glass-card rounded-2xl p-4"
          >
            <div className={`h-4 w-1/2 rounded-full ${shimmer}`} />
            <div className={`h-4 w-16 rounded-full ${shimmer}`} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-4 animate-pulse space-y-3">
      <div className={`h-4 w-1/3 rounded-full ${shimmer}`} />
      <div className={`h-3 w-full rounded-full ${shimmer}`} />
      <div className={`h-3 w-5/6 rounded-full ${shimmer}`} />
      <div className={`h-3 w-4/6 rounded-full ${shimmer}`} />
    </div>
  );
};

export default LoadingSkeleton;

