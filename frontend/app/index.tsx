import React, { useState, useRef } from 'react';
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
import { ScanOverlay } from '@/components/ScanOverlay';
import { showToast } from '@/components/ToastHelper';
import { AuthProvider } from '@/context/AuthContext';
import { api } from '@/services/api';

function MainAnalysisScreen() {
  const insets = useSafeAreaInsets();

  // State model
  const [phase, setPhase] = useState<Phase>('flaw');
  const [fixed, setFixed] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [hintOpen, setHintOpen] = useState(true);
  const [shakeKey, setShakeKey] = useState(0);

  // Scan modal state
  const [scanOpen, setScanOpen] = useState(false);
  // Auth modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // BottomSheetModal references
  const typstSheetRef = useRef<BottomSheetModal>(null);
  const theoremSheetRef = useRef<BottomSheetModal>(null);
  const historySheetRef = useRef<BottomSheetModal>(null);
  const profileSheetRef = useRef<BottomSheetModal>(null);

  // Re-Analyze logic:
  // Evaluates AST logic against backend engine (with local fallback)
  // phase → scanning, after 1200ms:
  // if fixed → phase sound, success haptic, toast "AST Logic Sound ✓";
  // else phase flaw, trigger shake, expand inspector, warning toast "Step 3 still unverified — check the condition on 1 + x."
  const handleReAnalyze = async () => {
    if (phase === 'scanning') return;
    setPhase('scanning');

    try {
      const [backendResult] = await Promise.all([
        api.reAnalyzeProof({ fixedCondition: fixed }).catch(() => null),
        new Promise((resolve) => setTimeout(resolve, 1200)),
      ]);

      const isSound = backendResult ? backendResult.phase === 'sound' : fixed;

      if (isSound) {
        setPhase('sound');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showToast('AST Logic Sound ✓', 'done', 'success');
      } else {
        setPhase('flaw');
        setShakeKey((prev) => prev + 1);
        setInspectorOpen(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        showToast(
          'Step 3 still unverified — check the condition on 1 + x.',
          'error',
          'warning'
        );
      }
    } catch {
      if (fixed) {
        setPhase('sound');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showToast('AST Logic Sound ✓', 'done', 'success');
      } else {
        setPhase('flaw');
        setShakeKey((prev) => prev + 1);
        setInspectorOpen(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        showToast(
          'Step 3 still unverified — check the condition on 1 + x.',
          'error',
          'warning'
        );
      }
    }
  };

  const handleSelectProof = async (id: string) => {
    try {
      showToast('Se încarcă analiza…', 'done');
      const data = await api.getProofById(id);
      if (data) {
        if (data.phase === 'sound') {
          setPhase('sound');
          setFixed(true);
          setInspectorOpen(false);
        } else {
          setPhase('flaw');
          setFixed(false);
          setInspectorOpen(false);
        }
        showToast(
          `Încărcat: ${data.domain || 'Analiză'} (${data.scorePercentage}%)`,
          'done',
          'success'
        );
      }
    } catch {
      showToast('Analiza a fost selectată.', 'done');
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
      {/* 1. Header (dark, includes safe-area top inset) */}
      <Header
        onOpenTypst={() => typstSheetRef.current?.present()}
        onBack={() => {}}
      />

      {/* 2. Pipeline strip */}
      <PipelineStrip phase={phase} />

      {/* 3. ScrollView with Proof card (paddingHorizontal 16, paddingTop 16, paddingBottom 288) */}
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
        />
      </ScrollView>

      {/* 4. Floating Hint Card — absolute, left 12, right 12, bottom 96 + insets.bottom, zIndex 20 */}
      <FloatingHintCard
        phase={phase}
        hintOpen={hintOpen}
        onToggleHint={() => setHintOpen((prev) => !prev)}
        onReAnalyze={handleReAnalyze}
        onOpenTheorem={() => theoremSheetRef.current?.present()}
        onReset={handleReset}
      />

      {/* 5. Bottom Nav — absolute bottom, height 80 + insets.bottom, zIndex 30 */}
      <BottomNav
        onOpenHistory={() => historySheetRef.current?.present()}
        onOpenProfile={() => profileSheetRef.current?.present()}
        onOpenScan={() => setScanOpen(true)}
      />

      {/* 6. Sheets / Scan overlay */}
      <TypstSheet ref={typstSheetRef} />
      <TheoremSheet ref={theoremSheetRef} />
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
        onScanComplete={() => handleReset()}
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
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          <StatusBar style="light" />
          <AuthProvider>
            <MainAnalysisScreen />
          </AuthProvider>
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: C.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: C.slateDeep,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    backgroundColor: C.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 288, // so floating card never covers content
  },
});
