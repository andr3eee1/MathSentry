import React, { forwardRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { X, LogOut, LogIn, Sparkles } from 'lucide-react-native';
import { C, F } from '@/theme';
import { useAuth } from '@/context/AuthContext';
import { showToast } from '@/components/ToastHelper';

interface ProfileSheetProps {
  onClose?: () => void;
  onOpenAuth?: () => void;
  onOpenPro?: () => void;
}

export const ProfileSheet = forwardRef<BottomSheetModal, ProfileSheetProps>(
  ({ onClose, onOpenAuth, onOpenPro }, ref) => {
    const snapPoints = useMemo(() => ['80%'], []);
    const { user, stats, isGuest, logout } = useAuth();

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
      showToast('Sesiune închisă.', 'done');
      (ref as any)?.current?.dismiss();
      onClose?.();
    };

    const handleOpenAuth = () => {
      (ref as any)?.current?.dismiss();
      onClose?.();
      onOpenAuth?.();
    };

    const handleOpenPro = () => {
      (ref as any)?.current?.dismiss();
      onClose?.();
      onOpenPro?.();
    };

    const isPro = user?.plan === 'pro';
    const proUntilLabel = user?.proUntil
      ? new Date(user.proUntil).toLocaleDateString('ro-RO', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : null;

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
          <Pressable
            onPress={() => {
              (ref as any)?.current?.dismiss();
              onClose?.();
            }}
            hitSlop={8}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="Închide"
          >
            <X size={18} color={C.mutedFg} strokeWidth={2} />
          </Pressable>

          {/* Monogram Badge */}
          <View style={styles.monogramCircle}>
            <Text style={styles.monogramLetter}>∑</Text>
          </View>

          <Text style={styles.candidateTitle}>
            {isGuest ? 'Sesiune fără cont' : user?.username || 'Candidat Olimpic'}
          </Text>
          <View style={[styles.planBadge, isPro && styles.planBadgePro]}>
            <Text style={[styles.planBadgeText, isPro && styles.planBadgeTextPro]}>
              {isPro ? 'PRO' : 'GRATUIT'}
            </Text>
          </View>
          <Text style={styles.candidateEmail}>
            {isGuest
              ? 'Creează un cont gratuit ca să-ți păstrezi analizele pe orice telefon.'
              : user?.email}
          </Text>

          {/* 3-col Tabular Ledger */}
          <View style={styles.statsGrid}>
            <View style={styles.statTile}>
              <Text style={styles.statValue}>{stats?.totalProofs ?? '—'}</Text>
              <Text style={styles.statLabel}>DEMONSTRAȚII</Text>
            </View>

            <View style={styles.statTile}>
              <Text style={[styles.statValue, { color: C.success }]}>
                {stats && stats.totalProofs > 0 ? `${stats.soundPercentage}%` : '—'}
              </Text>
              <Text style={styles.statLabel}>VALIDATE</Text>
            </View>

            <View style={styles.statTile}>
              <Text style={styles.statValue}>{stats ? `${stats.streak}z` : '—'}</Text>
              <Text style={styles.statLabel}>ZILE LA RÂND</Text>
            </View>
          </View>

          {/* Engine Specification Card */}
          <View style={styles.specCard}>
            <View style={styles.specHeader}>
              <View style={styles.specDot} />
              <Text style={styles.specTitle}>
                AUDITURI RĂMASE AZI: {stats ? `${stats.auditsLeftToday} / ${stats.dailyLimit}` : '—'}
              </Text>
            </View>
            <Text style={styles.specDesc}>
              Limita zilnică se resetează la miezul nopții (UTC).
              {isGuest ? ' Cu un cont gratuit primești mai multe audituri pe zi.' : ''}
            </Text>
            {isPro && proUntilLabel && (
              <Text style={[styles.specDesc, { color: C.success, marginTop: 4 }]}>
                Pro activ până la {proUntilLabel}
              </Text>
            )}
          </View>

          {/* Auth Action Button */}
          <View style={styles.actionContainer}>
            {!isPro && (
              <Pressable
                onPress={handleOpenPro}
                style={({ pressed }) => [
                  styles.proButton,
                  { marginBottom: 10 },
                  pressed && { opacity: 0.88 },
                ]}
                accessibilityRole="button"
              >
                <Sparkles size={15} color={C.primaryFg} strokeWidth={2} />
                <Text style={styles.loginText}>Treci la Pro</Text>
              </Pressable>
            )}
            {isGuest && (
              <Pressable onPress={handleOpenAuth} style={[styles.loginButton, { backgroundColor: C.slateDeep }]}>
                <LogIn size={15} color={C.primaryFg} strokeWidth={2} />
                <Text style={styles.loginText}>Creează cont gratuit</Text>
              </Pressable>
            )}
            <Pressable onPress={handleLogout} style={[styles.logoutButton, isGuest && { marginTop: 10 }]}>
              <LogOut size={15} color={C.flaw} strokeWidth={2} />
              <Text style={styles.logoutText}>
                {isGuest ? 'Ieși (analizele fără cont se pierd)' : 'Deconectare din cont'}
              </Text>
            </Pressable>
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
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  handle: {
    width: 36,
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
  monogramCircle: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: C.slateDeep,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  monogramLetter: {
    fontFamily: F.mathMed,
    fontSize: 24,
    color: C.primaryFg,
  },
  candidateTitle: {
    fontFamily: F.mathMed,
    fontSize: 19,
    color: C.foreground,
    marginTop: 12,
    textAlign: 'center',
  },
  candidateEmail: {
    fontFamily: F.mono,
    fontSize: 11,
    color: C.mutedFg,
    marginTop: 3,
    textAlign: 'center',
  },
  statsGrid: {
    marginTop: 18,
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  statTile: {
    flex: 1,
    backgroundColor: C.background,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: C.border,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: F.monoMed,
    fontSize: 17,
    color: C.foreground,
  },
  statLabel: {
    fontFamily: F.mono,
    fontSize: 9,
    color: C.mutedFg,
    marginTop: 3,
    letterSpacing: 0.5,
  },
  actionContainer: {
    marginTop: 20,
    width: '100%',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(185, 28, 28, 0.25)',
    backgroundColor: C.flawSoft,
  },
  logoutText: {
    fontFamily: F.uiSemi,
    fontSize: 13,
    color: C.flaw,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 6,
    backgroundColor: C.slateDeep,
  },
  loginText: {
    fontFamily: F.uiSemi,
    fontSize: 13,
    color: C.primaryFg,
  },
  planBadge: {
    marginTop: 8,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.muted,
  },
  planBadgePro: {
    backgroundColor: C.successSoft,
    borderColor: 'rgba(22, 101, 52, 0.3)',
  },
  planBadgeText: {
    fontFamily: F.monoMed,
    fontSize: 10,
    letterSpacing: 0.7,
    color: C.mutedFg,
  },
  planBadgeTextPro: {
    color: C.success,
  },
  proButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 6,
    backgroundColor: C.primary,
  },
  specCard: {
    marginTop: 16,
    width: '100%',
    backgroundColor: C.background,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: C.border,
    padding: 12,
  },
  specHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  specDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: C.success,
  },
  specTitle: {
    fontSize: 10.5,
    fontFamily: F.monoMed,
    color: C.primary,
  },
  specDesc: {
    fontSize: 11.5,
    fontFamily: F.ui,
    color: C.mutedFg,
    lineHeight: 17,
  },
});
