export const C = {
  // Archival Paper & Carbon Ink Palette (Tufte / Typst / Editorial)
  slateDeep: '#161615',     // deep carbon ink (primary buttons, dark code surfaces)
  slateCard: '#22211F',     // warm obsidian card surface
  slateBorder: '#33312E',   // subtle dark ink border
  primary: '#1E3A5F',       // Oxford academic navy ink
  primaryDark: '#152945',   // deeper Oxford ink
  primaryFg: '#FCFBF8',     // crisp ivory text on ink
  background: '#F7F4EE',    // warm archival paper canvas
  card: '#FCFBF8',          // manuscript ivory sheet
  foreground: '#161615',    // carbon ink foreground
  muted: '#EFECE4',         // recessed stone paper surface
  mutedFg: '#6B665E',       // warm graphite secondary text
  border: '#DED9CE',        // hairline warm stone border
  borderLight: '#E8E3D9',   // subtle manuscript divider rule
  success: '#166534',       // forest verification ink
  successSoft: '#EBF5EE',   // soft botanical wash
  flaw: '#B91C1C',          // editorial red-pen crimson
  flawSoft: '#FDF2F2',      // pale crimson margin wash
  warn: '#B45309',          // ochre / amber annotation ink
  warnSoft: '#FDF8ED',      // soft parchment amber wash
  indigoSoft: '#EDF1F5',    // subtle Oxford navy wash
};

export const F = {
  ui: 'Inter_400Regular',
  uiMed: 'Inter_500Medium',
  uiSemi: 'Inter_600SemiBold',
  uiBold: 'Inter_700Bold',
  math: 'Newsreader_400Regular',
  mathItalic: 'Newsreader_400Regular_Italic',
  mathMed: 'Newsreader_500Medium',
  mono: 'JetBrainsMono_400Regular',
  monoMed: 'JetBrainsMono_500Medium',
};

// Subtle archival paper elevation (replaces neon indigo glow)
export const indigoShadow = {
  shadowColor: '#161615',
  shadowOpacity: 0.06,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2,
};

export const SPRING_CONFIG = {
  stiffness: 380,
  damping: 30,
  mass: 1,
};
