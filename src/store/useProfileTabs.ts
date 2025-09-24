import { create } from "zustand";

export type ProfileTab = "bookings" | "favorites" | "venues";

type State = {
  active: ProfileTab;
  setActive: (tab: ProfileTab) => void;
};

/**
 * useProfileTabs
 *
 * Lightweight **Zustand** store for the currently active profile tab.
 * - Default: `"bookings"`
 * - Global (client-side) state shared across components on the page.
 * - Not persisted; resets on full reload.
 */
export const useProfileTabs = create<State>((set) => ({
  active: "bookings",
  setActive: (tab) => set({ active: tab }),
}));
