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
  ShieldAlert,
  Sparkles,
} from 'lucide-react-native';
import { C, F, SPRING_CONFIG } from '@/theme';
import { MathText, Var, Sup } from '@/components/MathText';
import { Phase } from '@/components/PipelineStrip';
import { OlympiadAnalysisResult, StepEvaluation } from '@/types/olympiad';

interface ProofCardProps {
  phase: Phase;
  fixed: boolean;
  onToggleFixed: () => void;
  inspectorOpen: boolean;
  onToggleInspector: () => void;
  shakeKey: number;
  analysis?: OlympiadAnalysisResult | null;
}

export const ProofCard: React.FC<ProofCardProps> = ({
  phase,
  fixed,
  onToggleFixed,
  inspectorOpen,
  onToggleInspector,
  shakeKey,
  analysis,
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

  // AlertTriangle pulse for flaw
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

  // Shake animation on failed re-analysis
  const shakeScale = useSharedValue(1);
  const shakeTranslateX = useSharedValue(0);

  useEffect(() => {
    if (shakeKey > 0) {
      shakeScale.value = withSequence(
        withTiming(1.02, { duration: 225 }),
        withTiming(1, { duration: 225 })
      );
      shakeTranslateX.value = withSequence(
        withTiming(-4, { duration: 75 }),
        withTiming(4, { duration: 75 }),
        withTiming(-4, { duration: 75 }),
        withTiming(4, { duration: 75 }),
        withTiming(0, { duration: 75 })
      );
    }
  }, [shakeKey]);

  const stepFlawShakeStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: shakeScale.value },
      { translateX: shakeTranslateX.value },
    ],
  }));

  const handleEditConditionPress = (e: any) => {
    e.stopPropagation();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggleFixed();
  };

  const isSound = phase === 'sound' || (analysis?.phase === 'sound' && fixed);
  const fatalFlawStep = analysis?.fatalFlawStep ?? 3;
  const steps: StepEvaluation[] = analysis?.stepBreakdown && analysis.stepBreakdown.length > 0
    ? analysis.stepBreakdown
    : [
        {
          step: 1,
          label: 'BASE CASE (n = 1)',
          maxPercentage: 15,
          awardedPercentage: 15,
          deductionPercentage: 0,
          isSound: true,
          commentRo: 'For n = 1, (1 + x)¹ = 1 + 1(x), which holds identically.',
          onmPoints: 1.05,
          bacPoints: 1.5,
        },
        {
          step: 2,
          label: 'INDUCTIVE HYPOTHESIS',
          maxPercentage: 25,
          awardedPercentage: 25,
          deductionPercentage: 0,
          isSound: true,
          commentRo: 'Assume P(k) holds for some k ∈ ℕ, so (1 + x)^k ≥ 1 + kx.',
          onmPoints: 1.75,
          bacPoints: 2.5,
        },
        {
          step: 3,
          label: 'INDUCTIVE STEP',
          maxPercentage: 45,
          awardedPercentage: isSound ? 45 : 0,
          deductionPercentage: isSound ? 0 : 45,
          isSound: isSound,
          commentRo: isSound
            ? 'Since x > −1, we have 1 + x > 0. Multiply both sides by (1 + x): (1 + x)^(k+1) ≥ 1 + (k+1)x.'
            : 'Multiply both sides of P(k) by (1 + x) to obtain (1 + x)^(k+1) ≥ 1 + (k+1)x.',
          onmPoints: isSound ? 3.15 : 0,
          bacPoints: isSound ? 4.5 : 0,
        },
        {
          step: 4,
          label: 'CONCLUSION',
          maxPercentage: 15,
          awardedPercentage: isSound ? 15 : 0,
          deductionPercentage: isSound ? 0 : 15,
          isSound: isSound,
          isCascadedFailure: !isSound,
          commentRo: isSound
            ? 'By Mathematical Induction, P(n) holds for all n ∈ ℕ. ∎'
            : 'COLAPS ÎN CASCADĂ (0%): Concluzia se bazează pe Pasul 3 invalidat.',
          onmPoints: isSound ? 1.05 : 0,
          bacPoints: isSound ? 1.5 : 0,
        },
      ];

  const problemText = analysis?.problemRo || 'Prove that for all real x ≠ 0, (1 + x)ⁿ ≥ 1 + nx for n ∈ ℕ, given x > -1.';
  const domainText = analysis?.domain || 'Algebră / Inegalități';
  const onmScore = analysis?.scaledScores?.onm7p?.score ?? (isSound ? 7.0 : 2.8);
  const bacScore = analysis?.scaledScores?.bac10p?.score ?? (isSound ? 10.0 : 4.6);
  const scorePct = analysis?.scorePercentage ?? (isSound ? 100 : 40);

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
            colors={['transparent', 'rgba(91,82,242,0.25)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.scanningBeam}
          />
        </Animated.View>
      )}

      {/* Header Banner: Domain & Official Scales */}
      <View style={styles.cardHeaderRow}>
        <View style={styles.domainBadge}>
          <Sparkles size={11} color={C.primary} strokeWidth={2} />
          <Text style={styles.domainBadgeText}>{domainText.toUpperCase()}</Text>
        </View>

        <View style={styles.scoreBadgesRow}>
          <View style={[styles.scalePill, isSound ? styles.scalePillSound : styles.scalePillFlaw]}>
            <Text style={styles.scalePillLabel}>ONM</Text>
            <Text style={styles.scalePillValue}>{onmScore.toFixed(1)}/7.0p</Text>
          </View>
          <View style={[styles.scalePill, isSound ? styles.scalePillSound : styles.scalePillFlaw]}>
            <Text style={styles.scalePillLabel}>BAC</Text>
            <Text style={styles.scalePillValue}>{bacScore.toFixed(1)}/10p</Text>
          </View>
        </View>
      </View>

      {/* Problem Block */}
      <View style={styles.problemBlock}>
        <Text style={styles.problemLabel}>PROBLEM STATEMENT</Text>
        <Text style={styles.problemText}>{problemText}</Text>
      </View>

      {/* Steps Container */}
      <View style={styles.stepsContainer}>
        {steps.map((step) => {
          const stepNum = step.step;
          const isThisFatalFlaw = !isSound && stepNum === fatalFlawStep;
          const isThisCascaded = !isSound && (step.isCascadedFailure || stepNum > fatalFlawStep);
          const isThisSound = isSound || (step.isSound && !isThisFatalFlaw && !isThisCascaded);

          if (isThisSound) {
            return (
              <View key={`step-${stepNum}`} style={styles.verifiedStep}>
                <View style={styles.stepTopRow}>
                  <Text style={styles.stepLabel}>
                    STEP {stepNum} · {step.label.toUpperCase()}
                  </Text>
                  <View style={styles.scoreAndCheck}>
                    <Text style={styles.stepPointsPositive}>+{step.onmPoints.toFixed(2)}p</Text>
                    <View style={styles.checkBadge}>
                      <Check size={12} color={C.success} strokeWidth={2.5} />
                    </View>
                  </View>
                </View>
                <Text style={styles.stepBody}>{step.commentRo}</Text>
              </View>
            );
          }

          if (isThisFatalFlaw) {
            return (
              <Animated.View key={`step-${stepNum}`} style={stepFlawShakeStyle}>
                <Pressable
                  onPress={onToggleInspector}
                  style={styles.step3FlawContainer}
                >
                  <View style={styles.stepTopRow}>
                    <View style={styles.step3TitleRow}>
                      <Animated.View style={alertAnimatedStyle}>
                        <AlertTriangle size={14} color={C.flaw} strokeWidth={2.5} />
                      </Animated.View>
                      <Text style={styles.step3Label}>
                        STEP {stepNum} · {step.label.toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.astBreakBadge}>
                      <Text style={styles.astBreakText}>AST Node Break</Text>
                    </View>
                  </View>

                  <Text style={styles.stepBody}>
                    {fixed && (
                      <Text style={styles.fixedHighlightSpan}>
                        [Condiție adăugată: x &gt; -1 garantând 1 + x &gt; 0]{' '}
                      </Text>
                    )}
                    {step.commentRo}
                  </Text>

                  {!inspectorOpen ? (
                    <Text style={styles.collapsedHint}>
                      Apasă pentru a inspecta nodul AST și regula încălcată
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
                            {analysis?.astNodeBreak?.rule || 'Inequality_Multiply_Rule'}
                          </Text>
                          {' :: Condition ['}
                          <Text style={{ color: C.warn, fontFamily: F.mono }}>
                            {analysis?.astNodeBreak?.condition || '1 + x > 0'}
                          </Text>
                          {'] → '}
                          {fixed ? (
                            <Text style={{ color: C.success, fontFamily: F.mono }}>
                              ASSERTED (re-analizează)
                            </Text>
                          ) : (
                            <Text style={{ color: C.warn, fontFamily: F.mono }}>
                              UNVERIFIED
                            </Text>
                          )}
                        </Text>
                      </View>

                      {/* Interactive toggle button */}
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
                              Condiție specificată (1 + x &gt; 0)
                            </Text>
                          </>
                        ) : (
                          <>
                            <Pencil size={14} color={C.foreground} strokeWidth={2} />
                            <Text style={styles.inspectorButtonTextUnfixed}>
                              Corectează pasul: adaugă premisa lipsă
                            </Text>
                          </>
                        )}
                      </Pressable>
                    </Animated.View>
                  )}
                </Pressable>
              </Animated.View>
            );
          }

          // Cascaded Failure step
          return (
            <View
              key={`step-${stepNum}`}
              style={[
                styles.cascadedStep,
                { opacity: 0.55 },
              ]}
            >
              <View style={styles.stepTopRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <ShieldAlert size={13} color={C.flaw} strokeWidth={2} />
                  <Text style={styles.cascadedStepLabel}>
                    STEP {stepNum} · {step.label.toUpperCase()}
                  </Text>
                </View>
                <View style={styles.awaitingBadge}>
                  <PauseCircle size={12} color={C.flaw} strokeWidth={2} />
                  <Text style={styles.awaitingText}>
                    COLAPS ÎN CASCADĂ (0p)
                  </Text>
                </View>
              </View>
              <Text style={styles.stepBody}>
                {step.commentRo || `Pas anulat (0 puncte). Acest pas depinde deductiv de Pasul ${fatalFlawStep} care a fost invalidat.`}
              </Text>
            </View>
          );
        })}
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
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  scanningBeamContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 48,
    zIndex: 10,
  },
  scanningBeam: {
    width: '100%',
    height: '100%',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  domainBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(91,82,242,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  domainBadgeText: {
    fontSize: 10.5,
    fontFamily: F.mono,
    color: C.primary,
    fontWeight: '700',
  },
  scoreBadgesRow: {
    flexDirection: 'row',
    gap: 6,
  },
  scalePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  scalePillSound: {
    backgroundColor: 'rgba(16,185,129,0.1)',
    borderColor: 'rgba(16,185,129,0.3)',
  },
  scalePillFlaw: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderColor: 'rgba(239,68,68,0.3)',
  },
  scalePillLabel: {
    fontSize: 9.5,
    fontFamily: F.mono,
    color: C.mutedFg,
    fontWeight: '600',
  },
  scalePillValue: {
    fontSize: 10.5,
    fontFamily: F.mono,
    color: C.foreground,
    fontWeight: '700',
  },
  problemBlock: {
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  problemLabel: {
    fontSize: 10,
    fontFamily: F.mono,
    color: C.mutedFg,
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  problemText: {
    fontSize: 14.5,
    lineHeight: 21,
    color: C.foreground,
    fontFamily: F.math,
  },
  stepsContainer: {
    gap: 12,
  },
  verifiedStep: {
    backgroundColor: C.muted,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    padding: 12,
  },
  cascadedStep: {
    backgroundColor: 'rgba(239,68,68,0.04)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.2)',
    padding: 12,
  },
  stepTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  scoreAndCheck: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepPointsPositive: {
    fontSize: 10.5,
    fontFamily: F.mono,
    color: C.success,
    fontWeight: '600',
  },
  stepLabel: {
    fontSize: 10.5,
    fontFamily: F.mono,
    color: C.mutedFg,
    letterSpacing: 0.8,
  },
  cascadedStepLabel: {
    fontSize: 10.5,
    fontFamily: F.mono,
    color: C.flaw,
    letterSpacing: 0.8,
  },
  checkBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(16,185,129,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBody: {
    fontSize: 13.5,
    lineHeight: 20,
    color: C.foreground,
    fontFamily: F.math,
  },
  step3FlawContainer: {
    backgroundColor: 'rgba(239,68,68,0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.flaw,
    padding: 12,
  },
  step3TitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  step3Label: {
    fontSize: 10.5,
    fontFamily: F.mono,
    color: C.flaw,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  astBreakBadge: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  astBreakText: {
    fontSize: 9.5,
    fontFamily: F.mono,
    color: C.flaw,
    fontWeight: '700',
  },
  collapsedHint: {
    fontSize: 11,
    fontFamily: F.mono,
    color: C.mutedFg,
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  fixedHighlightSpan: {
    backgroundColor: 'rgba(16,185,129,0.15)',
    color: C.success,
    fontWeight: '600',
  },
  inspectorContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(239,68,68,0.2)',
    gap: 8,
  },
  codePill: {
    backgroundColor: C.muted,
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  codePillText: {
    fontSize: 11,
    color: C.foreground,
    fontFamily: F.mono,
  },
  inspectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  inspectorButtonUnfixed: {
    backgroundColor: C.card,
    borderColor: C.border,
  },
  inspectorButtonFixed: {
    backgroundColor: 'rgba(16,185,129,0.1)',
    borderColor: C.success,
  },
  inspectorButtonTextUnfixed: {
    fontSize: 12,
    fontFamily: F.mono,
    color: C.foreground,
  },
  inspectorButtonTextFixed: {
    fontSize: 12,
    fontFamily: F.mono,
    color: C.success,
    fontWeight: '600',
  },
  awaitingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(239,68,68,0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  awaitingText: {
    fontSize: 9.5,
    fontFamily: F.mono,
    color: C.flaw,
    fontWeight: '700',
  },
});
