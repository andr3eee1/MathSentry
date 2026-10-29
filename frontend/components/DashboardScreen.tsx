import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import {
  Camera,
  Check,
  AlertTriangle,
  ChevronRight,
  Plus,
  History,
  User as UserIcon,
  Scale,
  Type,
} from 'lucide-react-native';
import { C, F } from '@/theme';
import { MathText } from '@/components/MathText';
import { useAuth } from '@/context/AuthContext';
import { api, HistoryItem } from '@/services/api';
import { UserProblem } from '@/types/olympiad';

interface DashboardScreenProps {
  onOpenAnalysis: (proofId: string) => void;
  openingId?: string | null;
  onOpenScan: (
    mode?: 'solution' | 'problem',
    problem?: UserProblem | null,
    input?: 'camera' | 'text'
  ) => void;
  onOpenHistory: () => void;
  onOpenProfile: () => void;
  onOpenAuth: () => void;
  refreshTrigger?: number;
}

/** Public worked examples, readable by every account. */
const EXAMPLES = [
  {
    id: 'analysis_bernoulli_01',
    domain: 'ALGEBRĂ · CLASA IX–XII',
    title: 'Inegalitatea lui Bernoulli',
    sub: 'Inducție & condiția de semn 1 + x > 0',
  },
  {
    id: 'analysis_cauchy_01',
    domain: 'ALGEBRĂ · INEGALITĂȚI',
    title: 'Lema lui Titu (Cauchy–Schwarz)',
    sub: 'Numitori strict pozitivi',
  },
  {
    id: 'analysis_dirichlet_01',
    domain: 'TEORIA NUMERELOR',
    title: 'Principiul lui Dirichlet',
    sub: 'Clase de resturi modulo 7',
  },
  {
    id: 'analysis_imo_01',
    domain: 'OIM 2001 · PROBLEMA 2',
    title: 'Lanț de inegalități AM-GM',
    sub: 'Demonstrație completă (7p)',
  },
];

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onOpenAnalysis,
  openingId,
  onOpenScan,
  onOpenHistory,
  onOpenProfile,
  onOpenAuth,
  refreshTrigger = 0,
}) => {
  const insets = useSafeAreaInsets();
  const { user, stats, isGuest } = useAuth();
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [problems, setProblems] = useState<UserProblem[]>([]);
  const [loadingProblems, setLoadingProblems] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoadingHistory(true);
      setLoadingProblems(true);
      const [historyRes, problemsRes] = await Promise.allSettled([
        api.getHistory(),
        api.getProblems(),
      ]);
      if (cancelled) return;
      if (historyRes.status === 'fulfilled') setHistoryItems(historyRes.value.slice(0, 5));
      if (problemsRes.status === 'fulfilled') setProblems(problemsRes.value);
      const failed = [historyRes, problemsRes].find((r) => r.status === 'rejected') as
        | PromiseRejectedResult
        | undefined;
      setLoadError(failed ? failed.reason?.message || 'Nu am putut încărca datele.' : null);
      setLoadingHistory(false);
      setLoadingProblems(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [refreshTrigger, user?.id]);

  const handleStartScan = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onOpenScan('solution');
  };

  const handleAddProblem = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onOpenScan('problem', null);
  };

  const handlePhotographSolutionForProblem = (problem: UserProblem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onOpenScan('solution', problem);
  };

  const handleTypeProof = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onOpenScan('solution', null, 'text');
  };

  const handleSelectRecent = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onOpenAnalysis(id);
  };

  const firstName = isGuest
    ? 'Oaspete'
    : user?.username
    ? user.username.split(' ')[0]
    : 'Olimpic';

  return (
    <View style={styles.container}>
      {/* 1. Editorial Archival Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 12,
          },
        ]}
      >
        <View style={styles.headerLeft}>
          <View style={styles.monogramBox}>
            <Text style={styles.monogramSymbol}>∑</Text>
          </View>
          <View>
            <Text style={styles.brandTitle}>MathSentry</Text>
            <Text style={styles.brandSubtitle}>
              CAIET DE AUDIT DEDUCTIV · ONM
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <Pressable
            onPress={onOpenHistory}
            hitSlop={6}
            style={({ pressed }) => [
              styles.headerBtn,
              pressed && { backgroundColor: C.muted },
            ]}
          >
            <History size={14} color={C.foreground} strokeWidth={2} />
            <Text style={styles.headerBtnText}>Arhivă</Text>
          </Pressable>

          <Pressable
            onPress={onOpenProfile}
            hitSlop={6}
            style={({ pressed }) => [
              styles.headerIconBtn,
              pressed && { backgroundColor: C.muted },
            ]}
          >
            <UserIcon size={15} color={C.foreground} strokeWidth={2} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          // Clear the absolutely-positioned BottomNav (74pt + safe area)
          { paddingBottom: insets.bottom + 74 + 28 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Dossier Greeting & Tabular Metrics Ledger */}
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={styles.welcomeSection}
        >
          <View style={styles.dossierMetaRow}>
            <Text style={styles.dossierMetaLabel}>
              CANDIDAT: {firstName.toUpperCase()}
            </Text>
            {stats ? (
              <Text style={styles.dossierMetaRight}>
                {stats.auditsLeftToday} / {stats.dailyLimit} AUDITURI AZI
              </Text>
            ) : null}
          </View>

          <View style={styles.ledgerTable}>
            <View style={styles.ledgerCell}>
              <Text style={styles.ledgerNumber}>{stats?.totalProofs ?? '—'}</Text>
              <Text style={styles.ledgerLabel}>LUCRĂRI AUDITATE</Text>
            </View>
            <View style={styles.ledgerDivider} />
            <View style={styles.ledgerCell}>
              <Text style={[styles.ledgerNumber, { color: C.success }]}>
                {stats && stats.totalProofs > 0 ? `${stats.soundPercentage}%` : '—'}
              </Text>
              <Text style={styles.ledgerLabel}>DEMONSTRAȚII VALIDE</Text>
            </View>
            <View style={styles.ledgerDivider} />
            <View style={styles.ledgerCell}>
              <Text style={[styles.ledgerNumber, { color: C.primary }]}>
                {stats?.averageOnm != null ? `${stats.averageOnm.toFixed(2)} / 7p` : '—'}
              </Text>
              <Text style={styles.ledgerLabel}>MEDIE BAREM ONM</Text>
            </View>
          </View>

          {isGuest && (
            <Pressable
              onPress={onOpenAuth}
              style={({ pressed }) => [styles.guestBanner, pressed && { opacity: 0.85 }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.guestBannerTitle}>Salvează-ți progresul</Text>
                <Text style={styles.guestBannerText}>
                  Creează un cont gratuit ca să nu pierzi analizele și să primești
                  mai multe audituri pe zi.
                </Text>
              </View>
              <ChevronRight size={16} color={C.primary} />
            </Pressable>
          )}

          {loadError && (
            <View style={styles.errorBanner}>
              <AlertTriangle size={13} color={C.flaw} strokeWidth={2.2} />
              <Text style={styles.errorBannerText}>{loadError}</Text>
            </View>
          )}
        </Animated.View>

        {/* 3. Primary Workbench Card: Audit Handwritten or Typed Proof */}
        <Animated.View
          entering={FadeInUp.duration(450).delay(60)}
          style={styles.workbenchCard}
        >
          <View style={styles.workbenchTopRow}>
            <Text style={styles.sectionIndexMono}>
              §1 · VERIFICARE DEMONSTRAȚIE
            </Text>
            <Text style={styles.workbenchSpecTag}>LaTeX + AST + TYPST</Text>
          </View>

          <Text style={styles.workbenchTitle}>
            Verifică o demonstrație pe barem
          </Text>
          <Text style={styles.workbenchDescription}>
            Fotografiază foaia scrisă de mână sau scrie pașii. Afli exact pasul
            în care se rupe raționamentul, de ce, și câte puncte ai lua.
          </Text>

          <View style={styles.workbenchButtonsRow}>
            <Pressable
              onPress={handleStartScan}
              style={({ pressed }) => [
                styles.primaryActionButton,
                pressed && { opacity: 0.88 },
              ]}
            >
              <Camera size={16} color={C.primaryFg} strokeWidth={2.2} />
              <Text style={styles.primaryActionButtonText}>
                Fotografiază foaia
              </Text>
            </Pressable>

            <Pressable
              onPress={handleTypeProof}
              style={({ pressed }) => [
                styles.secondaryActionButton,
                pressed && { backgroundColor: C.muted },
              ]}
            >
              <Type size={13} color={C.primary} strokeWidth={2} />
              <Text style={styles.secondaryActionButtonText}>Scrie textul</Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* 4. Problem Bank Section: User Problems & Solutions */}
        <Animated.View
          entering={FadeInUp.duration(450).delay(120)}
          style={styles.section}
        >
          <View style={styles.sectionHeaderRow}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={styles.sectionIndexMono}>
                §2 · CAIETUL DE PROBLEME
              </Text>
              <Text style={styles.sectionTitle}>
                Enunțuri de Concurs & Soluții Atașate
              </Text>
            </View>
            <Pressable
              onPress={handleAddProblem}
              style={({ pressed }) => [
                styles.addProblemBtn,
                pressed && { backgroundColor: C.muted },
              ]}
            >
              <Camera size={13} color={C.primary} strokeWidth={2.2} />
              <Text style={styles.addProblemBtnText}>+ Pozează Enunț</Text>
            </Pressable>
          </View>

          {loadingProblems && problems.length === 0 ? (
            <ActivityIndicator
              size="small"
              color={C.primary}
              style={{ marginVertical: 20 }}
            />
          ) : problems.length === 0 ? (
            <View style={styles.emptyProblemCard}>
              <Text style={styles.emptyTitle}>
                Nicio problemă personalizată înregistrată
              </Text>
              <Text style={styles.emptySubtitle}>
                Adaugă un enunț din Gazeta Matematică sau de la etapa
                județeană/națională pentru a-i atașa și evalua demonstrații.
              </Text>
              <Pressable onPress={handleAddProblem} style={styles.emptyActionBtn}>
                <Plus size={13} color={C.primaryFg} />
                <Text style={styles.emptyActionBtnText}>
                  Înregistrează Prima Problemă
                </Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.problemList}>
              {problems.map((prob) => {
                const hasSolutions = (prob.solutionCount || 0) > 0;
                const isSound = prob.latestStatus === 'sound';
                return (
                  <View key={prob.id} style={styles.problemCard}>
                    <View style={styles.problemCardHeader}>
                      <Text style={styles.domainTagText}>
                        {(prob.domain || 'Concurs').toUpperCase()}
                      </Text>

                      {hasSolutions ? (
                        <View
                          style={[
                            styles.statusTag,
                            {
                              backgroundColor: isSound
                                ? C.successSoft
                                : C.flawSoft,
                              borderColor: isSound
                                ? 'rgba(22, 101, 52, 0.25)'
                                : 'rgba(185, 28, 28, 0.25)',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusTagText,
                              { color: isSound ? C.success : C.flaw },
                            ]}
                          >
                            {prob.highestScore != null
                              ? `${prob.highestScore}% · ${
                                  isSound ? 'Validat' : 'Fractură'
                                }`
                              : `${prob.solutionCount} soluții`}
                          </Text>
                        </View>
                      ) : (
                        <Text style={styles.unsolvedLabel}>Fără rezolvări</Text>
                      )}
                    </View>

                    <Text style={styles.problemTitleText}>{prob.title}</Text>
                    <MathText style={styles.problemEnuntText} numberOfLines={2}>
                      {prob.enuntRo}
                    </MathText>

                    <View style={styles.problemCardFooter}>
                      <Text style={styles.problemMetaText}>
                        {prob.dateRelative || 'Recent'} ·{' '}
                        {prob.solutionCount || 0}{' '}
                        {prob.solutionCount === 1
                          ? 'demonstrație auditată'
                          : 'demonstrații auditate'}
                      </Text>

                      <Pressable
                        onPress={() => handlePhotographSolutionForProblem(prob)}
                        style={({ pressed }) => [
                          styles.snapSolutionBtn,
                          pressed && { opacity: 0.85 },
                        ]}
                      >
                        <Camera size={12} color={C.primaryFg} strokeWidth={2} />
                        <Text style={styles.snapSolutionBtnText}>
                          Pozează Rezolvarea
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </Animated.View>

        {/* 5. Recent Analyses Ledger */}
        <Animated.View
          entering={FadeInUp.duration(450).delay(180)}
          style={styles.section}
        >
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionIndexMono}>
                §3 · REGISTRUL DE EVALUĂRI
              </Text>
              <Text style={styles.sectionTitle}>Dosare de Concurs Recente</Text>
            </View>
            <Pressable onPress={onOpenHistory} hitSlop={8}>
              <Text style={styles.seeAllText}>Toate dosarele →</Text>
            </Pressable>
          </View>

          {loadingHistory ? (
            <ActivityIndicator
              size="small"
              color={C.primary}
              style={{ marginVertical: 20 }}
            />
          ) : historyItems.length === 0 ? (
            <View style={styles.emptyProblemCard}>
              <Text style={styles.emptyTitle}>Nicio demonstrație verificată încă</Text>
              <Text style={styles.emptySubtitle}>
                Fotografiază prima ta rezolvare sau deschide un exemplu de mai jos ca
                să vezi cum arată un audit.
              </Text>
            </View>
          ) : (
            <View style={styles.historyLedger}>
              {historyItems.map((item, index) => {
                const isSound = item.status === 'ok';
                const isLast = index === historyItems.length - 1;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => handleSelectRecent(item.id)}
                    disabled={Boolean(openingId)}
                    style={({ pressed }) => [
                      styles.historyRow,
                      !isLast && styles.historyRowBorder,
                      pressed && { backgroundColor: C.muted },
                    ]}
                  >
                    <View style={styles.historyLeft}>
                      <View
                        style={[
                          styles.statusSquare,
                          {
                            backgroundColor: isSound
                              ? C.successSoft
                              : C.flawSoft,
                            borderColor: isSound
                              ? 'rgba(22, 101, 52, 0.3)'
                              : 'rgba(185, 28, 28, 0.3)',
                          },
                        ]}
                      >
                        {isSound ? (
                          <Check size={13} color={C.success} strokeWidth={2.5} />
                        ) : (
                          <AlertTriangle
                            size={13}
                            color={C.flaw}
                            strokeWidth={2.2}
                          />
                        )}
                      </View>

                      <View style={styles.historyTextCol}>
                        <Text style={styles.historyTitle} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <Text style={styles.historyMeta}>
                          {item.date} · Barem ONM {item.onmScore.toFixed(2)} /
                          7.00p
                        </Text>
                      </View>
                    </View>

                    <View style={styles.historyRight}>
                      <Text
                        style={[
                          styles.historyPctMono,
                          { color: isSound ? C.success : C.flaw },
                        ]}
                      >
                        {item.scorePercentage}%
                      </Text>
                      {openingId === item.id ? (
                        <ActivityIndicator size="small" color={C.mutedFg} />
                      ) : (
                        <ChevronRight size={15} color={C.mutedFg} />
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* Public worked examples */}
          <Text style={[styles.sectionIndexMono, { marginTop: 18, marginBottom: 8 }]}>
            EXEMPLE REZOLVATE
          </Text>
          <View style={styles.referenceGrid}>
            {EXAMPLES.map((ex) => (
              <Pressable
                key={ex.id}
                onPress={() => handleSelectRecent(ex.id)}
                disabled={Boolean(openingId)}
                style={({ pressed }) => [
                  styles.referenceCard,
                  pressed && { backgroundColor: C.muted },
                  openingId === ex.id && { opacity: 0.6 },
                ]}
              >
                <Text style={styles.referenceDomain}>{ex.domain}</Text>
                <Text style={styles.referenceTitle}>{ex.title}</Text>
                <Text style={styles.referenceSub}>{ex.sub}</Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* 6. Official Grading Standards & Reference Tools */}
        <Animated.View
          entering={FadeInUp.duration(450).delay(240)}
          style={styles.standardsCard}
        >
          <View style={styles.standardsTopRow}>
            <Scale size={15} color={C.primary} strokeWidth={2} />
            <Text style={styles.standardsTitle}>
              §4 · REGULA COLAPSULUI ÎN CASCADĂ (BAREM OFICIAL)
            </Text>
          </View>
          <Text style={styles.standardsText}>
            Într-o demonstrație de olimpiadă, aplicarea unei operații nejustificate
            la pasul k (ex. înmulțire fără demonstrarea semnului pozitiv)
            invalidează pasul k și anulează automat toți pașii subsecvenți care
            depind de acesta.
          </Text>
          <View style={styles.scalesRow}>
            <View style={styles.scaleItem}>
              <Text style={styles.scaleFormula}>ONM (7.00p)</Text>
              <Text style={styles.scaleSub}>(Scor% / 100) × 7</Text>
            </View>
            <View style={styles.scaleItem}>
              <Text style={styles.scaleFormula}>BAC (10.0p)</Text>
              <Text style={styles.scaleSub}>1 + (Scor% / 100) × 9</Text>
            </View>
            <View style={styles.scaleItem}>
              <Text style={styles.scaleFormula}>USAMO (7.00p)</Text>
              <Text style={styles.scaleSub}>(Scor% / 100) × 7</Text>
            </View>
          </View>

        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  guestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: C.primary,
    backgroundColor: C.indigoSoft,
  },
  guestBannerTitle: {
    fontFamily: F.uiSemi,
    fontSize: 13,
    color: C.primary,
  },
  guestBannerText: {
    fontFamily: F.ui,
    fontSize: 12,
    lineHeight: 17,
    color: C.foreground,
    marginTop: 2,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 10,
    borderRadius: 6,
    backgroundColor: C.flawSoft,
    borderWidth: 1,
    borderColor: 'rgba(185, 28, 28, 0.25)',
  },
  errorBannerText: {
    flex: 1,
    fontFamily: F.ui,
    fontSize: 12,
    color: C.flaw,
  },
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  header: {
    backgroundColor: C.background,
    paddingHorizontal: 16,
    paddingBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  monogramBox: {
    width: 34,
    height: 34,
    borderRadius: 6,
    backgroundColor: C.slateDeep,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monogramSymbol: {
    fontFamily: F.mathMed,
    fontSize: 18,
    color: C.primaryFg,
  },
  brandTitle: {
    fontFamily: F.mathMed,
    fontSize: 19,
    color: C.foreground,
    letterSpacing: -0.3,
  },
  brandSubtitle: {
    fontFamily: F.mono,
    fontSize: 9.5,
    color: C.mutedFg,
    letterSpacing: 0.6,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.card,
  },
  headerBtnText: {
    fontFamily: F.uiMed,
    fontSize: 12,
    color: C.foreground,
  },
  headerIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  welcomeSection: {
    marginBottom: 18,
  },
  dossierMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dossierMetaLabel: {
    fontFamily: F.monoMed,
    fontSize: 10.5,
    color: C.mutedFg,
    letterSpacing: 0.6,
  },
  dossierMetaRight: {
    fontFamily: F.mono,
    fontSize: 10.5,
    color: C.mutedFg,
  },
  ledgerTable: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  ledgerCell: {
    flex: 1,
    alignItems: 'center',
  },
  ledgerNumber: {
    fontFamily: F.monoMed,
    fontSize: 17,
    color: C.foreground,
  },
  ledgerLabel: {
    fontFamily: F.mono,
    fontSize: 9,
    color: C.mutedFg,
    marginTop: 3,
    letterSpacing: 0.4,
  },
  ledgerDivider: {
    width: 1,
    height: 28,
    backgroundColor: C.border,
  },
  workbenchCard: {
    backgroundColor: C.card,
    borderRadius: 8,
    padding: 18,
    borderWidth: 1,
    borderLeftWidth: 3,
    borderColor: C.border,
    borderLeftColor: C.slateDeep,
    marginBottom: 24,
  },
  workbenchTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionIndexMono: {
    fontFamily: F.monoMed,
    fontSize: 10,
    color: C.primary,
    letterSpacing: 0.6,
  },
  workbenchSpecTag: {
    fontFamily: F.mono,
    fontSize: 9.5,
    color: C.mutedFg,
    backgroundColor: C.background,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: C.border,
  },
  workbenchTitle: {
    fontFamily: F.mathMed,
    fontSize: 20,
    color: C.foreground,
    letterSpacing: -0.2,
    marginBottom: 6,
  },
  workbenchDescription: {
    fontFamily: F.ui,
    fontSize: 13,
    lineHeight: 19,
    color: C.mutedFg,
    marginBottom: 16,
  },
  workbenchButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryActionButton: {
    flex: 1.25,
    backgroundColor: C.slateDeep,
    borderRadius: 6,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  primaryActionButtonText: {
    fontFamily: F.uiSemi,
    fontSize: 12.5,
    color: C.primaryFg,
  },
  secondaryActionButton: {
    flex: 1,
    backgroundColor: C.background,
    borderRadius: 6,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: C.border,
  },
  secondaryActionButtonText: {
    fontFamily: F.uiMed,
    fontSize: 12.5,
    color: C.primary,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: F.mathMed,
    fontSize: 17,
    color: C.foreground,
    marginTop: 2,
  },
  seeAllText: {
    fontFamily: F.monoMed,
    fontSize: 11,
    color: C.primary,
  },
  addProblemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: C.card,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: C.border,
  },
  addProblemBtnText: {
    fontFamily: F.uiSemi,
    fontSize: 11.5,
    color: C.primary,
  },
  problemList: {
    gap: 10,
  },
  problemCard: {
    backgroundColor: C.card,
    borderRadius: 6,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  problemCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  domainTagText: {
    fontFamily: F.monoMed,
    fontSize: 9.5,
    color: C.mutedFg,
    letterSpacing: 0.5,
  },
  statusTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  statusTagText: {
    fontFamily: F.monoMed,
    fontSize: 10,
  },
  unsolvedLabel: {
    fontFamily: F.mono,
    fontSize: 10,
    color: C.mutedFg,
  },
  problemTitleText: {
    fontFamily: F.uiSemi,
    fontSize: 14,
    color: C.foreground,
    marginBottom: 4,
  },
  problemEnuntText: {
    fontSize: 13.5,
    lineHeight: 19,
    color: C.mutedFg,
    marginBottom: 12,
  },
  problemCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: C.borderLight,
  },
  problemMetaText: {
    fontFamily: F.mono,
    fontSize: 10,
    color: C.mutedFg,
  },
  snapSolutionBtn: {
    backgroundColor: C.slateDeep,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  snapSolutionBtnText: {
    fontFamily: F.uiSemi,
    fontSize: 11,
    color: C.primaryFg,
  },
  emptyProblemCard: {
    backgroundColor: C.card,
    borderRadius: 6,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
    borderStyle: 'dashed',
  },
  emptyTitle: {
    fontFamily: F.mathMed,
    fontSize: 15,
    color: C.foreground,
    marginBottom: 4,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: F.ui,
    fontSize: 12,
    color: C.mutedFg,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
    maxWidth: 300,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: C.slateDeep,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  emptyActionBtnText: {
    fontFamily: F.uiSemi,
    fontSize: 12,
    color: C.primaryFg,
  },
  historyLedger: {
    backgroundColor: C.card,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
    marginBottom: 12,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  historyRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: C.borderLight,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  statusSquare: {
    width: 26,
    height: 26,
    borderRadius: 4,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyTextCol: {
    flex: 1,
  },
  historyTitle: {
    fontFamily: F.mathMed,
    fontSize: 15,
    color: C.foreground,
  },
  historyMeta: {
    fontFamily: F.mono,
    fontSize: 10.5,
    color: C.mutedFg,
    marginTop: 2,
  },
  historyRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  historyPctMono: {
    fontFamily: F.monoMed,
    fontSize: 12,
  },
  referenceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  referenceCard: {
    flexGrow: 1,
    flexBasis: '45%',
    backgroundColor: C.card,
    borderRadius: 6,
    padding: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  referenceDomain: {
    fontFamily: F.mono,
    fontSize: 9,
    color: C.primary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  referenceTitle: {
    fontFamily: F.mathMed,
    fontSize: 14.5,
    color: C.foreground,
    marginBottom: 2,
  },
  referenceSub: {
    fontFamily: F.ui,
    fontSize: 11,
    lineHeight: 15,
    color: C.mutedFg,
  },
  standardsCard: {
    backgroundColor: C.card,
    borderRadius: 6,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  standardsTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 8,
  },
  standardsTitle: {
    fontFamily: F.monoMed,
    fontSize: 10.5,
    color: C.foreground,
    letterSpacing: 0.5,
  },
  standardsText: {
    fontFamily: F.ui,
    fontSize: 12,
    lineHeight: 18,
    color: C.mutedFg,
    marginBottom: 12,
  },
  scalesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  scaleItem: {
    flex: 1,
    backgroundColor: C.background,
    borderRadius: 4,
    padding: 8,
    borderWidth: 1,
    borderColor: C.borderLight,
  },
  scaleFormula: {
    fontFamily: F.monoMed,
    fontSize: 10,
    color: C.primary,
  },
  scaleSub: {
    fontFamily: F.mono,
    fontSize: 9.5,
    color: C.mutedFg,
    marginTop: 2,
  },
  quickToolsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  quickToolButton: {
    flex: 1,
    backgroundColor: C.background,
    borderRadius: 5,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: C.border,
  },
  quickToolText: {
    fontFamily: F.uiMed,
    fontSize: 12,
    color: C.foreground,
  },
});
