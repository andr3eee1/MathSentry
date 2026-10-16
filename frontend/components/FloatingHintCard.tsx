import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  Easing,
  FadeIn,
  FadeOut,
  LinearTransition,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Sparkles,
  ChevronDown,
  Check,
  Loader2,
  BookOpen,
} from 'lucide-react-native';
import { C, F, indigoShadow, SPRING_CONFIG } from '@/theme';
import { Phase } from '@/components/PipelineStrip';
import { OlympiadAnalysisResult } from '@/types/olympiad';

interface FloatingHintCardProps {
  phase: Phase;
  hintOpen: boolean;
  onToggleHint: () => void;
  onReAnalyze: () => void;
  onOpenTheorem: () => void;
  onReset: () => void;
  analysis?: OlympiadAnalysisResult | null;
}

export const FloatingHintCard: React.FC<FloatingHintCardProps> = ({
  phase,
  hintOpen,
  onToggleHint,
  onReAnalyze,
  onOpenTheorem,
  onReset,
  analysis,
}) => {
  const insets = useSafeAreaInsets();

  const entryY = useSharedValue(40);
  const entryOpacity = useSharedValue(0);

  useEffect(() => {
    entryY.value = withSpring(0, SPRING_CONFIG);
    entryOpacity.value = withSpring(1, SPRING_CONFIG);
  }, []);

  const cardContainerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: entryY.value }],
    opacity: entryOpacity.value,
  }));

  const chevronRotation = useSharedValue(hintOpen ? 0 : 180);
  useEffect(() => {
    chevronRotation.value = withSpring(hintOpen ? 0 : 180, SPRING_CONFIG);
  }, [hintOpen]);

  const chevronAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronRotation.value}deg` }],
  }));

  const spinVal = useSharedValue(0);
  useEffect(() => {
    if (phase === 'scanning') {
      spinVal.value = 0;
      spinVal.value = withRepeat(
        withTiming(360, { duration: 800, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      spinVal.value = 0;
    }
  }, [phase]);

  const spinAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spinVal.value}deg` }],
  }));

  const isScanning = phase === 'scanning';
  const isSound = phase === 'sound' || (analysis?.phase === 'sound' && !isScanning);
  const fatalFlawStep = analysis?.fatalFlawStep ?? 3;
  const critiqueText = analysis?.teacherCritiqueRo || analysis?.explanationRo ||
    `Logica se rupe la Pasul ${fatalFlawStep}. Ai aplicat regula deductivă fără a justifica pozitivitatea termenului critic.`;

  return (
    <Animated.View
      style={[
        styles.absoluteContainer,
        { bottom: 96 + insets.bottom },
        cardContainerAnimatedStyle,
      ]}
    >
      {isSound ? (
        // Sound-state card
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={styles.soundCard}
        >
          <Check size={20} color={C.success} strokeWidth={2} />
          <View style={styles.soundTextColumn}>
            <Text style={styles.soundTitle}>
              AST Logic Sound ✓ ({analysis?.scaledScores?.onm7p?.score ?? 7.0}/7.0p)
            </Text>
            <Text style={styles.soundSubtitle} numberOfLines={2}>
              {analysis?.teacherCritiqueRo || 'Toate nodurile deductive au fost validate conform baremului național.'}
            </Text>
          </View>
          <Pressable onPress={onReset} hitSlop={8} style={styles.resetButton}>
            <Text style={styles.resetButtonText}>Reset</Text>
          </Pressable>
        </Animated.View>
      ) : (
        // Flaw / Scanning Hint card
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={[styles.hintCard, indigoShadow]}
        >
          {/* Header Pressable */}
          <Pressable onPress={onToggleHint} style={styles.headerPressable}>
            <Sparkles size={16} color={C.primary} strokeWidth={2} />
            <Text style={styles.headerTitle}>
              Audit Olimpic · Fractură Deductivă Pas {fatalFlawStep}
            </Text>
            <Animated.View style={chevronAnimatedStyle}>
              <ChevronDown size={16} color={C.mutedFg} strokeWidth={2} />
            </Animated.View>
          </Pressable>

          {/* Collapsible Body */}
          {hintOpen && (
            <Animated.View
              entering={FadeIn.duration(180)}
              exiting={FadeOut.duration(120)}
              layout={LinearTransition.springify().damping(SPRING_CONFIG.damping).stiffness(SPRING_CONFIG.stiffness)}
            >
              <Text style={styles.bodyText}>
                {critiqueText}
              </Text>

              {/* Buttons Row */}
              <View style={styles.buttonsRow}>
                {/* 1. Re-Analyze with Gemini */}
                <Pressable
                  onPress={onReAnalyze}
                  disabled={isScanning}
                  style={[
                    styles.buttonReAnalyze,
                    isScanning && { opacity: 0.7 },
                  ]}
                >
                  {isScanning ? (
                    <Animated.View style={spinAnimatedStyle}>
                      <Loader2 size={14} color="#FFFFFF" strokeWidth={2} />
                    </Animated.View>
                  ) : (
                    <Text style={styles.buttonReAnalyzeText}>Re-Analizează cu Gemini</Text>
                  )}
                </Pressable>

                {/* 2. View Relevant Theorem */}
                <Pressable
                  onPress={onOpenTheorem}
                  style={styles.buttonTheorem}
                >
                  <BookOpen size={13} color={C.foreground} strokeWidth={2} />
                  <Text style={styles.buttonTheoremText}>
                    Teoreme Relevante
                  </Text>
                </Pressable>
              </View>
            </Animated.View>
          )}
        </Animated.View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  absoluteContainer: {
    position: 'absolute',
    left: 12,
    right: 12,
    zIndex: 20,
  },
  soundCard: {
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.success,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  soundTextColumn: {
    flex: 1,
  },
  soundTitle: {
    fontSize: 13,
    fontFamily: F.mono,
    color: C.success,
    fontWeight: '700',
  },
  soundSubtitle: {
    fontSize: 12,
    fontFamily: F.ui,
    color: C.mutedFg,
    marginTop: 2,
    lineHeight: 16,
  },
  resetButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: C.muted,
  },
  resetButtonText: {
    fontSize: 12,
    fontFamily: F.mono,
    color: C.primary,
    fontWeight: '600',
  },
  hintCard: {
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
  },
  headerPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 12.5,
    fontFamily: F.mono,
    color: C.primary,
    fontWeight: '700',
  },
  bodyText: {
    fontSize: 13,
    lineHeight: 19,
    color: C.foreground,
    fontFamily: F.ui,
    marginTop: 10,
    marginBottom: 12,
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  buttonReAnalyze: {
    flex: 1,
    height: 38,
    backgroundColor: C.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonReAnalyzeText: {
    color: '#FFFFFF',
    fontFamily: F.mono,
    fontSize: 12,
    fontWeight: '700',
  },
  buttonTheorem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.muted,
    justifyContent: 'center',
  },
  buttonTheoremText: {
    color: C.foreground,
    fontFamily: F.mono,
    fontSize: 11.5,
  },
});
