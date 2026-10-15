import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, FileCode } from 'lucide-react-native';
import { C, F } from '@/theme';

interface HeaderProps {
  onOpenTypst: () => void;
  onBack?: () => void;
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenTypst,
  onBack,
  title = 'MathSentry Analysis',
  subtitle = 'OCR → LaTeX → AST Verified',
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 16,
        },
      ]}
    >
      <View style={styles.left}>
        <Pressable
          onPress={onBack}
          hitSlop={8}
          style={({ pressed }) => [{ opacity: pressed ? 0.3 : 0.6 }]}
        >
          <ChevronLeft size={20} color="#FFFFFF" strokeWidth={2} />
        </Pressable>
        <View style={styles.titleColumn}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>

      <Pressable
        onPress={onOpenTypst}
        style={({ pressed }) => [
          styles.typstButton,
          {
            backgroundColor: pressed
              ? 'rgba(91,82,242,0.30)'
              : 'rgba(91,82,242,0.18)',
          },
        ]}
      >
        <FileCode size={14} color="#FFFFFF" strokeWidth={2} />
        <Text style={styles.typstText}>Typst</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: C.slateDeep,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleColumn: {
    flexDirection: 'column',
  },
  title: {
    fontFamily: F.uiSemi,
    fontSize: 15,
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontFamily: F.mono,
    fontSize: 11,
    color: '#FFFFFF',
    opacity: 0.6,
  },
  typstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(79,70,229,0.6)',
  },
  typstText: {
    fontFamily: F.uiMed,
    fontSize: 12,
    color: '#FFFFFF',
  },
});
