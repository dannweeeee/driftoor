"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface DriftState {
  activeSubaccountIndex: number;
  setActiveSubaccountIndex: (index: number) => void;
}

export const useDriftSubaccountStore = create<DriftState>()(
  persist(
    (set) => ({
      activeSubaccountIndex: 0,

      setActiveSubaccountIndex: (index: number) =>
        set({ activeSubaccountIndex: index }),
    }),
    {
      name: "drift-storage",
      partialize: (state) => ({
        activeSubaccountIndex: state.activeSubaccountIndex,
      }),
    }
  )
);
