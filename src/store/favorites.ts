"use client";

import { useMemo } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Shape of the user-scoped favorites store.
 *
 * State
 * - favoriteIds: Map of venueId → timestamp (ms). Presence means it's a favorite.
 *
 * Actions
 * - add(id): Mark a venue as favorite (timestamp updated to now).
 * - remove(id): Remove a venue from favorites.
 * - toggle(id): Add if missing, otherwise remove.
 * - isFav(id): Returns true if `id` is currently favorited.
 * - clearAll(): Remove all favorites.
 *
 * Notes
 * - Only `favoriteIds` is persisted (actions are re-created on load).
 * - Timestamps are informational (e.g., for sorting by “recently favorited”).
 */
export type FavoritesState = {
  favoriteIds: Record<string, number>;
  add: (id: string) => void;
  remove: (id: string) => void;
  toggle: (id: string) => void;
  isFav: (id: string) => boolean;
  clearAll: () => void;
};

/**
 * createFavoritesStore
 *
 * Factory that creates a **Zustand** store instance persisted to `localStorage`,
 * **scoped per username**.
 *
 * Persistence
 * - Storage key: `favorites-store:${username.trim().toLowerCase()}`
 * - Persists only `favoriteIds` (actions are not persisted).
 * - Uses `zustand/middleware` `persist` + `createJSONStorage(localStorage)`.
 * - `version: 1` for future migrations if needed.
 *
 * Behavior
 * - `favoriteIds` is an object map: { [venueId]: timestampMs }.
 * - `toggle(id)` adds/removes based on current state.
 *
 * SSR/Usage
 * - Call only in client components (relies on `localStorage`).
 * - Prefer using the helper `useFavoritesForUser(username)` in components.
 *
 * @param username Username used to scope the store (case-insensitive).
 * @returns A Zustand store hook (use like `const state = useStore(selector)`).
 *
 * @example
 * const useFavs = createFavoritesStore("Alice");
 * const isFav = useFavs(s => s.isFav(venueId));
 * const toggle = useFavs(s => s.toggle(venueId));
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
 * useFavoritesForUser
 *
 * Convenience hook that memoizes and returns a **user-scoped** favorites store.
 * Use it exactly like a normal Zustand store hook.
 *
 * Why
 * - Ensures each username gets its own persisted store namespace.
 * - Keeps instances stable across re-renders for the same `username`.
 *
 * @param username The profile/username to scope favorites under.
 * @returns A Zustand store hook with the `FavoritesState` API.
 */
export function useFavoritesForUser(username: string) {
  const store = useMemo(() => createFavoritesStore(username), [username]);
  return store;
}
