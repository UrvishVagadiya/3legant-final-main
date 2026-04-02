interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-[#F3F5F7] ${className || ""}`}
      {...props}
    />
  );
}
