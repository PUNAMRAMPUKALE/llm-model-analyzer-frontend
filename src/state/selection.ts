import { create } from "zustand";
type State = { selectedResponseId?: string; setSelected: (id?: string)=>void };
export const useSelection = create<State>((set)=>({ selectedResponseId: undefined, setSelected: (id)=>set({ selectedResponseId: id }) }));