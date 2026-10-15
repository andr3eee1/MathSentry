import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import {
  ShieldCheck,
  Flame,
  Camera,
  Play,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  FileCode,
  Award,
  ChevronRight,
  Sparkles,
  TrendingUp,
  GraduationCap,
} from 'lucide-react-native';
import { C, F, indigoShadow } from '@/theme';
import { useAuth } from '@/context/AuthContext';
import { api, HistoryItem } from '@/services/api';
import { showToast } from '@/components/ToastHelper';

interface DashboardScreenProps {
  onOpenAnalysis: (proofId?: string) => void;
  onOpenScan: () => void;
  onOpenHistory: () => void;
  onOpenProfile: () => void;
  onOpenTypst: () => void;
  onOpenTheorem: () => void;
  onLogout: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onOpenAnalysis,
  onOpenScan,
  onOpenHistory,
  onOpenProfile,
  onOpenTypst,
  onOpenTheorem,
  onLogout,
}) => {
  const insets = useSafeAreaInsets();
  const { user, stats } = useAuth();
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    async function loadRecent() {
      setLoadingHistory(true);
      try {
        const data = await api.getHistory();
        if (data && data.length > 0) {
          setHistoryItems(data.slice(0, 4));
        }
      } catch {
        // Fallback default items if offline
      } finally {
        setLoadingHistory(false);
      }
    }
    loadRecent();
  }, []);

  const handleStartScan = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onOpenScan();
  };

  const handleOpenBernoulli = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onOpenAnalysis('analysis_bernoulli_01');
  };

  const handleSelectRecent = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onOpenAnalysis(id);
  };

  return (
    <View style={styles.container}>
      {/* 1. Header (dark slate, includes safe-area inset) */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 12,
          },
        ]}
      >
        <View style={styles.headerLeft}>
          <View style={styles.logoBadge}>
            <ShieldCheck size={18} color="#FFFFFF" strokeWidth={2.5} />
          </View>
          <View>
            <Text style={styles.brandTitle}>MathSentry</Text>
            <Text style={styles.brandSubtitle}>Panou de Control Olimpic</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <View style={styles.streakBadge}>
            <Flame size={14} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.streakText}>{stats?.streak ?? 7}z</Text>
          </View>

          <Pressable
            onPress={onOpenProfile}
            hitSlop={8}
            style={({ pressed }) => [
              styles.avatarButton,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Award size={16} color="#FFFFFF" strokeWidth={2} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Welcome Greeting & Stats Row */}
        <Animated.View
          entering={FadeInDown.duration(500)}
          style={styles.welcomeSection}
        >
          <View style={styles.welcomeTextColumn}>
            <Text style={styles.greetingTitle}>
              Salut, {user?.username ? user.username.split(' ')[0] : 'Olimpic'}!
            </Text>
            <Text style={styles.greetingSubtitle}>
              Sistemul de analiză formală AST este pregătit pentru evaluarea demonstrațiilor.
            </Text>
          </View>

          {/* Quick Metrics Bar */}
          <View style={styles.statsBar}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{stats?.totalProofs ?? 24}</Text>
              <Text style={styles.statLabel}>Demonstrații</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: C.success }]}>
                {stats?.soundPercentage ?? 81}%
              </Text>
              <Text style={styles.statLabel}>Acuratețe AST</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: C.primary }]}>5.7/7</Text>
              <Text style={styles.statLabel}>Medie ONM</Text>
            </View>
          </View>
        </Animated.View>

        {/* 3. Hero Action Card: Scan Handwritten Proof */}
        <Animated.View
          entering={FadeInUp.duration(600).delay(100)}
          style={[styles.heroCard, indigoShadow]}
        >
          <View style={styles.heroCardTop}>
            <View style={styles.heroIconBadge}>
              <Camera size={22} color="#FFFFFF" strokeWidth={2.2} />
            </View>
            <View style={styles.heroBadge}>
              <Sparkles size={11} color={C.primary} />
              <Text style={styles.heroBadgeText}>OCR + AST PIPELINE</Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>Scanează Lucrare Scrisă de Mână</Text>
          <Text style={styles.heroDescription}>
            Fotografiază rezolvarea pe foaie. MathSentry extrage automat codul LaTeX, reconstruiește arborele deductiv și detectează dacă vreo premisă este nejustificată.
          </Text>

          <View style={styles.heroButtonsRow}>
            <Pressable
              onPress={handleStartScan}
              style={({ pressed }) => [
                styles.primaryHeroButton,
                pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
              ]}
            >
              <Camera size={16} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.primaryHeroButtonText}>Deschide Camera</Text>
            </Pressable>

            <Pressable
              onPress={handleOpenBernoulli}
              style={({ pressed }) => [
                styles.secondaryHeroButton,
                pressed && { opacity: 0.8 },
              ]}
            >
              <Play size={14} color={C.primary} strokeWidth={2.5} />
              <Text style={styles.secondaryHeroButtonText}>Demonstrație Demo</Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* 4. Recent Analyses Section */}
        <Animated.View
          entering={FadeInUp.duration(600).delay(200)}
          style={styles.section}
        >
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>Analize Recente de Concurs</Text>
              <Text style={styles.sectionSubtitle}>
                Evaluări formale cu notare automată pe barem național
              </Text>
            </View>
            <Pressable onPress={onOpenHistory} hitSlop={8}>
              <Text style={styles.seeAllText}>Vezi tot</Text>
            </Pressable>
          </View>

          {loadingHistory ? (
            <ActivityIndicator size="small" color={C.primary} style={{ marginVertical: 20 }} />
          ) : (
            <View style={styles.historyList}>
              {historyItems.map((item) => {
                const isSound = item.status === 'ok';
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => handleSelectRecent(item.id)}
                    style={({ pressed }) => [
                      styles.historyCard,
                      pressed && { backgroundColor: C.muted },
                    ]}
                  >
                    <View style={styles.historyCardLeft}>
                      <View
                        style={[
                          styles.statusCircle,
                          {
                            backgroundColor: isSound ? C.successSoft : C.flawSoft,
                          },
                        ]}
                      >
                        {isSound ? (
                          <CheckCircle2 size={16} color={C.success} strokeWidth={2} />
                        ) : (
                          <AlertTriangle size={16} color={C.flaw} strokeWidth={2} />
                        )}
                      </View>

                      <View style={styles.historyCardTextColumn}>
                        <Text style={styles.historyCardTitle} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <Text style={styles.historyCardDate}>
                          {item.date} · Barem ONM {item.onmScore}/7.0p
                        </Text>
                      </View>
                    </View>

                    <View style={styles.historyCardRight}>
                      <View
                        style={[
                          styles.scorePill,
                          {
                            backgroundColor: isSound ? C.successSoft : C.warnSoft,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.scorePillText,
                            { color: isSound ? C.success : C.warn },
                          ]}
                        >
                          {item.scorePercentage}%
                        </Text>
                      </View>
                      <ChevronRight size={16} color={C.mutedFg} />
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </Animated.View>

        {/* 5. Olympiad Modules / Domains */}
        <Animated.View
          entering={FadeInUp.duration(600).delay(300)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Probe & Categorii de Olimpiadă</Text>
          <Text style={styles.sectionSubtitle}>
            Probleme calibrate pentru etapa județeană și națională (ONM)
          </Text>

          <View style={styles.gridContainer}>
            {/* Card 1: Algebra */}
            <Pressable
              onPress={handleOpenBernoulli}
              style={({ pressed }) => [
                styles.domainCard,
                pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
              ]}
            >
              <View style={styles.domainHeaderRow}>
                <View style={[styles.domainIconCircle, { backgroundColor: C.indigoSoft }]}>
                  <TrendingUp size={16} color={C.primary} strokeWidth={2} />
                </View>
                <Text style={styles.domainBadge}>ONM Clasa IX-XII</Text>
              </View>
              <Text style={styles.domainTitle}>Algebră & Inegalități</Text>
              <Text style={styles.domainDesc}>
                Inegalitatea lui Bernoulli, Cauchy-Schwarz, medii și raționament prin inducție completă.
              </Text>
              <View style={styles.domainFooter}>
                <Text style={styles.domainActionText}>Verifică model</Text>
                <ArrowRight size={14} color={C.primary} />
              </View>
            </Pressable>

            {/* Card 2: Number Theory */}
            <Pressable
              onPress={() => onOpenAnalysis('analysis_dirichlet_01')}
              style={({ pressed }) => [
                styles.domainCard,
                pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
              ]}
            >
              <View style={styles.domainHeaderRow}>
                <View style={[styles.domainIconCircle, { backgroundColor: '#FEF3C7' }]}>
                  <GraduationCap size={16} color="#D97706" strokeWidth={2} />
                </View>
                <Text style={styles.domainBadge}>Teoria Numerelor</Text>
              </View>
              <Text style={styles.domainTitle}>Aritmetică & Congruențe</Text>
              <Text style={styles.domainDesc}>
                Principiul cutiei (Dirichlet), resturi modulo p, divizibilitate și ecuații diofantice.
              </Text>
              <View style={styles.domainFooter}>
                <Text style={styles.domainActionText}>Verifică model</Text>
                <ArrowRight size={14} color={C.primary} />
              </View>
            </Pressable>
          </View>
        </Animated.View>

        {/* 6. Scoring Standards Banner */}
        <Animated.View
          entering={FadeInUp.duration(600).delay(400)}
          style={styles.standardsCard}
        >
          <View style={styles.standardsTopRow}>
            <Award size={18} color={C.primary} strokeWidth={2} />
            <Text style={styles.standardsTitle}>Sistem Oficial de Notare cu Efect de Cascadă</Text>
          </View>
          <Text style={styles.standardsText}>
            MathSentry aplică grila universală din 100 de procente, adaptabilă prin multiplicare scalară la orice barem de concurs:
          </Text>
          <View style={styles.scalesRow}>
            <View style={styles.scaleItem}>
              <Text style={styles.scaleFormula}>ONM (7p)</Text>
              <Text style={styles.scaleSub}>Pct = (Scor% / 100) × 7</Text>
            </View>
            <View style={styles.scaleItem}>
              <Text style={styles.scaleFormula}>Bac/Examen (10p)</Text>
              <Text style={styles.scaleSub}>Nota = 1 + (Scor% / 100) × 9</Text>
            </View>
            <View style={styles.scaleItem}>
              <Text style={styles.scaleFormula}>USAMO (7p)</Text>
              <Text style={styles.scaleSub}>Pct = (Scor% / 100) × 7</Text>
            </View>
          </View>
          <Text style={styles.standardsNotice}>
            ⚠️ Colaps Deductiv: Orice pas nejustificat (ex. înmulțire fără condiție de semn) anulează automat concluzia și pașii subsecvenți (0 puncte).
          </Text>
        </Animated.View>

        {/* 7. Quick Tools Bar */}
        <Animated.View
          entering={FadeInUp.duration(600).delay(450)}
          style={styles.quickToolsRow}
        >
          <Pressable onPress={onOpenTypst} style={styles.quickToolButton}>
            <FileCode size={16} color={C.primary} />
            <Text style={styles.quickToolText}>Generator Typst</Text>
          </Pressable>
          <Pressable onPress={onOpenTheorem} style={styles.quickToolButton}>
            <BookOpen size={16} color={C.primary} />
            <Text style={styles.quickToolText}>Teoreme & Axiome</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  header: {
    backgroundColor: C.slateDeep,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandTitle: {
    fontFamily: F.uiBold,
    fontSize: 18,
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  brandSubtitle: {
    fontFamily: F.mono,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.65)',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  streakText: {
    fontFamily: F.monoMed,
    fontSize: 12,
    color: '#F59E0B',
  },
  avatarButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  welcomeSection: {
    marginBottom: 16,
  },
  welcomeTextColumn: {
    marginBottom: 14,
  },
  greetingTitle: {
    fontFamily: F.uiBold,
    fontSize: 24,
    color: C.slateDeep,
    letterSpacing: -0.5,
  },
  greetingSubtitle: {
    fontFamily: F.ui,
    fontSize: 13,
    color: C.mutedFg,
    lineHeight: 19,
    marginTop: 4,
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontFamily: F.monoMed,
    fontSize: 20,
    color: C.foreground,
  },
  statLabel: {
    fontFamily: F.uiMed,
    fontSize: 10,
    color: C.mutedFg,
    marginTop: 2,
    letterSpacing: 0.4,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: C.borderLight,
  },
  heroCard: {
    backgroundColor: C.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(91, 82, 242, 0.35)',
    marginBottom: 24,
  },
  heroCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  heroIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: C.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: C.indigoSoft,
  },
  heroBadgeText: {
    fontFamily: F.monoMed,
    fontSize: 10,
    color: C.primary,
    letterSpacing: 0.6,
  },
  heroTitle: {
    fontFamily: F.uiBold,
    fontSize: 19,
    color: C.foreground,
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  heroDescription: {
    fontFamily: F.ui,
    fontSize: 13,
    lineHeight: 19,
    color: C.mutedFg,
    marginBottom: 18,
  },
  heroButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryHeroButton: {
    flex: 1.2,
    backgroundColor: C.primary,
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryHeroButtonText: {
    fontFamily: F.uiSemi,
    fontSize: 13,
    color: '#FFFFFF',
  },
  secondaryHeroButton: {
    flex: 1,
    backgroundColor: C.indigoSoft,
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(91, 82, 242, 0.25)',
  },
  secondaryHeroButtonText: {
    fontFamily: F.uiSemi,
    fontSize: 13,
    color: C.primary,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: F.uiBold,
    fontSize: 16,
    color: C.foreground,
  },
  sectionSubtitle: {
    fontFamily: F.ui,
    fontSize: 12,
    color: C.mutedFg,
    marginTop: 2,
  },
  seeAllText: {
    fontFamily: F.uiSemi,
    fontSize: 12,
    color: C.primary,
  },
  historyList: {
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.borderLight,
  },
  historyCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  statusCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyCardTextColumn: {
    flex: 1,
  },
  historyCardTitle: {
    fontFamily: F.uiSemi,
    fontSize: 13,
    color: C.foreground,
  },
  historyCardDate: {
    fontFamily: F.ui,
    fontSize: 11,
    color: C.mutedFg,
    marginTop: 2,
  },
  historyCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scorePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  scorePillText: {
    fontFamily: F.monoMed,
    fontSize: 11,
  },
  gridContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  domainCard: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  domainHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  domainIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  domainBadge: {
    fontFamily: F.mono,
    fontSize: 9,
    color: C.mutedFg,
  },
  domainTitle: {
    fontFamily: F.uiSemi,
    fontSize: 13,
    color: C.foreground,
    marginBottom: 4,
  },
  domainDesc: {
    fontFamily: F.ui,
    fontSize: 11,
    lineHeight: 16,
    color: C.mutedFg,
    marginBottom: 12,
  },
  domainFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  domainActionText: {
    fontFamily: F.uiSemi,
    fontSize: 11,
    color: C.primary,
  },
  standardsCard: {
    backgroundColor: '#FAFCFE',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 16,
  },
  standardsTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  standardsTitle: {
    fontFamily: F.uiSemi,
    fontSize: 13,
    color: C.foreground,
  },
  standardsText: {
    fontFamily: F.ui,
    fontSize: 12,
    lineHeight: 17,
    color: C.mutedFg,
    marginBottom: 12,
  },
  scalesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  scaleItem: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 8,
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
    fontFamily: F.ui,
    fontSize: 9,
    color: C.mutedFg,
    marginTop: 2,
  },
  standardsNotice: {
    fontFamily: F.uiMed,
    fontSize: 11,
    lineHeight: 16,
    color: C.warn,
  },
  quickToolsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  quickToolButton: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  quickToolText: {
    fontFamily: F.uiMed,
    fontSize: 12,
    color: C.foreground,
  },
});
