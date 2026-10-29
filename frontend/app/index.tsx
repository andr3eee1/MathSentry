import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as Haptics from '@/components/Haptics';

import { C, F } from '@/theme';
import { BookOpen, RefreshCw, Loader2, Info } from 'lucide-react-native';
import { Header } from '@/components/Header';
import { PipelineStrip, Phase } from '@/components/PipelineStrip';
import { ProofCard } from '@/components/ProofCard';
import { TypstSheet } from '@/components/sheets/TypstSheet';
import { TheoremSheet } from '@/components/sheets/TheoremSheet';
import { HistorySheet } from '@/components/sheets/HistorySheet';
import { ProfileSheet } from '@/components/sheets/ProfileSheet';
import { AuthSheet } from '@/components/sheets/AuthSheet';
import { ProSheet } from '@/components/sheets/ProSheet';
import { AuthScreen } from '@/components/AuthScreen';
import { DashboardScreen } from '@/components/DashboardScreen';
import { BottomNav } from '@/components/BottomNav';
import { ScanOverlay } from '@/components/ScanOverlay';
import { showToast } from '@/components/ToastHelper';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import {
  OlympiadAnalysisResult,
  UserProblem,
  isOfflineDemoResult,
} from '@/types/olympiad';

interface MainAnalysisScreenProps {
  onBackToDashboard: () => void;
  analysis: OlympiadAnalysisResult;
  onUpdateAnalysis: (data: OlympiadAnalysisResult) => void;
  onOpenTypst: () => void;
  onOpenTheorem: () => void;
  onAuditFinished: () => void;
  onRequestSignup: () => void;
}

/** Combines the student's original proof with their rewrite of the broken step. */
function buildCorrectedProof(analysis: OlympiadAnalysisResult, correction: string): string {
  const step = analysis.fatalFlawStep;
  if (!analysis.proofText) return correction;
  return `${analysis.proofText}

Corectura elevului pentru Pasul ${step ?? '?'} (înlocuiește redactarea inițială a acestui pas):
${correction}`;
}

