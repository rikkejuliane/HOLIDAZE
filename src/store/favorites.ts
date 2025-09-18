"use client";

import { useMemo } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type FavoritesState = {
  favoriteIds: Record<string, number>;
  add: (id: string) => void;
  remove: (id: string) => void;
  toggle: (id: string) => void;
  isFav: (id: string) => boolean;
  clearAll: () => void;
};

/**
 * Factory: create a favorites store that is *scoped to a username*.
 * It persists to localStorage key: `favorites-store:${username}`
 */
export function createFavoritesStore(username: string) {
  // use NO trailing colon to match your existing key
  const storageKey = `favorites-store:${username}`;

  return create<FavoritesState>()(
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
          if (isFav(id)) remove(id);
          else add(id);
        },
        isFav: (id) => Boolean(get().favoriteIds[id]),
        clearAll: () => set({ favoriteIds: {} }),
      }),
      {
        name: storageKey,
        version: 1,
        storage: createJSONStorage(() => localStorage),
        partialize: (s) => ({ favoriteIds: s.favoriteIds }),
      }
    )
  );
}

/**
 * Helper for components:
 * Get a *user-scoped* favorites store hook you can use like a normal Zustand hook.
 *
 * Usage:
 *   const useFavs = useFavoritesForUser(profileName);
 *   const isFav = useFavs(s => s.isFav(venueId));
 *   const toggle = useFavs(s => s.toggle(venueId));
 */
export function useFavoritesForUser(username: string) {
  // create the store once per username in this component tree
  const store = useMemo(() => createFavoritesStore(username), [username]);
  return store;
}
