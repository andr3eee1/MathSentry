import React, { forwardRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { BookOpen, X } from 'lucide-react-native';
import { C, F } from '@/theme';
import { MathText } from '@/components/MathText';

interface TheoremSheetProps {
  onClose?: () => void;
  theorems?: Array<{ name: string; statement: string }>;
}

export const TheoremSheet = forwardRef<BottomSheetModal, TheoremSheetProps>(
  ({ onClose, theorems }, ref) => {
    const snapPoints = useMemo(() => ['80%'], []);

    const activeTheorems = theorems || [];

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.5}
          style={[props.style, { backgroundColor: C.slateDeep }]}
        />
      ),
      []
    );

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.handle}
        backgroundStyle={styles.sheetBackground}
      >
        <BottomSheetScrollView
          style={styles.container}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <Pressable
            onPress={() => {
              (ref as any)?.current?.dismiss();
              onClose?.();
            }}
            hitSlop={8}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="Închide"
          >
            <X size={18} color={C.mutedFg} strokeWidth={2} />
          </Pressable>

          <View style={styles.titleRow}>
            <BookOpen size={16} color={C.primary} strokeWidth={2} />
            <Text style={styles.title}>Breviar de Teoreme & Axiome</Text>
          </View>

          <View style={{ gap: 12, marginTop: 12 }}>
            {activeTheorems.length === 0 && (
              <Text style={styles.footerText}>
                Nicio teoremă de referință nu a fost identificată pentru această analiză.
              </Text>
            )}
            {activeTheorems.map((t, idx) => (
              <View key={`thm-${idx}`} style={styles.theoremBox}>
                <Text style={styles.boxLabel}>
                  §{idx + 1} · {t.name.toUpperCase()}
                </Text>
                <MathText style={styles.boxBody}>{t.statement}</MathText>
              </View>
            ))}
          </View>

          <Text style={styles.footerText}>
            Notă metodologică ONM: Comisia Națională de Matematică impune
            verificarea explicită a domeniului de definiție și a condițiilor de
            pozitivitate înainte de invocarea acestor rezultate.
          </Text>
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

TheoremSheet.displayName = 'TheoremSheet';

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: C.card,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: C.border,
  },
  container: {
    padding: 20,
    position: 'relative',
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  title: {
    fontFamily: F.mathMed,
    fontSize: 18,
    color: C.foreground,
  },
  theoremBox: {
    borderWidth: 1,
    borderLeftWidth: 3,
    borderColor: C.border,
    borderLeftColor: C.primary,
    backgroundColor: C.background,
    borderRadius: 6,
    padding: 14,
  },
  boxLabel: {
    fontFamily: F.monoMed,
    fontSize: 10,
    letterSpacing: 0.5,
    color: C.primary,
    marginBottom: 6,
  },
  boxBody: {
    fontFamily: F.math,
    fontSize: 15,
    lineHeight: 22,
    color: C.foreground,
  },
  footerText: {
    marginTop: 16,
    fontFamily: F.mathItalic,
    fontSize: 13,
    color: C.mutedFg,
    lineHeight: 19,
  },
});
