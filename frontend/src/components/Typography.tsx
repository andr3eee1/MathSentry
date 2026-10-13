import React, { ReactNode } from 'react';
import { Text, TextProps } from 'react-native';
import { C, F } from '../theme/tokens';

type Variant = 'title' | 'subtitle' | 'body' | 'label' | 'mono' | 'math' | 'mathItalic';

const stylesMap: Record<Variant, any> = {
  title: { fontFamily: F.uiSemi, fontSize: 15, color: C.card, letterSpacing: -0.2 },
  subtitle: { fontFamily: F.mono, fontSize: 11, color: 'rgba(255,255,255,0.6)' },
  body: { fontFamily: F.ui, fontSize: 13, color: C.foreground, lineHeight: 21 },
  label: { fontFamily: F.uiSemi, fontSize: 10, color: C.mutedFg, letterSpacing: 1.5 },
  mono: { fontFamily: F.mono, fontSize: 11, lineHeight: 18, color: 'rgba(255,255,255,0.8)' },
  math: { fontFamily: F.math, fontSize: 16, lineHeight: 26, color: C.foreground },
  mathItalic: { fontFamily: F.mathItalic, fontSize: 16, lineHeight: 26, color: C.foreground },
};

export function TextVariant({ variant, style, children, ...rest }: { variant: Variant; style?: any } & TextProps & { children: ReactNode }) {
  return (
    <Text {...rest} style={[stylesMap[variant], style]}>
      {children}
    </Text>
  );
}
