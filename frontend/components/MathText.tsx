import React from 'react';
import { Text, TextProps, TextStyle, StyleSheet, Platform } from 'react-native';
import { F, C } from '@/theme';

interface MathTextProps extends TextProps {
  style?: TextStyle | TextStyle[];
  children?: React.ReactNode;
}

/**
 * Normalizes plain-text ASCII mathematical expressions into proper typographic symbols.
 */
export function normalizeMathString(input: string): string {
  return input
    .replace(/\bDelta'/g, 'Δ′')
    .replace(/\bDelta\b/g, 'Δ')
    .replace(/\bsum\b/g, '∑')
    .replace(/\bprod\b/g, '∏')
    .replace(/\bin\s+NN\*/g, '∈ ℕ*')
    .replace(/\bin\s+NN\b/g, '∈ ℕ')
    .replace(/\bin\s+RR\b/g, '∈ ℝ')
    .replace(/\bin\s+ZZ\b/g, '∈ ℤ')
    .replace(/\bin\s+QQ\b/g, '∈ ℚ')
    .replace(/!=/g, '≠')
    .replace(/<=>/g, '⇔')
    .replace(/>=/g, '≥')
    .replace(/<=/g, '≤')
    .replace(/=>/g, '⇒')
    .replace(/\bdot\b/g, '·')
    .replace(/\bqed\b/gi, '∎')
    .replace(/\bcheckmark\b/gi, '✓')
    .replace(/a1\.\.an/g, 'a₁, …, aₙ')
    .replace(/b1\.\.bn/g, 'b₁, …, bₙ')
    // Only in clear math context: "ai" is a common Romanian word ("ai omis")
    .replace(/\bai\s+bi\b/g, 'aᵢ bᵢ')
    .replace(/\b(ai|bi)(?=\^)/g, (_m, v) => `${v[0]}ᵢ`)
    .replace(/\b(sum|∑)\s+(ai|bi)\b/g, (_m, s, v) => `${s} ${v[0]}ᵢ`);
}

/**
 * Tokenizes a string into base text and superscripts like ^(k+1), ^n, ^k, ^2
 */
function renderFormattedMathString(raw: string): React.ReactNode[] {
  const text = normalizeMathString(raw);
  // Match ^(expr) or ^alphanumeric
  const regex = /(\^\([^)]+\)|\^[a-zA-Z0-9+-]+)/g;
  const parts: React.ReactNode[] = [];
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      parts.push(text.slice(lastIdx, match.index));
    }
    const token = match[0];
    const supContent = token.startsWith('^(') && token.endsWith(')')
      ? token.slice(2, -1)
      : token.slice(1);

    parts.push(
      <Sup key={`sup-${match.index}`} italic={/^[a-zA-Z]/.test(supContent)}>
        {supContent}
      </Sup>
    );
    lastIdx = regex.lastIndex;
  }

  if (lastIdx < text.length) {
    parts.push(text.slice(lastIdx));
  }

  return parts;
}

export const MathText: React.FC<MathTextProps> = ({ style, children, ...props }) => {
  const formattedChildren = React.Children.map(children, (child) => {
    if (typeof child === 'string') {
      return renderFormattedMathString(child);
    }
    return child;
  });

  return (
    <Text style={[styles.math, style]} {...props}>
      {formattedChildren}
    </Text>
  );
};

export const Var: React.FC<{ children: React.ReactNode; style?: TextStyle }> = ({
  children,
  style,
}) => {
  return <Text style={[styles.var, style]}>{children}</Text>;
};

export const Sup: React.FC<{
  children: React.ReactNode;
  italic?: boolean;
  style?: TextStyle;
}> = ({ children, italic = false, style }) => {
  return (
    <Text
      style={[
        styles.sup,
        italic ? { fontFamily: F.mathItalic } : { fontFamily: F.math },
        style,
      ]}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  math: {
    fontFamily: F.math,
    color: C.foreground,
  },
  var: {
    fontFamily: F.mathItalic,
  },
  sup: {
    fontSize: 10.5,
    lineHeight: 13,
    ...Platform.select({
      web: {
        verticalAlign: 'super' as any,
        position: 'relative' as any,
        top: -4,
      },
      default: {
        verticalAlign: 'top',
        transform: [{ translateY: -4 }],
      },
    }),
  },
});
