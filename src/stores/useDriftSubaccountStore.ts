"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface DriftState {
  activeSubaccountIndex: number;
  setActiveSubaccountIndex: (index: number) => void;
}

/**
 * Zustand store for managing Drift-related state
 * Uses persist middleware to save state in localStorage
 */
export const useDriftSubaccountStore = create<DriftState>()(
  persist(
    (set) => ({
      // Default to subaccount #0
      activeSubaccountIndex: 0,

      // Set the active subaccount index
      setActiveSubaccountIndex: (index: number) =>
        set({ activeSubaccountIndex: index }),
    }),
    {
      name: "drift-storage", // unique name for localStorage
      partialize: (state) => ({
        activeSubaccountIndex: state.activeSubaccountIndex,
      }),
    }
  )
);
