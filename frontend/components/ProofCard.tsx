import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  LayoutChangeEvent,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  FadeIn,
  FadeOut,
  LinearTransition,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
  Check,
  AlertTriangle,
  Pencil,
  PauseCircle,
} from 'lucide-react-native';
import { C, F, SPRING_CONFIG } from '@/theme';
import { MathText, Var, Sup } from '@/components/MathText';
import { Phase } from '@/components/PipelineStrip';

interface ProofCardProps {
  phase: Phase;
  fixed: boolean;
  onToggleFixed: () => void;
  inspectorOpen: boolean;
  onToggleInspector: () => void;
  shakeKey: number;
}

export const ProofCard: React.FC<ProofCardProps> = ({
  phase,
  fixed,
  onToggleFixed,
  inspectorOpen,
  onToggleInspector,
  shakeKey,
}) => {
  const [cardHeight, setCardHeight] = useState<number>(600);

  // Scanning beam animation
  const beamProgress = useSharedValue(0);
  useEffect(() => {
    if (phase === 'scanning') {
      beamProgress.value = 0;
      beamProgress.value = withTiming(0.7, {
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
      });
    } else {
      beamProgress.value = 0;
    }
  }, [phase]);

  const beamAnimatedStyle = useAnimatedStyle(() => ({
    top: beamProgress.value * cardHeight,
  }));

  // Step 3 AlertTriangle pulse (opacity 1 -> 0.5 -> 1, 2s loop)
  const alertOpacity = useSharedValue(1);
  useEffect(() => {
    if (phase !== 'sound') {
      alertOpacity.value = withRepeat(
        withSequence(
          withTiming(0.5, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        true
      );
    } else {
      alertOpacity.value = 1;
    }
  }, [phase]);

  const alertAnimatedStyle = useAnimatedStyle(() => ({
    opacity: alertOpacity.value,
  }));

  // Shake animation on failed re-analysis: scale [1, 1.02, 1] + translateX [0, -4, 4, 0] over 450ms
  const shakeScale = useSharedValue(1);
  const shakeTranslateX = useSharedValue(0);

  useEffect(() => {
    if (shakeKey > 0) {
      shakeScale.value = withSequence(
        withTiming(1.02, { duration: 225 }),
        withTiming(1, { duration: 225 })
      );
      shakeTranslateX.value = withSequence(
        withTiming(-4, { duration: 112 }),
        withTiming(4, { duration: 113 }),
        withTiming(0, { duration: 225 })
      );
    }
  }, [shakeKey]);

  const step3ShakeStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: shakeScale.value },
      { translateX: shakeTranslateX.value },
    ],
  }));

  const handleEditConditionPress = (e: any) => {
    e.stopPropagation?.();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggleFixed();
  };

  const isSound = phase === 'sound';

  return (
    <View
      style={styles.card}
      onLayout={(e: LayoutChangeEvent) =>
        setCardHeight(e.nativeEvent.layout.height)
      }
    >
      {/* Scanning beam */}
      {phase === 'scanning' && (
        <Animated.View
          style={[styles.scanningBeamContainer, beamAnimatedStyle]}
          pointerEvents="none"
        >
          <LinearGradient
            colors={['transparent', 'rgba(79,70,229,0.2)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.scanningBeam}
          />
        </Animated.View>
      )}

      {/* Problem Block */}
      <View style={styles.problemBlock}>
        <Text style={styles.problemLabel}>PROBLEM</Text>
        <MathText style={styles.problemText}>
          Prove that for all real <Var>x</Var> ≠ 0, (1 + <Var>x</Var>)
          <Sup italic>n</Sup> ≥ 1 + <Var>n</Var>
          <Var>x</Var> for <Var>n</Var> ∈ ℕ.
        </MathText>
      </View>

      {/* Steps Container */}
      <View style={styles.stepsContainer}>
        {/* Step 1: Base Case */}
        <View style={styles.verifiedStep}>
          <View style={styles.stepTopRow}>
            <Text style={styles.stepLabel}>STEP 1 · BASE CASE</Text>
            <View style={styles.checkBadge}>
              <Check size={12} color={C.success} strokeWidth={2} />
            </View>
          </View>
          <MathText style={styles.stepBody}>
            For <Var>n</Var> = 1, (1 + <Var>x</Var>)<Sup>1</Sup> = 1 + 1(
            <Var>x</Var>), which holds identically.
          </MathText>
        </View>

        {/* Step 2: Inductive Hypothesis */}
        <View style={styles.verifiedStep}>
          <View style={styles.stepTopRow}>
            <Text style={styles.stepLabel}>STEP 2 · INDUCTIVE HYPOTHESIS</Text>
            <View style={styles.checkBadge}>
              <Check size={12} color={C.success} strokeWidth={2} />
            </View>
          </View>
          <MathText style={styles.stepBody}>
            Assume <Var>P</Var>(<Var>k</Var>) holds for some <Var>k</Var> ∈ ℕ, so
            (1 + <Var>x</Var>)<Sup italic>k</Sup> ≥ 1 + <Var>k</Var>
            <Var>x</Var>.
          </MathText>
        </View>

        {/* Step 3: Flaw / Sound Step */}
        {isSound ? (
          <View style={styles.verifiedStep}>
            <View style={styles.stepTopRow}>
              <Text style={styles.stepLabel}>STEP 3 · INDUCTIVE STEP</Text>
              <View style={styles.checkBadge}>
                <Check size={12} color={C.success} strokeWidth={2} />
              </View>
            </View>
            <MathText style={styles.stepBody}>
              Since <Var>x</Var> &gt; −1, we have 1 + <Var>x</Var> &gt; 0.
              Multiply both sides of <Var>P</Var>(<Var>k</Var>) by (1 +{' '}
              <Var>x</Var>): (1 + <Var>x</Var>)<Sup italic>k+1</Sup> ≥ (1 +{' '}
              <Var>k</Var>
              <Var>x</Var>)(1 + <Var>x</Var>) = 1 + (<Var>k</Var>+1)
              <Var>x</Var> + <Var>k</Var>
              <Var>x</Var>
              <Sup>2</Sup> ≥ 1 + (<Var>k</Var>+1)<Var>x</Var>.
            </MathText>
          </View>
        ) : (
          <Animated.View style={step3ShakeStyle}>
            <Pressable
              onPress={onToggleInspector}
              style={styles.step3FlawContainer}
            >
              <View style={styles.stepTopRow}>
                <View style={styles.step3TitleRow}>
                  <Animated.View style={alertAnimatedStyle}>
                    <AlertTriangle size={14} color={C.flaw} strokeWidth={2} />
                  </Animated.View>
                  <Text style={styles.step3Label}>STEP 3 · INDUCTIVE STEP</Text>
                </View>
                <View style={styles.astBreakBadge}>
                  <Text style={styles.astBreakText}>AST Node Break</Text>
                </View>
              </View>

              <MathText style={styles.stepBody}>
                {fixed && (
                  <Text style={styles.fixedHighlightSpan}>
                    Given <Var>x</Var> &gt; −1,{' '}
                  </Text>
                )}
                Multiply both sides of <Var>P</Var>(<Var>k</Var>) by (1 +{' '}
                <Var>x</Var>) to obtain (1 + <Var>x</Var>)
                <Sup italic>k+1</Sup> ≥ (1 + <Var>k</Var>
                <Var>x</Var>)(1 + <Var>x</Var>) = 1 + (<Var>k</Var>+1)
                <Var>x</Var> + <Var>k</Var>
                <Var>x</Var>
                <Sup>2</Sup> ≥ 1 + (<Var>k</Var>+1)<Var>x</Var>.
              </MathText>

              {!inspectorOpen ? (
                <Text style={styles.collapsedHint}>
                  Tap to inspect AST node
                </Text>
              ) : (
                <Animated.View
                  entering={FadeIn.duration(200)}
                  exiting={FadeOut.duration(150)}
                  layout={LinearTransition.springify().damping(SPRING_CONFIG.damping).stiffness(SPRING_CONFIG.stiffness)}
                  style={styles.inspectorContainer}
                >
                  {/* Code pill */}
                  <View style={styles.codePill}>
                    <Text style={styles.codePillText}>
                      <Text style={{ color: C.primary, fontFamily: F.mono }}>
                        Inequality_Multiply_Rule
                      </Text>
                      {' :: Condition [1 + x > 0] → '}
                      {fixed ? (
                        <Text style={{ color: C.success, fontFamily: F.mono }}>
                          ASSERTED (pending re-analysis)
                        </Text>
                      ) : (
                        <Text style={{ color: C.warn, fontFamily: F.mono }}>
                          UNVERIFIED
                        </Text>
                      )}
                    </Text>
                  </View>

                  {/* Toggle Button */}
                  <Pressable
                    onPress={handleEditConditionPress}
                    style={[
                      styles.inspectorButton,
                      fixed
                        ? styles.inspectorButtonFixed
                        : styles.inspectorButtonUnfixed,
                    ]}
                  >
                    {fixed ? (
                      <>
                        <Check size={14} color={C.success} strokeWidth={2} />
                        <Text style={styles.inspectorButtonTextFixed}>
                          Domain restriction x &gt; −1 added
                        </Text>
                      </>
                    ) : (
                      <>
                        <Pencil size={14} color={C.foreground} strokeWidth={2} />
                        <Text style={styles.inspectorButtonTextUnfixed}>
                          Edit Step 3 Condition: add x &gt; −1
                        </Text>
                      </>
                    )}
                  </Pressable>
                </Animated.View>
              )}
            </Pressable>
          </Animated.View>
        )}

        {/* Step 4: Conclusion */}
        <View
          style={[
            styles.verifiedStep,
            { opacity: isSound ? 1 : 0.45 },
          ]}
        >
          <View style={styles.stepTopRow}>
            <Text style={styles.stepLabel}>STEP 4 · CONCLUSION</Text>
            {isSound ? (
              <View style={styles.checkBadge}>
                <Check size={12} color={C.success} strokeWidth={2} />
              </View>
            ) : (
              <View style={styles.awaitingBadge}>
                <PauseCircle size={12} color={C.mutedFg} strokeWidth={2} />
                <Text style={styles.awaitingText}>
                  Awaiting Step 3 resolution
                </Text>
              </View>
            )}
          </View>
          <MathText style={styles.stepBody}>
            By Mathematical Induction, <Var>P</Var>(<Var>n</Var>) holds for all{' '}
            <Var>n</Var> ∈ ℕ. ∎
          </MathText>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  scanningBeamContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: 64,
    zIndex: 10,
  },
  scanningBeam: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  problemBlock: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  problemLabel: {
    fontFamily: F.uiSemi,
    fontSize: 10,
    letterSpacing: 1.5,
    color: C.mutedFg,
  },
  problemText: {
    marginTop: 4,
    fontSize: 17,
    lineHeight: 22,
    color: C.foreground,
  },
  stepsContainer: {
    padding: 16,
    gap: 12,
  },
  verifiedStep: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.7)',
    padding: 14,
  },
  stepTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  stepLabel: {
    fontFamily: F.uiSemi,
    fontSize: 11,
    letterSpacing: 0.6,
    color: C.mutedFg,
  },
  checkBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: C.successSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBody: {
    fontFamily: F.math,
    fontSize: 16,
    lineHeight: 26,
    color: C.foreground,
  },
  step3FlawContainer: {
    backgroundColor: C.flawSoft,
    borderLeftWidth: 4,
    borderLeftColor: C.flaw,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    padding: 14,
  },
  step3TitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  step3Label: {
    fontFamily: F.uiSemi,
    fontSize: 11,
    letterSpacing: 0.6,
    color: C.flaw,
  },
  astBreakBadge: {
    backgroundColor: C.flaw,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  astBreakText: {
    fontFamily: F.uiSemi,
    fontSize: 10,
    color: '#FFFFFF',
  },
  fixedHighlightSpan: {
    backgroundColor: C.successSoft,
    color: C.success,
    borderRadius: 4,
    paddingHorizontal: 4,
  },
  collapsedHint: {
    fontFamily: F.ui,
    fontSize: 11,
    color: 'rgba(239,68,68,0.8)',
    marginTop: 8,
  },
  inspectorContainer: {
    marginTop: 4,
  },
  codePill: {
    marginTop: 12,
    backgroundColor: C.slateDeep,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  codePillText: {
    fontFamily: F.mono,
    fontSize: 11,
    lineHeight: 18,
    color: '#FFFFFF',
  },
  inspectorButton: {
    marginTop: 8,
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 8,
  },
  inspectorButtonUnfixed: {
    borderColor: C.border,
    backgroundColor: '#FFFFFF',
  },
  inspectorButtonFixed: {
    borderColor: 'rgba(22,163,74,0.4)',
    backgroundColor: C.successSoft,
  },
  inspectorButtonTextUnfixed: {
    fontFamily: F.uiMed,
    fontSize: 12,
    color: C.foreground,
  },
  inspectorButtonTextFixed: {
    fontFamily: F.uiMed,
    fontSize: 12,
    color: C.success,
  },
  awaitingBadge: {
    backgroundColor: C.muted,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  awaitingText: {
    fontFamily: F.ui,
    fontSize: 10,
    color: C.mutedFg,
  },
});
