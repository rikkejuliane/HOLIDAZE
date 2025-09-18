import { create } from "zustand";

export type ProfileTab = "bookings" | "favorites" | "venues";

type State = {
  active: ProfileTab;
  setActive: (tab: ProfileTab) => void;
};

export const useProfileTabs = create<State>((set) => ({
  active: "bookings",
  setActive: (tab) => set({ active: tab }),
}));
