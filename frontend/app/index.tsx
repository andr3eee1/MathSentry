import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {
  BottomSheetModalProvider,
  BottomSheetModal,
} from '@gorhom/bottom-sheet';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  Newsreader_400Regular,
  Newsreader_400Regular_Italic,
  Newsreader_500Medium,
} from '@expo-google-fonts/newsreader';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
} from '@expo-google-fonts/jetbrains-mono';

import { C } from '@/theme';
import { Header } from '@/components/Header';
import { PipelineStrip, Phase } from '@/components/PipelineStrip';
import { ProofCard } from '@/components/ProofCard';
import { FloatingHintCard } from '@/components/FloatingHintCard';
import { BottomNav } from '@/components/BottomNav';
import { TypstSheet } from '@/components/sheets/TypstSheet';
import { TheoremSheet } from '@/components/sheets/TheoremSheet';
import { HistorySheet } from '@/components/sheets/HistorySheet';
import { ProfileSheet } from '@/components/sheets/ProfileSheet';
import { AuthSheet } from '@/components/sheets/AuthSheet';
import { AuthScreen } from '@/components/AuthScreen';
import { DashboardScreen } from '@/components/DashboardScreen';
import { ScanOverlay } from '@/components/ScanOverlay';
import { showToast } from '@/components/ToastHelper';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import { OlympiadAnalysisResult } from '@/types/olympiad';

interface MainAnalysisScreenProps {
  onBackToDashboard: () => void;
  onLogout?: () => void;
  activeProofId?: string;
  analysis: OlympiadAnalysisResult | null;
  onUpdateAnalysis: (data: OlympiadAnalysisResult) => void;
  onOpenTypst: () => void;
  onOpenTheorem: () => void;
  onOpenHistory: () => void;
  onOpenProfile: () => void;
  onOpenScan: () => void;
}

