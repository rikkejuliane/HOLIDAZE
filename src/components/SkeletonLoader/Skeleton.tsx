/**
 * Generic skeleton loader component.
 *
 * - Renders a pulsing placeholder block with light/dark mode styles.
 * - Accepts a `className` prop to control size, shape, and extra styling.
 *
 * @param className - Optional Tailwind classes for customizing the skeleton.
 * @returns A styled placeholder element for loading states.
 */
export default function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-neutral-200/70 dark:bg-neutral-800/60 ${className}`} />;
}
