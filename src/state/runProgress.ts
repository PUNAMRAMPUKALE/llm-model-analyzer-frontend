import { create } from "zustand";

type State = {
  activeRunId?: string;
  progressed: number; // 0..1
  status?: "RUNNING" | "COMPLETED" | "FAILED";
  set: (v: Partial<State>) => void;
  reset: () => void;
};

export const useRunProgress = create<State>((set) => ({
  progressed: 0,
  set: (v) => set(v),
  reset: () => set({ activeRunId: undefined, progressed: 0, status: undefined }),
}));
