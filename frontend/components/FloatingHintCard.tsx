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
} from 'lucide-react-native';
import { C, F, indigoShadow, SPRING_CONFIG } from '@/theme';
import { Phase } from '@/components/PipelineStrip';

interface FloatingHintCardProps {
  phase: Phase;
  hintOpen: boolean;
  onToggleHint: () => void;
  onReAnalyze: () => void;
  onOpenTheorem: () => void;
  onReset: () => void;
}

export const FloatingHintCard: React.FC<FloatingHintCardProps> = ({
  phase,
  hintOpen,
  onToggleHint,
  onReAnalyze,
  onOpenTheorem,
  onReset,
}) => {
  const insets = useSafeAreaInsets();

  // Entry translateY 40 -> 0 + opacity 0 -> 1 with spring
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

  // Chevron rotation 0 / 180 (collapsed = 180)
  const chevronRotation = useSharedValue(hintOpen ? 0 : 180);
  useEffect(() => {
    chevronRotation.value = withSpring(hintOpen ? 0 : 180, SPRING_CONFIG);
  }, [hintOpen]);

  const chevronAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronRotation.value}deg` }],
  }));

  // Spinner rotation for Re-Analyze button while scanning
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
  const isSound = phase === 'sound';

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
            <Text style={styles.soundTitle}>AST Logic Sound ✓</Text>
            <Text style={styles.soundSubtitle}>
              All 4 nodes verified against formal rules.
            </Text>
          </View>
          <Pressable onPress={onReset} hitSlop={8}>
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
            <Text style={styles.headerTitle}>AST Structural Flaw Detected</Text>
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
                Your logic breaks at{' '}
                <Text style={styles.bodyHighlight}>Step 3</Text>. You applied
                Bernoulli&apos;s inequality step (multiplying the inequality by 1 +
                x), but did you verify if the base condition{' '}
                <Text style={styles.bodyMath}>(x &gt; −1)</Text> holds true in
                this domain?
              </Text>

              {/* Buttons Row */}
              <View style={styles.buttonsRow}>
                {/* 1. Re-Analyze */}
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
                    <Text style={styles.buttonReAnalyzeText}>Re-Analyze</Text>
                  )}
                </Pressable>

                {/* 2. View Relevant Theorem */}
                <Pressable
                  onPress={onOpenTheorem}
                  style={styles.buttonTheorem}
                >
                  <Text style={styles.buttonTheoremText}>
                    View Relevant Theorem
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
  hintCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: C.primary,
    borderRadius: 16,
    padding: 16,
  },
  soundCard: {
    borderWidth: 2,
    borderColor: C.success,
    backgroundColor: C.successSoft,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  soundTextColumn: {
    flex: 1,
  },
  soundTitle: {
    fontFamily: F.uiBold,
    fontSize: 14,
    color: C.foreground,
  },
  soundSubtitle: {
    fontFamily: F.ui,
    fontSize: 12,
    color: C.mutedFg,
    marginTop: 2,
  },
  resetButtonText: {
    fontFamily: F.uiMed,
    fontSize: 12,
    color: C.primary,
    padding: 4,
  },
  headerPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontFamily: F.uiBold,
    fontSize: 14,
    color: C.foreground,
    flex: 1,
  },
  bodyText: {
    marginTop: 8,
    fontFamily: F.ui,
    fontSize: 13,
    lineHeight: 21,
    color: C.mutedFg,
  },
  bodyHighlight: {
    fontFamily: F.uiBold,
    color: C.foreground,
  },
  bodyMath: {
    fontFamily: F.mathItalic,
    color: C.foreground,
  },
  buttonsRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 8,
  },
  buttonReAnalyze: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonReAnalyzeText: {
    fontFamily: F.uiSemi,
    fontSize: 13,
    color: '#FFFFFF',
  },
  buttonTheorem: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonTheoremText: {
    fontFamily: F.uiMed,
    fontSize: 13,
    color: C.foreground,
  },
});
