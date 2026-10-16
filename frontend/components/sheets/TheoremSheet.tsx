import React, { forwardRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { BookOpen, X } from 'lucide-react-native';
import { C, F } from '@/theme';
import { MathText, Var, Sup } from '@/components/MathText';

interface TheoremSheetProps {
  onClose?: () => void;
  theorems?: Array<{ name: string; statement: string }>;
}

export const TheoremSheet = forwardRef<BottomSheetModal, TheoremSheetProps>(
  ({ onClose, theorems }, ref) => {
    const snapPoints = useMemo(() => ['85%'], []);

    const activeTheorems = theorems && theorems.length > 0
      ? theorems
      : [
          {
            name: "BERNOULLI'S INEQUALITY",
            statement: 'Pentru orice număr întreg n ≥ 0 și orice număr real x ≥ −1, (1 + x)ⁿ ≥ 1 + nx.',
          },
          {
            name: 'ORDER AXIOM FOR MULTIPLICATION',
            statement: 'Dacă a ≥ b și c > 0, atunci ac ≥ bc. Dacă c < 0, sensul inegalității se inversează.',
          },
        ];

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
        <BottomSheetView style={styles.container}>
          {/* Close button at top right 16 */}
          <Pressable
            onPress={() => {
              (ref as any)?.current?.dismiss();
              onClose?.();
            }}
            hitSlop={8}
            style={styles.closeButton}
          >
            <X size={20} color={C.mutedFg} strokeWidth={2} />
          </Pressable>

          {/* Title Row */}
          <View style={styles.titleRow}>
            <BookOpen size={16} color={C.primary} strokeWidth={2} />
            <Text style={styles.title}>Teoreme & Axiome Relevante</Text>
          </View>

          {/* Dynamic Theorem List */}
          <View style={{ gap: 12, marginTop: 8 }}>
            {activeTheorems.map((t, idx) => (
              <View key={`thm-${idx}`} style={styles.box1}>
                <Text style={styles.boxLabel}>{t.name.toUpperCase()}</Text>
                <Text style={[styles.boxBody, { fontFamily: F.ui, lineHeight: 20 }]}>
                  {t.statement}
                </Text>
              </View>
            ))}
          </View>

          {/* Footer */}
          <Text style={styles.footerText}>
            Comisia Națională de Matematică cere justificarea explicită a oricărui domeniu de definiție și a condițiilor de pozitivitate înainte de aplicarea acestor teoreme.
          </Text>
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

TheoremSheet.displayName = 'TheoremSheet';

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: C.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handle: {
    width: 40,
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
    fontFamily: F.uiSemi,
    fontSize: 16,
    color: C.foreground,
  },
  box1: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    padding: 16,
  },
  box2: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    padding: 16,
  },
  boxLabel: {
    fontFamily: F.uiSemi,
    fontSize: 11,
    letterSpacing: 0.6,
    color: C.primary,
    marginBottom: 8,
  },
  boxBody: {
    fontFamily: F.math,
    fontSize: 16,
    lineHeight: 26,
    color: C.foreground,
  },
  highlightSpan: {
    backgroundColor: C.warnSoft,
    borderRadius: 4,
    paddingHorizontal: 4,
  },
  footerText: {
    marginTop: 12,
    fontFamily: F.ui,
    fontSize: 12,
    color: C.mutedFg,
    lineHeight: 18,
  },
});
