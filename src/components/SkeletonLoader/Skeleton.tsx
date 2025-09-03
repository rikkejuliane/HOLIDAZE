export default function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-neutral-200/70 dark:bg-neutral-800/60 ${className}`} />;
}
