import React, { forwardRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { Award, X, LogOut, LogIn } from 'lucide-react-native';
import { C, F } from '@/theme';
import { useAuth } from '@/context/AuthContext';
import { showToast } from '@/components/ToastHelper';

interface ProfileSheetProps {
  onClose?: () => void;
  onOpenAuth?: () => void;
}

export const ProfileSheet = forwardRef<BottomSheetModal, ProfileSheetProps>(
  ({ onClose, onOpenAuth }, ref) => {
    const snapPoints = useMemo(() => ['85%'], []);
    const { user, stats, logout } = useAuth();

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

    const handleLogout = async () => {
      await logout();
      showToast('Ai fost deconectat.', 'done');
      (ref as any)?.current?.dismiss();
      onClose?.();
    };

    const handleOpenAuth = () => {
      (ref as any)?.current?.dismiss();
      onClose?.();
      onOpenAuth?.();
    };

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

          <Text style={styles.candidateTitle}>
            {user ? user.username : 'Olympiad Candidate'}
          </Text>
          <Text style={styles.candidateEmail}>
            {user ? user.email : 'Autentifică-te pentru sincronizarea baremelor'}
          </Text>

          {/* 3-col Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statTile}>
              <Text style={styles.statValue}>
                {stats?.totalProofs ?? 24}
              </Text>
              <Text style={styles.statLabel}>Proofs</Text>
            </View>

            <View style={styles.statTile}>
              <Text style={styles.statValue}>
                {stats?.soundPercentage ?? 81}%
              </Text>
              <Text style={styles.statLabel}>Sound</Text>
            </View>

            <View style={styles.statTile}>
              <Text style={styles.statValue}>
                {stats?.streak ?? 7}
              </Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
          </View>

          {/* Gemini AI Status Card */}
          <View style={styles.aiStatusCard}>
            <View style={styles.aiStatusHeader}>
              <View style={styles.aiStatusDot} />
              <Text style={styles.aiStatusTitle}>Motor AI: Gemini Flash (Free Tier)</Text>
            </View>
            <Text style={styles.aiStatusDesc}>
              Analiză formală AST, verificare matematică în cascadă și suport multimodal pentru scris de mână activat.
            </Text>
          </View>

          {/* Auth Action Button */}
          <View style={styles.actionContainer}>
            {user ? (
              <Pressable onPress={handleLogout} style={styles.logoutButton}>
                <LogOut size={16} color={C.flaw} strokeWidth={2} />
                <Text style={styles.logoutText}>Deconectare cont</Text>
              </Pressable>
            ) : (
              <Pressable onPress={handleOpenAuth} style={styles.loginButton}>
                <LogIn size={16} color="#FFFFFF" strokeWidth={2} />
                <Text style={styles.loginText}>Autentificare / Înregistrare</Text>
              </Pressable>
            )}
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
  candidateEmail: {
    fontFamily: F.ui,
    fontSize: 12,
    color: C.mutedFg,
    marginTop: 2,
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
  actionContainer: {
    marginTop: 24,
    width: '100%',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.2)',
    backgroundColor: C.flawSoft,
  },
  logoutText: {
    fontFamily: F.uiMed,
    fontSize: 13,
    color: C.flaw,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: C.primary,
  },
  loginText: {
    fontFamily: F.uiSemi,
    fontSize: 13,
    color: '#FFFFFF',
  },
  aiStatusCard: {
    marginTop: 18,
    width: '100%',
    backgroundColor: 'rgba(91,82,242,0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(91,82,242,0.2)',
    padding: 12,
  },
  aiStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  aiStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.success,
  },
  aiStatusTitle: {
    fontSize: 12,
    fontFamily: F.mono,
    color: C.primary,
    fontWeight: '700',
  },
  aiStatusDesc: {
    fontSize: 11.5,
    fontFamily: F.ui,
    color: C.mutedFg,
    lineHeight: 16,
  },
});