function MainAnalysisScreen({
  onBackToDashboard,
  analysis,
  onUpdateAnalysis,
  onOpenTypst,
  onOpenTheorem,
  onAuditFinished,
  onRequestSignup,
}: MainAnalysisScreenProps) {
  const insets = useSafeAreaInsets();

  const [phase, setPhase] = useState<Phase>(analysis.phase === 'sound' ? 'sound' : 'flaw');
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [shakeKey, setShakeKey] = useState(0);
  const [customStepText, setCustomStepText] = useState('');

  useEffect(() => {
    setPhase(analysis.phase === 'sound' ? 'sound' : 'flaw');
    setCustomStepText('');
  }, [analysis]);

  const correction = customStepText.trim();
  const canReAudit = phase !== 'scanning' && phase !== 'sound' && correction.length > 0;

  const handleReAnalyze = async () => {
    if (!canReAudit) {
      if (phase === 'flaw') {
        setInspectorOpen(true);
        showToast('Rescrie mai întâi pasul marcat cu roșu.', 'none');
      }
      return;
    }
    const previousPhase = phase;
    setPhase('scanning');

    try {
      const result = await api.analyzeProof({
        id: analysis.isExample ? undefined : analysis.id,
        proofText: buildCorrectedProof(analysis, correction),
        problemTitle: analysis.problemTitle,
        enunt: analysis.problemRo,
      });
      onUpdateAnalysis(result);
      onAuditFinished();

      if (result.phase === 'sound') {
        setPhase('sound');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showToast(`Demonstrație validată: ${result.scaledScores.onm7p.score.toFixed(2)} / 7p`, 'done', 'success');
      } else {
        setPhase('flaw');
        setShakeKey((prev) => prev + 1);
        setInspectorOpen(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        showToast(
          result.fatalFlawStep
            ? `Pasul ${result.fatalFlawStep} încă necesită justificare.`
            : 'Demonstrația încă are probleme.',
          'error',
          'warning'
        );
      }
    } catch (err: any) {
      setPhase(previousPhase);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast(err?.message || 'Re-auditarea a eșuat. Încearcă din nou.', 'error');
      if (err?.code === 'QUOTA_EXCEEDED') onRequestSignup();
    }
  };

  const onmScore = analysis.scaledScores?.onm7p?.score;

  return (
    <View style={styles.screenContainer}>
      <Header onOpenTypst={onOpenTypst} onBack={onBackToDashboard} />

      <PipelineStrip phase={phase} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {isOfflineDemoResult(analysis) && (
          <View style={[styles.notice, styles.noticeWarn]}>
            <Info size={14} color={C.warn} strokeWidth={2} />
            <Text style={[styles.noticeText, { color: C.warn }]}>
              Rezultat demonstrativ: motorul AI nu este configurat pe server
              (GEMINI_API_KEY), deci acest punctaj nu evaluează demonstrația ta.
            </Text>
          </View>
        )}
        {analysis.isExample && (
          <View style={styles.notice}>
            <Info size={14} color={C.primary} strokeWidth={2} />
            <Text style={styles.noticeText}>
              Exemplu rezolvat. Corectează pasul greșit și re-auditează: rezultatul
              se salvează în contul tău.
            </Text>
          </View>
        )}

        <ProofCard
          phase={phase}
          inspectorOpen={inspectorOpen}
          onToggleInspector={() => setInspectorOpen((prev) => !prev)}
          shakeKey={shakeKey}
          analysis={analysis}
          onOpenTypst={onOpenTypst}
          onOpenTheorem={onOpenTheorem}
          customStepText={customStepText}
          onChangeCustomStepText={setCustomStepText}
        />
      </ScrollView>

      {/* Authoritative Archival Sticky Bottom Bar */}
      <View style={[styles.stickyBottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.stickyScoreCol}>
          <Text style={styles.stickyScoreLabel}>PUNCTAJ ONM</Text>
          <Text style={[styles.stickyScoreValue, { color: phase === 'sound' ? C.success : C.flaw }]}>
            {onmScore != null ? onmScore.toFixed(2) : '—'} / 7.00p
          </Text>
        </View>

        <View style={styles.stickyActionsRow}>
          <Pressable
            onPress={onOpenTheorem}
            accessibilityLabel="Breviar de teoreme"
            style={({ pressed }) => [
              styles.stickyIconBtn,
              pressed && { backgroundColor: C.muted },
            ]}
          >
            <BookOpen size={15} color={C.primary} strokeWidth={2} />
          </Pressable>

          {phase !== 'sound' && (
            <Pressable
              onPress={handleReAnalyze}
              disabled={phase === 'scanning'}
              style={({ pressed }) => [
                styles.stickyReAnalyzeBtn,
                pressed && { opacity: 0.85 },
                !canReAudit && { opacity: 0.55 },
              ]}
            >
              {phase === 'scanning' ? (
                <Loader2 size={14} color={C.primaryFg} />
              ) : (
                <RefreshCw size={14} color={C.primaryFg} strokeWidth={2} />
              )}
              <Text style={styles.stickyReAnalyzeText}>
                {phase === 'scanning' ? 'Se auditează…' : 'Re-Auditează'}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

function RootAppContent() {
  const { user, isLoading, isGuest, refreshStats } = useAuth();
  const [currentView, setCurrentView] = useState<'dashboard' | 'analysis'>('dashboard');
  const [currentAnalysis, setCurrentAnalysis] = useState<OlympiadAnalysisResult | null>(null);
  const [openingId, setOpeningId] = useState<string | null>(null);

  // BottomSheetModal references
  const typstSheetRef = useRef<BottomSheetModal>(null);
  const theoremSheetRef = useRef<BottomSheetModal>(null);
  const historySheetRef = useRef<BottomSheetModal>(null);
  const profileSheetRef = useRef<BottomSheetModal>(null);

  // Modals state
  const [scanOpen, setScanOpen] = useState(false);
  const [scanMode, setScanMode] = useState<'solution' | 'problem'>('solution');
  const [scanInput, setScanInput] = useState<'camera' | 'text'>('camera');
  const [targetProblem, setTargetProblem] = useState<UserProblem | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [proOpen, setProOpen] = useState(false);

  const handleRequireAccountForPro = () => {
    setProOpen(false);
    // Let the Pro modal finish dismissing before presenting the next one (iOS)
    setTimeout(() => setAuthModalOpen(true), 350);
  };

  // Guests are asked to sign up; signed-in free users are offered Pro
  const handleQuotaExceeded = () => {
    if (isGuest) setAuthModalOpen(true);
    else setProOpen(true);
  };

  // Never carry one account's open analysis over to the next account
  useEffect(() => {
    setCurrentAnalysis(null);
    setCurrentView('dashboard');
  }, [user?.id]);

  const handleOpenAnalysis = async (proofId: string) => {
    if (openingId) return;
    setOpeningId(proofId);
    try {
      const data = await api.getProofById(proofId);
      setCurrentAnalysis(data);
      setCurrentView('analysis');
      historySheetRef.current?.dismiss();
    } catch (err: any) {
      showToast(err?.message || 'Nu am putut deschide analiza.', 'error');
    } finally {
      setOpeningId(null);
    }
  };

  const handleOpenScan = (
    mode: 'solution' | 'problem' = 'solution',
    problem: UserProblem | null = null,
    input: 'camera' | 'text' = 'camera'
  ) => {
    setScanMode(mode);
    setTargetProblem(problem);
    setScanInput(input);
    setScanOpen(true);
  };

  const handleAuditFinished = () => {
    setRefreshTrigger((prev) => prev + 1);
    refreshStats();
  };

  const handleProblemCreated = (newProblem: UserProblem) => {
    setRefreshTrigger((prev) => prev + 1);
    showToast(`Problema „${newProblem.title}” a fost salvată.`, 'done', 'success');
  };

  const handleScanComplete = (data: OlympiadAnalysisResult) => {
    setScanOpen(false);
    handleAuditFinished();
    setCurrentAnalysis(data);
    setCurrentView('analysis');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <View style={styles.root}>
      {currentView === 'analysis' && currentAnalysis ? (
        <MainAnalysisScreen
          onBackToDashboard={() => setCurrentView('dashboard')}
          analysis={currentAnalysis}
          onUpdateAnalysis={setCurrentAnalysis}
          onOpenTypst={() => typstSheetRef.current?.present()}
          onOpenTheorem={() => theoremSheetRef.current?.present()}
          onAuditFinished={handleAuditFinished}
          onRequestSignup={handleQuotaExceeded}
        />
      ) : (
        <>
          <DashboardScreen
            onOpenAnalysis={handleOpenAnalysis}
            openingId={openingId}
            onOpenScan={handleOpenScan}
            onOpenHistory={() => historySheetRef.current?.present()}
            onOpenProfile={() => profileSheetRef.current?.present()}
            onOpenAuth={() => setAuthModalOpen(true)}
            onOpenPro={() => setProOpen(true)}
            refreshTrigger={refreshTrigger}
          />
          <BottomNav
            onOpenHistory={() => historySheetRef.current?.present()}
            onOpenProfile={() => profileSheetRef.current?.present()}
            onOpenScan={() => handleOpenScan('solution')}
          />
        </>
      )}

      {/* Shared Sheets & Overlays */}
      <TypstSheet
        ref={typstSheetRef}
        typstSource={currentAnalysis?.typstSource}
      />
      <TheoremSheet
        ref={theoremSheetRef}
        theorems={currentAnalysis?.relevantTheorems}
      />
      <HistorySheet
        ref={historySheetRef}
        onSelectProof={handleOpenAnalysis}
        refreshTrigger={refreshTrigger}
      />
      <ProfileSheet
        ref={profileSheetRef}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenPro={() => {
          if (isGuest) {
            showToast('Creează un cont gratuit, apoi treci la Pro.', 'none');
            setAuthModalOpen(true);
          } else {
            setProOpen(true);
          }
        }}
      />
      <ProSheet
        visible={proOpen}
        onClose={() => setProOpen(false)}
        onRequireAccount={handleRequireAccountForPro}
      />
      <AuthSheet
        visible={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
      <ScanOverlay
        visible={scanOpen}
        onClose={() => setScanOpen(false)}
        mode={scanMode}
        initialInput={scanInput}
        targetProblem={targetProblem}
        onScanComplete={handleScanComplete}
        onProblemCreated={handleProblemCreated}
        onQuotaExceeded={handleQuotaExceeded}
      />
    </View>
  );
}

// Providers, fonts and the toaster live in app/_layout.tsx
export default function AnalysisScreen() {
  return <RootAppContent />;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.background,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: C.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 28,
  },
  stickyBottomBar: {
    backgroundColor: C.card,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingHorizontal: 16,
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stickyScoreCol: {
    flexDirection: 'column',
  },
  stickyScoreLabel: {
    fontFamily: F.mono,
    fontSize: 9.5,
    color: C.mutedFg,
    letterSpacing: 0.6,
  },
  stickyScoreValue: {
    fontFamily: F.monoMed,
    fontSize: 15,
    marginTop: 1,
  },
  stickyActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stickyIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 6,
    backgroundColor: C.background,
    borderWidth: 1,
    borderColor: C.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stickyReAnalyzeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: C.slateDeep,
    borderRadius: 6,
    paddingHorizontal: 15,
    height: 38,
  },
  stickyReAnalyzeText: {
    fontFamily: F.uiSemi,
    fontSize: 12.5,
    color: C.primaryFg,
  },
  notice: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    backgroundColor: C.indigoSoft,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
  noticeWarn: {
    backgroundColor: C.warnSoft,
  },
  noticeText: {
    flex: 1,
    fontFamily: F.ui,
    fontSize: 12,
    lineHeight: 17,
    color: C.primary,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: C.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
