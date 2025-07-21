'use client';

interface LoadingSkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: 'rectangular' | 'circular' | 'text';
  animation?: 'pulse' | 'wave';
}

export const LoadingSkeleton = ({
  className = '',
  width = '100%',
  height = '1rem',
  variant = 'rectangular',
  animation = 'pulse',
}: LoadingSkeletonProps) => {
  const baseClasses = 'bg-gray-200';

  const variantClasses = {
    rectangular: 'rounded',
    circular: 'rounded-full',
    text: 'rounded',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-pulse', // Could implement wave animation with CSS
  };

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
    />
  );
};

// Predefined skeleton components
export const SkeletonCard = () => (
  <div className="p-4 border rounded-lg space-y-3">
    <LoadingSkeleton height="1.5rem" width="60%" />
    <LoadingSkeleton height="1rem" />
    <LoadingSkeleton height="1rem" width="80%" />
    <div className="flex gap-2 mt-4">
      <LoadingSkeleton height="2rem" width="4rem" />
      <LoadingSkeleton height="2rem" width="4rem" />
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5 }: { rows?: number }) => (
  <div className="space-y-2">
    <div className="grid grid-cols-4 gap-4 p-3 border-b">
      {Array.from({ length: 4 }).map((_, i) => (
        <LoadingSkeleton key={i} height="1rem" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="grid grid-cols-4 gap-4 p-3">
        {Array.from({ length: 4 }).map((_, j) => (
          <LoadingSkeleton key={j} height="1rem" />
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonChart = () => (
  <div className="p-4 border rounded-lg">
    <LoadingSkeleton height="1.5rem" width="40%" className="mb-4" />
    <div className="h-64 bg-gray-100 rounded flex items-end justify-around p-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <LoadingSkeleton
          key={i}
          width="2rem"
          height={`${Math.random() * 60 + 40}%`}
          className="bg-gray-300"
        />
      ))}
    </div>
  </div>
);
