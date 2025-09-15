import { create } from "zustand";

export type ProfileTab = "bookings" | "favorites" | "venues";

type State = {
  active: ProfileTab;
  setActive: (t: ProfileTab) => void;
};

export const useProfileTabs = create<State>((set) => ({
  active: "bookings",       // default tab
  setActive: (t) => set({ active: t }),
}));