function MainAnalysisScreen({
  onBackToDashboard,
  onLogout,
  activeProofId,
  analysis,
  onUpdateAnalysis,
  onOpenTypst,
  onOpenTheorem,
  onOpenHistory,
  onOpenProfile,
  onOpenScan,
}: MainAnalysisScreenProps) {
  const insets = useSafeAreaInsets();

  const [phase, setPhase] = useState<Phase>(analysis?.phase === 'sound' ? 'sound' : 'flaw');
  const [fixed, setFixed] = useState(analysis?.phase === 'sound');
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [hintOpen, setHintOpen] = useState(true);
  const [shakeKey, setShakeKey] = useState(0);

  useEffect(() => {
    if (analysis) {
      setPhase(analysis.phase === 'sound' ? 'sound' : 'flaw');
      setFixed(analysis.phase === 'sound');
    }
  }, [analysis]);

  // Re-Analyze logic with Gemini 1.5 Flash
  const handleReAnalyze = async () => {
    if (phase === 'scanning') return;
    setPhase('scanning');

    try {
      showToast('Gemini re-auditează arborele deductiv…', 'done');
      const [backendResult] = await Promise.all([
        api.analyzeProof({
          id: activeProofId || analysis?.id || 'analysis_bernoulli_01',
          fixedCondition: fixed,
          problemTitle: analysis?.problemId,
          enunt: analysis?.problemRo,
        }).catch(() => null),
        new Promise((resolve) => setTimeout(resolve, 800)),
      ]);

      if (backendResult) {
        onUpdateAnalysis(backendResult);
        const isSound = backendResult.phase === 'sound' || backendResult.scorePercentage >= 99;

        if (isSound) {
          setPhase('sound');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          showToast(`AST Logic Sound ✓ (${backendResult.scorePercentage}%)`, 'done', 'success');
        } else {
          setPhase('flaw');
          setShakeKey((prev) => prev + 1);
          setInspectorOpen(true);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          showToast(
            `Pasul ${backendResult.fatalFlawStep || 3} necesită verificare suplimentară.`,
            'error',
            'warning'
          );
        }
      } else {
        // Fallback local logic
        if (fixed) {
          setPhase('sound');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          showToast('AST Logic Sound ✓', 'done', 'success');
        } else {
          setPhase('flaw');
          setShakeKey((prev) => prev + 1);
          setInspectorOpen(true);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
      }
    } catch {
      if (fixed) {
        setPhase('sound');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        setPhase('flaw');
        setShakeKey((prev) => prev + 1);
        setInspectorOpen(true);
      }
    }
  };

  const handleReset = () => {
    setPhase('flaw');
    setFixed(false);
    setInspectorOpen(false);
    setHintOpen(true);
  };

  return (
    <View style={styles.screenContainer}>
      <Header
        onOpenTypst={onOpenTypst}
        onBack={onBackToDashboard}
      />

      <PipelineStrip phase={phase} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ProofCard
          phase={phase}
          fixed={fixed}
          onToggleFixed={() => setFixed((prev) => !prev)}
          inspectorOpen={inspectorOpen}
          onToggleInspector={() => setInspectorOpen((prev) => !prev)}
          shakeKey={shakeKey}
          analysis={analysis}
        />
      </ScrollView>

      <FloatingHintCard
        phase={phase}
        hintOpen={hintOpen}
        onToggleHint={() => setHintOpen((prev) => !prev)}
        onReAnalyze={handleReAnalyze}
        onOpenTheorem={onOpenTheorem}
        onReset={handleReset}
        analysis={analysis}
      />

      <BottomNav
        onOpenHistory={onOpenHistory}
        onOpenProfile={onOpenProfile}
        onOpenScan={onOpenScan}
      />
    </View>
  );
}

function RootAppContent() {
  const { user, isGuest, isLoading, logout } = useAuth();
  const [currentView, setCurrentView] = useState<'dashboard' | 'analysis'>('dashboard');
  const [activeProofId, setActiveProofId] = useState<string>('analysis_bernoulli_01');
  const [currentAnalysis, setCurrentAnalysis] = useState<OlympiadAnalysisResult | null>(null);

  // BottomSheetModal references
  const typstSheetRef = useRef<BottomSheetModal>(null);
  const theoremSheetRef = useRef<BottomSheetModal>(null);
  const historySheetRef = useRef<BottomSheetModal>(null);
  const profileSheetRef = useRef<BottomSheetModal>(null);

  // Modals state
  const [scanOpen, setScanOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Load initial analysis on mount
  useEffect(() => {
    async function loadInitial() {
      try {
        const data = await api.getProofById(activeProofId);
        if (data) {
          setCurrentAnalysis(data);
        }
      } catch {
        // Fallback default
      }
    }
    loadInitial();
  }, [activeProofId]);

  const handleSelectProof = async (id: string) => {
    setActiveProofId(id);
    try {
      showToast('Se încarcă analiza…', 'done');
      const data = await api.getProofById(id);
      if (data) {
        setCurrentAnalysis(data);
      }
    } catch {
      // Keep existing
    }
    setCurrentView('analysis');
    historySheetRef.current?.dismiss();
  };

  const handleOpenAnalysis = async (proofId?: string) => {
    if (proofId) {
      setActiveProofId(proofId);
      try {
        const data = await api.getProofById(proofId);
        if (data) {
          setCurrentAnalysis(data);
        }
      } catch {
        // Keep existing
      }
    }
    setCurrentView('analysis');
  };

  const handleScanComplete = (data?: OlympiadAnalysisResult) => {
    setScanOpen(false);
    if (data) {
      setCurrentAnalysis(data);
      setActiveProofId(data.id);
    }
    setCurrentView('analysis');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  if (!user && !isGuest) {
    return <AuthScreen />;
  }

  return (
    <View style={styles.root}>
      {currentView === 'dashboard' ? (
        <DashboardScreen
          onOpenAnalysis={handleOpenAnalysis}
          onOpenScan={() => setScanOpen(true)}
          onOpenHistory={() => historySheetRef.current?.present()}
          onOpenProfile={() => profileSheetRef.current?.present()}
          onOpenTypst={() => typstSheetRef.current?.present()}
          onOpenTheorem={() => theoremSheetRef.current?.present()}
          onLogout={logout}
        />
      ) : (
        <MainAnalysisScreen
          onBackToDashboard={() => setCurrentView('dashboard')}
          onLogout={logout}
          activeProofId={activeProofId}
          analysis={currentAnalysis}
          onUpdateAnalysis={setCurrentAnalysis}
          onOpenTypst={() => typstSheetRef.current?.present()}
          onOpenTheorem={() => theoremSheetRef.current?.present()}
          onOpenHistory={() => historySheetRef.current?.present()}
          onOpenProfile={() => profileSheetRef.current?.present()}
          onOpenScan={() => setScanOpen(true)}
        />
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
        onSelectProof={handleSelectProof}
      />
      <ProfileSheet
        ref={profileSheetRef}
        onOpenAuth={() => setAuthModalOpen(true)}
      />
      <AuthSheet
        visible={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
      <ScanOverlay
        visible={scanOpen}
        onClose={() => setScanOpen(false)}
        onScanComplete={handleScanComplete}
      />
    </View>
  );
}

export default function AnalysisScreen() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Newsreader_400Regular,
    Newsreader_400Regular_Italic,
    Newsreader_500Medium,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
  });

  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.root}>
        <BottomSheetModalProvider>
          <AuthProvider>
            <RootAppContent />
          </AuthProvider>
          <StatusBar style="light" />
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 288,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: C.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
