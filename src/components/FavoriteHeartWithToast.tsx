"use client";
import FavoriteHeart from "@/components/FavoriteHeart";

type Props = { venueId: string; className?: string };

export default function FavoriteHeartWithToast({ venueId, className }: Props) {
  return <FavoriteHeart venueId={venueId} className={className} />;
}
