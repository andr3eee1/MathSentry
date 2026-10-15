import React from 'react';
import { Text, TextProps, TextStyle, StyleSheet } from 'react-native';
import { F, C } from '@/theme';

interface MathTextProps extends TextProps {
  style?: TextStyle | TextStyle[];
  children?: React.ReactNode;
}

export const MathText: React.FC<MathTextProps> = ({ style, children, ...props }) => {
  return (
    <Text style={[styles.math, style]} {...props}>
      {children}
    </Text>
  );
};

export const Var: React.FC<{ children: React.ReactNode; style?: TextStyle }> = ({ children, style }) => {
  return (
    <Text style={[styles.var, style]}>
      {children}
    </Text>
  );
};

export const Sup: React.FC<{ children: React.ReactNode; italic?: boolean; style?: TextStyle }> = ({
  children,
  italic = false,
  style,
}) => {
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
    fontSize: 11,
    lineHeight: 11,
    transform: [{ translateY: -6 }],
  },
});
