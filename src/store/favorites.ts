"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// We store timestamps so you can sort by "recently added" later.
export type FavoritesState = {
  favoriteIds: Record<string, number>; // venueId -> addedAt (ms)
  add: (id: string) => void;
  remove: (id: string) => void;
  toggle: (id: string) => void;
  isFav: (id: string) => boolean;
  clearAll: () => void;
};

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteIds: {},
      add: (id) =>
        set((s) => ({
          favoriteIds: { ...s.favoriteIds, [id]: Date.now() },
        })),
      remove: (id) =>
        set((s) => {
          const next = { ...s.favoriteIds };
          delete next[id];
          return { favoriteIds: next };
        }),
      toggle: (id) => {
        const { isFav, add, remove } = get();
        isFav(id) ? remove(id) : add(id);
      },
      isFav: (id) => Boolean(get().favoriteIds[id]),
      clearAll: () => set({ favoriteIds: {} }),
    }),
    {
      name: "favorites-store", // localStorage key
      version: 1,
      partialize: (s) => ({ favoriteIds: s.favoriteIds }),
    }
  )
);
