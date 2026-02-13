import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
    return (
        <div
            className={`animate-pulse rounded-full bg-slate-200 dark:bg-slate-700 ${className}`}
            {...props}
        />
    );
};
