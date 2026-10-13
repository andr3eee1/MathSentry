export type Phase = 'flaw' | 'scanning' | 'sound';

export type AppState = {
  phase: Phase;
  fixed: boolean;
  inspectorOpen: boolean;
  hintOpen: boolean;
  shakeKey: number;
};

export type AppActions = {
  setPhase: (p: Phase) => void;
  setFixed: (v: boolean) => void;
  setInspectorOpen: (v: boolean) => void;
  toggleInspector: () => void;
  setHintOpen: (v: boolean) => void;
  toggleHint: () => void;
  bumpShake: () => void;
  reset: () => void;
};
