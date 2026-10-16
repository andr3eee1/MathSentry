import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  LayoutChangeEvent,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  X,
  Camera,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from 'lucide-react-native';
import { C, F, indigoShadow, SPRING_CONFIG } from '@/theme';
import { showToast } from '@/components/ToastHelper';
import { api } from '@/services/api';
import { OlympiadAnalysisResult } from '@/types/olympiad';

interface ScanOverlayProps {
  visible: boolean;
  onClose: () => void;
  onScanComplete?: (data?: OlympiadAnalysisResult) => void;
}

const PRESET_PROBLEMS = [
  {
    id: 'bernoulli',
    title: 'Inegalitatea lui Bernoulli și Condiția Critică de Semn',
    enunt: 'Fie x ∈ ℝ cu x > -1 și n ∈ ℕ*. Să se demonstreze prin inducție matematică inegalitatea: (1 + x)ⁿ ≥ 1 + nx.',
    flawedText: `Pasul 1 (Cazul de bază): Pentru n = 1, avem (1 + x)¹ = 1 + 1·x, deci egalitatea are loc.
Pasul 2 (Ipoteza de inducție): Presupunem că (1 + x)^k ≥ 1 + kx este adevărată pentru k ≥ 1.
Pasul 3 (Pasul inductiv): Înmulțim ambii membri ai ipotezei cu (1 + x):
(1 + x)^(k+1) ≥ (1 + kx)(1 + x) = 1 + (k+1)x + kx² ≥ 1 + (k+1)x.
Pasul 4 (Concluzie): Conform principiului inducției matematice, inegalitatea este demonstrată pentru orice n ∈ ℕ*.`,
    soundText: `Pasul 1 (Cazul de bază): Pentru n = 1, avem (1 + x)¹ = 1 + 1·x, evident adevărat pentru orice x.
Pasul 2 (Ipoteza de inducție): Presupunem că (1 + x)^k ≥ 1 + kx este adevărată pentru k ≥ 1 fixat.
Pasul 3 (Pasul inductiv cu verificare semn): Din ipoteză știm că x > -1, ceea ce este echivalent cu 1 + x > 0.
Fiind strict pozitiv, înmulțirea ambilor membri ai inegalității P(k) cu (1 + x) conservă sensul:
(1 + x)^(k+1) ≥ (1 + kx)(1 + x) = 1 + (k+1)x + kx² ≥ 1 + (k+1)x (deoarece kx² ≥ 0).
Pasul 4 (Concluzie): Inducția matematică este riguros încheiată. Q.E.D.`,
  },
  {
    id: 'cauchy',
    title: 'Inegalitatea lui Cauchy-Schwarz (Barem ONM)',
    enunt: 'Fie a1..an și b1..bn numere reale. Demonstrați că (sum ai²)(sum bi²) ≥ (sum ai bi)²',
    flawedText: `Pasul 1: Construim funcția f(t) = sum (ai·t + bi)².
Pasul 2: Deoarece este o sumă de pătrate, f(t) ≥ 0 pentru orice t real.
Pasul 3: Dezvoltăm f(t) = (sum ai²) t² + 2(sum ai bi) t + (sum bi²).
Pasul 4: Deoarece f(t) ≥ 0, discriminantul trinomului este strict negativ Delta < 0.
Deci 4(sum ai bi)² - 4(sum ai²)(sum bi²) < 0, de unde rezultă inegalitatea strictă.`,
    soundText: `Pasul 1: Considerăm trinomul f(t) = sum (ai·t + bi)² = A t² + 2B t + C, unde A = sum ai², B = sum ai bi, C = sum bi².
Pasul 2: Fiind o sumă de pătrate reale, f(t) ≥ 0 pentru orice t ∈ ℝ.
Pasul 3: Cazul 1: Dacă A = 0, atunci ai = 0 pentru toți i, deci B = 0 și inegalitatea devine 0 ≥ 0 (trivial adevărată).
Pasul 4: Cazul 2: Dacă A > 0, f este o funcție de gradul 2 cu coeficient dominant pozitiv.
Condiția f(t) ≥ 0 pentru orice t implică discriminantul redus Delta' = B² - AC ≤ 0.
Pasul 5: Rezultă direct B² ≤ AC, adică (sum ai bi)² ≤ (sum ai²)(sum bi²). Egalitatea are loc dacă și numai dacă vectorii sunt proporționali.`,
  },
  {
    id: 'poly',
    title: 'Rădăcini Întregi pentru Polinoame cu Valori Impare',
    enunt: 'Fie P(X) un polinom cu coeficienți întregi astfel încât P(0) și P(1) sunt numere impare. Demonstrați că P nu are rădăcini întregi.',
    flawedText: `Pasul 1: Presupunem prin reducere la absurd că există a ∈ ℤ cu P(a) = 0.
Pasul 2: P(X) = (X - a) Q(X) cu Q(X) polinom cu coeficienți întregi.
Pasul 3: Înlocuim X = 0: P(0) = -a Q(0). Deoarece P(0) e impar, rezultă că a trebuie să fie număr impar.
Pasul 4: Concluzie: Polinomul nu poate avea rădăcini pare, deci nu are rădăcini.`,
    soundText: `Pasul 1: Presupunem prin absurd că există a ∈ ℤ astfel încât P(a) = 0.
Pasul 2: Pentru orice x, y întregi, avem proprietatea clasică de divizibilitate: (x - y) divide (P(x) - P(y)).
Pasul 3: Aplicăm pentru x = a și y = 0: (a - 0) | (P(a) - P(0)) => a | (0 - P(0)) => a | P(0).
Cum P(0) este impar, rezultă că a este obligatoriu număr impar.
Pasul 4: Aplicăm acum pentru x = a și y = 1: (a - 1) | (P(a) - P(1)) => (a - 1) | -P(1).
Cum P(1) este impar, rezultă că a - 1 este impar, ceea ce implică a este număr par.
Pasul 5: Am obținut că a este simultan impar și par, contradicție! Presupunerea a fost falsă, P nu are rădăcini întregi.`,
  },
];

