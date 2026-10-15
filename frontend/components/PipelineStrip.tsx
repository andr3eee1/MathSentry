import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { Check, AlertTriangle, Loader2 } from 'lucide-react-native';
import { C, F } from '@/theme';

export type Phase = 'flaw' | 'scanning' | 'sound';

interface PipelineStripProps {
  phase: Phase;
}

export const PipelineStrip: React.FC<PipelineStripProps> = ({ phase }) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (phase === 'scanning') {
      rotation.value = 0;
      rotation.value = withRepeat(
        withTiming(360, { duration: 800, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      cancelAnimation(rotation);
      rotation.value = 0;
    }
  }, [phase]);

  const spinnerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Chip 1: OCR Digitized */}
        <View style={styles.okChip}>
          <Check size={12} color={C.success} strokeWidth={2} />
          <Text style={styles.okChipText}>OCR Digitized</Text>
        </View>

        {/* Chip 2: LaTeX Parsed */}
        <View style={styles.okChip}>
          <Check size={12} color={C.success} strokeWidth={2} />
          <Text style={styles.okChipText}>LaTeX Parsed</Text>
        </View>

        {/* Chip 3: State-dependent */}
        {phase === 'flaw' && (
          <View style={styles.flawChip}>
            <AlertTriangle size={12} color={C.warn} strokeWidth={2} />
            <Text style={styles.flawChipText}>AST Logic: 1 Flaw</Text>
          </View>
        )}

        {phase === 'scanning' && (
          <View style={styles.scanningChip}>
            <Animated.View style={spinnerAnimatedStyle}>
              <Loader2 size={12} color={C.primary} strokeWidth={2} />
            </Animated.View>
            <Text style={styles.scanningChipText}>Evaluating AST…</Text>
          </View>
        )}

        {phase === 'sound' && (
          <View style={styles.okChip}>
            <Check size={12} color={C.success} strokeWidth={2} />
            <Text style={styles.okChipText}>AST Logic Sound</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: C.card,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  okChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: C.successSoft,
  },
  okChipText: {
    fontFamily: F.uiMed,
    fontSize: 11,
    color: C.success,
  },
  flawChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: C.warnSoft,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
  },
  flawChipText: {
    fontFamily: F.uiMed,
    fontSize: 11,
    color: C.warn,
  },
  scanningChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: C.indigoSoft,
  },
  scanningChipText: {
    fontFamily: F.uiMed,
    fontSize: 11,
    color: C.primary,
  },
});
