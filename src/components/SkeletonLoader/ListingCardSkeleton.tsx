import Skeleton from "@/components/SkeletonLoader/Skeleton";

export default function ListingCardSkeleton() {
  return (
    <article className="relative w-[292px] rounded-3xl shadow-[0_4px_4px_rgba(0,0,0,0.25)] overflow-hidden">
      {/* image area */}
      <Skeleton className="h-[230px] w-full rounded-t-3xl" />

      {/* bottom panel */}
      <div className="p-4 bg-[#282A2E] text-white rounded-b-3xl space-y-3">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
    </article>
  );
}
