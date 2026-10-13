import { create } from 'zustand';
import type { AppState, AppActions, Phase } from '../types/state';

const initialState: AppState = {
  phase: 'flaw',
  fixed: false,
  inspectorOpen: false,
  hintOpen: true,
  shakeKey: 0,
};

export const useAppStore = create<AppState & AppActions>((set) => ({
  ...initialState,
  setPhase: (p: Phase) => set({ phase: p }),
  setFixed: (v: boolean) => set({ fixed: v }),
  setInspectorOpen: (v: boolean) => set({ inspectorOpen: v }),
  toggleInspector: () => set((s) => ({ inspectorOpen: !s.inspectorOpen })),
  setHintOpen: (v: boolean) => set({ hintOpen: v }),
  toggleHint: () => set((s) => ({ hintOpen: !s.hintOpen })),
  bumpShake: () => set((s) => ({ shakeKey: s.shakeKey + 1 })),
  reset: () => set(initialState),
}));
