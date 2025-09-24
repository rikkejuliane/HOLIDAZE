"use client";
import FavoriteHeart from "@/components/FavoriteHeart";

type Props = { venueId: string; className?: string };

/**
 * Wrapper around `FavoriteHeart` that preserves a simple API
 * (`venueId` and optional `className`) while ensuring the toast
 * feedback is included.
 *
 * Useful for embedding the favorite control in listing cards or
 * detail pages without manually wiring props.
 *
 * @param venueId   - The venue id to toggle as favorite.
 * @param className - Optional wrapper classes for positioning/styling.
 *
 * @returns The favorite heart component with toast support.
 */
export default function FavoriteHeartWithToast({ venueId, className }: Props) {
  return <FavoriteHeart venueId={venueId} className={className} />;
}
