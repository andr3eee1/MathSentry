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
}

export const TheoremSheet = forwardRef<BottomSheetModal, TheoremSheetProps>(
  ({ onClose }, ref) => {
    const snapPoints = useMemo(() => ['85%'], []);

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
            <Text style={styles.title}>Relevant Theorems</Text>
          </View>

          {/* Box 1: BERNOULLI'S INEQUALITY */}
          <View style={styles.box1}>
            <Text style={styles.boxLabel}>BERNOULLI&apos;S INEQUALITY</Text>
            <MathText style={styles.boxBody}>
              For every integer <Var>n</Var> ≥ 0 and every real number{' '}
              <Text style={styles.highlightSpan}>
                <Var>x</Var> ≥ −1
              </Text>
              , (1 + <Var>x</Var>)<Sup italic>n</Sup> ≥ 1 + <Var>n</Var><Var>x</Var>.
            </MathText>
          </View>

          {/* Box 2: ORDER AXIOM FOR MULTIPLICATION */}
          <View style={styles.box2}>
            <Text style={styles.boxLabel}>ORDER AXIOM FOR MULTIPLICATION</Text>
            <MathText style={styles.boxBody}>
              If <Var>a</Var> ≥ <Var>b</Var> and{' '}
              <Text style={styles.highlightSpan}>
                <Var>c</Var> &gt; 0
              </Text>
              , then <Var>a</Var><Var>c</Var> ≥ <Var>b</Var><Var>c</Var>. If <Var>c</Var> &lt; 0, the inequality reverses.
            </MathText>
          </View>

          {/* Footer */}
          <Text style={styles.footerText}>
            Ask yourself: what must be true about the multiplier before the
            inequality direction is preserved?
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
