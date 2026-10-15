import React, { forwardRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { Award, X } from 'lucide-react-native';
import { C, F } from '@/theme';

interface ProfileSheetProps {
  onClose?: () => void;
}

export const ProfileSheet = forwardRef<BottomSheetModal, ProfileSheetProps>(
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

          {/* Centered Avatar Icon */}
          <View style={styles.avatarCircle}>
            <Award size={28} color={C.primary} strokeWidth={2} />
          </View>

          <Text style={styles.candidateTitle}>Olympiad Candidate</Text>

          {/* 3-col Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statTile}>
              <Text style={styles.statValue}>24</Text>
              <Text style={styles.statLabel}>Proofs</Text>
            </View>

            <View style={styles.statTile}>
              <Text style={styles.statValue}>81%</Text>
              <Text style={styles.statLabel}>Sound</Text>
            </View>

            <View style={styles.statTile}>
              <Text style={styles.statValue}>7</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

ProfileSheet.displayName = 'ProfileSheet';

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
    alignItems: 'center',
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 4,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: C.indigoSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  candidateTitle: {
    fontFamily: F.uiSemi,
    fontSize: 16,
    color: C.foreground,
    marginTop: 12,
    textAlign: 'center',
  },
  statsGrid: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  statTile: {
    flex: 1,
    backgroundColor: C.muted,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: F.uiBold,
    fontSize: 18,
    color: C.foreground,
  },
  statLabel: {
    fontFamily: F.ui,
    fontSize: 11,
    color: C.mutedFg,
    marginTop: 2,
  },
});
