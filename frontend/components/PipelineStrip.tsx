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
        withTiming(360, { duration: 900, easing: Easing.linear }),
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
        {/* Stage 1: OCR / Symbolic Extraction */}
        <View style={styles.stageItem}>
          <Text style={styles.stageIndex}>01</Text>
          <Text style={styles.stageText}>TRANSCRIERE LaTeX</Text>
          <Check size={11} color={C.success} strokeWidth={2.5} />
        </View>

        <Text style={styles.divider}>/</Text>

        {/* Stage 2: AST Dependency Graph */}
        <View style={styles.stageItem}>
          <Text style={styles.stageIndex}>02</Text>
          <Text style={styles.stageText}>ARBORE DEDUCTIV</Text>
          <Check size={11} color={C.success} strokeWidth={2.5} />
        </View>

        <Text style={styles.divider}>/</Text>

        {/* Stage 3: Verdict State */}
        {phase === 'flaw' && (
          <View style={[styles.stageItem, styles.flawBadge]}>
            <AlertTriangle size={11} color={C.flaw} strokeWidth={2.2} />
            <Text style={styles.flawText}>03 FRACTURĂ DETECTATĂ</Text>
          </View>
        )}

        {phase === 'scanning' && (
          <View style={[styles.stageItem, styles.scanningBadge]}>
            <Animated.View style={spinnerAnimatedStyle}>
              <Loader2 size={11} color={C.primary} strokeWidth={2.2} />
            </Animated.View>
            <Text style={styles.scanningText}>03 SE AUDITEAZĂ PAȘII…</Text>
          </View>
        )}

        {phase === 'sound' && (
          <View style={[styles.stageItem, styles.soundBadge]}>
            <Check size={11} color={C.success} strokeWidth={2.5} />
            <Text style={styles.soundText}>03 VALIDAT RIGUROS</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: C.muted,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  stageIndex: {
    fontFamily: F.mono,
    fontSize: 10,
    color: C.mutedFg,
  },
  stageText: {
    fontFamily: F.monoMed,
    fontSize: 10.5,
    color: C.foreground,
    letterSpacing: 0.4,
  },
  divider: {
    fontFamily: F.mono,
    fontSize: 11,
    color: C.border,
    marginHorizontal: 2,
  },
  flawBadge: {
    backgroundColor: C.flawSoft,
    borderWidth: 1,
    borderColor: 'rgba(185, 28, 28, 0.25)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  flawText: {
    fontFamily: F.monoMed,
    fontSize: 10.5,
    color: C.flaw,
    letterSpacing: 0.3,
  },
  scanningBadge: {
    backgroundColor: C.indigoSoft,
    borderWidth: 1,
    borderColor: 'rgba(30, 58, 95, 0.2)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  scanningText: {
    fontFamily: F.monoMed,
    fontSize: 10.5,
    color: C.primary,
    letterSpacing: 0.3,
  },
  soundBadge: {
    backgroundColor: C.successSoft,
    borderWidth: 1,
    borderColor: 'rgba(22, 101, 52, 0.25)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  soundText: {
    fontFamily: F.monoMed,
    fontSize: 10.5,
    color: C.success,
    letterSpacing: 0.3,
  },
});
