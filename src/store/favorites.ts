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
  const key = username.trim().toLowerCase(); 
  const storageKey = `favorites-store:${key}`; 

  return create<FavoritesState>()(
    persist(
      (set, get) => ({
        favoriteIds: {},
        add: (id) =>
          set((s) => ({ favoriteIds: { ...s.favoriteIds, [id]: Date.now() } })),
        remove: (id) =>
          set((s) => {
            const next = { ...s.favoriteIds };
            delete next[id];
            return { favoriteIds: next };
          }),
        toggle: (id) => (get().isFav(id) ? get().remove(id) : get().add(id)),
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
  const store = useMemo(() => createFavoritesStore(username), [username]);
  return store;
}
