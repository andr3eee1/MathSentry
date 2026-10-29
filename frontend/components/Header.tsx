import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, FileCode } from 'lucide-react-native';
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
  title = 'Fișă de Audit Formal',
  subtitle = 'EXTRACȚIE → ARBORE AST → BAREM ONM',
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 12,
        },
      ]}
    >
      <View style={styles.left}>
        <Pressable
          onPress={onBack}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Înapoi"
          style={({ pressed }) => [
            styles.backButton,
            pressed && { backgroundColor: C.muted },
          ]}
        >
          <ArrowLeft size={17} color={C.foreground} strokeWidth={2} />
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
          pressed && { backgroundColor: C.muted },
        ]}
      >
        <FileCode size={13} color={C.primary} strokeWidth={2} />
        <Text style={styles.typstText}>proof.typ</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: C.background,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleColumn: {
    flexDirection: 'column',
  },
  title: {
    fontFamily: F.mathMed,
    fontSize: 18,
    color: C.foreground,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontFamily: F.mono,
    fontSize: 10,
    color: C.mutedFg,
    letterSpacing: 0.5,
    marginTop: 1,
  },
  typstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.card,
  },
  typstText: {
    fontFamily: F.monoMed,
    fontSize: 11.5,
    color: C.primary,
  },
});