export const ScanOverlay: React.FC<ScanOverlayProps> = ({
  visible,
  onClose,
  onScanComplete,
}) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'text' | 'camera'>('text');
  const [selectedProblem, setSelectedProblem] = useState(PRESET_PROBLEMS[0]);
  const [proofInput, setProofInput] = useState(PRESET_PROBLEMS[0].flawedText);
  const [customTitle, setCustomTitle] = useState(PRESET_PROBLEMS[0].title);
  const [isAuditing, setIsAuditing] = useState(false);
  const [viewfinderHeight, setViewfinderHeight] = useState<number>(360);

  const scale = useSharedValue(1.05);
  const opacity = useSharedValue(0);
  const scanProgress = useSharedValue(0.08);

  useEffect(() => {
    if (visible) {
      scale.value = 1.05;
      opacity.value = 0;
      scale.value = withSpring(1, SPRING_CONFIG);
      opacity.value = withSpring(1, SPRING_CONFIG);

      scanProgress.value = 0.08;
      scanProgress.value = withRepeat(
        withSequence(
          withTiming(0.92, {
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(0.08, {
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
          })
        ),
        -1,
        false
      );
    } else {
      scale.value = 1.05;
      opacity.value = 0;
    }
  }, [visible]);

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const scanLineAnimatedStyle = useAnimatedStyle(() => ({
    top: scanProgress.value * viewfinderHeight,
  }));

  const handleSelectPreset = (p: typeof PRESET_PROBLEMS[0]) => {
    setSelectedProblem(p);
    setCustomTitle(p.title);
    setProofInput(p.flawedText);
  };

  const handleRunAudit = async () => {
    if (!proofInput.trim()) {
      showToast('Introdu pașii demonstrației pentru audit.', 'error');
      return;
    }

    setIsAuditing(true);
    showToast('Gemini auditează pașii deductivi (Barem ONM)…', 'done');

    try {
      const res = await api.analyzeProof({
        proofText: proofInput,
        problemTitle: customTitle,
        enunt: selectedProblem.enunt,
      });

      if (res) {
        showToast(
          `Evaluat: ${res.phase === 'sound' ? 'Sound 100%' : 'Fractură logică'} (${res.scorePercentage}%)`,
          'done',
          res.phase === 'sound' ? 'success' : 'warning'
        );
        onScanComplete?.(res);
        onClose();
      }
    } catch (err: any) {
      showToast(err?.message || 'Eroare la auditul demonstrației.', 'error');
    } finally {
      setIsAuditing(false);
    }
  };

  const handleCameraShutter = async () => {
    setIsAuditing(true);
    showToast('Scanează foaia — Gemini Vision auditează scrisul de mână…', 'done');

    try {
      // Simulate/trigger camera scan with the active problem context
      const res = await api.analyzeProof({
        problemTitle: customTitle,
        enunt: selectedProblem.enunt,
        proofText: proofInput,
      });

      if (res) {
        showToast('Foaie recunoscută & auditată cu succes!', 'done', 'success');
        onScanComplete?.(res);
        onClose();
      }
    } catch {
      onScanComplete?.(undefined);
      onClose();
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        style={[
          styles.container,
          {
            paddingTop: insets.top + 12,
            paddingBottom: insets.bottom + 12,
          },
          overlayAnimatedStyle,
        ]}
      >
        {/* Top Header Row */}
        <View style={styles.topRow}>
          <View>
            <Text style={styles.headerTitle}>Auditor Matematic Olimpic</Text>
            <Text style={styles.headerSubtitle}>Validare formală AST prin Gemini Flash AI</Text>
          </View>
          <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
            <X size={20} color="#FFFFFF" strokeWidth={2} />
          </Pressable>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabSelector}>
          <Pressable
            onPress={() => setActiveTab('text')}
            style={[styles.tabButton, activeTab === 'text' && styles.tabButtonActive]}
          >
            <FileText size={15} color={activeTab === 'text' ? '#FFFFFF' : C.mutedFg} />
            <Text style={[styles.tabButtonText, activeTab === 'text' && styles.tabButtonTextActive]}>
              Tastează / Concurs
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('camera')}
            style={[styles.tabButton, activeTab === 'camera' && styles.tabButtonActive]}
          >
            <Camera size={15} color={activeTab === 'camera' ? '#FFFFFF' : C.mutedFg} />
            <Text style={[styles.tabButtonText, activeTab === 'camera' && styles.tabButtonTextActive]}>
              Scanează Foaie (OCR)
            </Text>
          </Pressable>
        </View>

        {activeTab === 'text' ? (
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Preset Selector */}
            <Text style={styles.sectionLabel}>SELECTEAZĂ PROBLEMĂ DE CONCURS:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetsRow}>
              {PRESET_PROBLEMS.map((p) => {
                const isSelected = selectedProblem.id === p.id;
                return (
                  <Pressable
                    key={p.id}
                    onPress={() => handleSelectPreset(p)}
                    style={[styles.presetCard, isSelected && styles.presetCardSelected]}
                  >
                    <Text style={[styles.presetCardTitle, isSelected && styles.presetCardTitleSelected]} numberOfLines={1}>
                      {p.id.toUpperCase()}
                    </Text>
                    <Text style={styles.presetCardSubtitle} numberOfLines={1}>
                      {p.title}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Quick Fill Buttons */}
            <View style={styles.quickFillRow}>
              <Pressable
                onPress={() => setProofInput(selectedProblem.flawedText)}
                style={styles.quickFillFlaw}
              >
                <AlertTriangle size={12} color={C.flaw} />
                <Text style={styles.quickFillFlawText}>Încarcă soluție cu fractură logică</Text>
              </Pressable>
              <Pressable
                onPress={() => setProofInput(selectedProblem.soundText)}
                style={styles.quickFillSound}
              >
                <CheckCircle2 size={12} color={C.success} />
                <Text style={styles.quickFillSoundText}>Încarcă soluție corectă (100%)</Text>
              </Pressable>
            </View>

            {/* Proof Text Input */}
            <Text style={styles.sectionLabel}>DEMONSTRAȚIA DE AUDITAT:</Text>
            <TextInput
              style={styles.textInputArea}
              value={proofInput}
              onChangeText={setProofInput}
              multiline
              placeholder="Scrie sau lipește pașii demonstrației aici..."
              placeholderTextColor={C.mutedFg}
              textAlignVertical="top"
            />

            {/* Submit Action */}
            <Pressable
              onPress={handleRunAudit}
              disabled={isAuditing}
              style={[styles.auditButton, isAuditing && { opacity: 0.7 }]}
            >
              {isAuditing ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.auditButtonText}>Gemini Flash construiește arborele AST…</Text>
                </View>
              ) : (
                <View style={styles.loadingRow}>
                  <Sparkles size={16} color="#FFFFFF" />
                  <Text style={styles.auditButtonText}>Auditează cu Gemini Flash AI</Text>
                </View>
              )}
            </Pressable>
          </ScrollView>
        ) : (
          <View style={styles.cameraContainer}>
            {/* Viewfinder */}
            <View
              style={styles.viewfinder}
              onLayout={(e: LayoutChangeEvent) =>
                setViewfinderHeight(e.nativeEvent.layout.height)
              }
            >
              <View style={styles.cornerTL} />
              <View style={styles.cornerTR} />
              <View style={styles.cornerBL} />
              <View style={styles.cornerBR} />

              <Animated.View
                style={[styles.scanLine, indigoShadow, scanLineAnimatedStyle]}
              />
            </View>

            <Text style={styles.caption}>
              Încadrează pagina scrisă de mână. Gemini Vision extrage simbolurile și verifică pașii.
            </Text>

            {/* Shutter Button */}
            <View style={styles.shutterContainer}>
              <Pressable
                onPress={handleCameraShutter}
                disabled={isAuditing}
                style={({ pressed }) => [
                  styles.shutterButton,
                  pressed && { transform: [{ scale: 0.95 }] },
                ]}
              >
                {isAuditing ? (
                  <ActivityIndicator size="small" color={C.primary} />
                ) : (
                  <View style={styles.shutterInner} />
                )}
              </Pressable>
            </View>
          </View>
        )}
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16',
    paddingHorizontal: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: F.mono,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: F.ui,
    color: C.mutedFg,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: '#131B2E',
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: C.primary,
  },
  tabButtonText: {
    fontSize: 12.5,
    fontFamily: F.mono,
    color: C.mutedFg,
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: F.mono,
    color: C.mutedFg,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  presetsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  presetCard: {
    backgroundColor: '#131B2E',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    maxWidth: 180,
  },
  presetCardSelected: {
    borderColor: C.primary,
    backgroundColor: 'rgba(91,82,242,0.15)',
  },
  presetCardTitle: {
    fontSize: 11,
    fontFamily: F.mono,
    color: C.mutedFg,
    fontWeight: '700',
  },
  presetCardTitleSelected: {
    color: C.primary,
  },
  presetCardSubtitle: {
    fontSize: 11,
    fontFamily: F.ui,
    color: '#94A3B8',
    marginTop: 2,
  },
  quickFillRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  quickFillFlaw: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  quickFillFlawText: {
    fontSize: 10.5,
    fontFamily: F.ui,
    color: C.flaw,
    fontWeight: '600',
  },
  quickFillSound: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(16,185,129,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  quickFillSoundText: {
    fontSize: 10.5,
    fontFamily: F.ui,
    color: C.success,
    fontWeight: '600',
  },
  textInputArea: {
    backgroundColor: '#131B2E',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    color: '#F8FAFC',
    fontSize: 13,
    fontFamily: F.mono,
    minHeight: 180,
    lineHeight: 20,
    marginBottom: 16,
  },
  auditButton: {
    backgroundColor: C.primary,
    borderRadius: 10,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  auditButtonText: {
    color: '#FFFFFF',
    fontFamily: F.mono,
    fontSize: 13.5,
    fontWeight: '700',
  },
  cameraContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewfinder: {
    width: '100%',
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    position: 'relative',
    overflow: 'hidden',
  },
  cornerTL: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 28,
    height: 28,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: C.primary,
  },
  cornerTR: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: C.primary,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    width: 28,
    height: 28,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: C.primary,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 28,
    height: 28,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: C.primary,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: C.primary,
  },
  caption: {
    color: C.mutedFg,
    fontSize: 12,
    fontFamily: F.ui,
    textAlign: 'center',
    marginVertical: 14,
  },
  shutterContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  shutterButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  shutterInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
  },
});
