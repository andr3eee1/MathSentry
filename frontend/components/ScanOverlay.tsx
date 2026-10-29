import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Image,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from '@/components/Haptics';
import {
  X,
  Camera,
  RotateCcw,
  Zap,
  RefreshCw,
  FileText,
  Scale,
  Plus,
  Image as ImageIcon,
} from 'lucide-react-native';
import { C, F, SPRING_CONFIG } from '@/theme';
import { MathText } from '@/components/MathText';
import { showToast } from '@/components/ToastHelper';
import { api } from '@/services/api';
import { OlympiadAnalysisResult, UserProblem } from '@/types/olympiad';

interface ScanOverlayProps {
  visible: boolean;
  onClose: () => void;
  mode?: 'solution' | 'problem';
  initialInput?: 'camera' | 'text';
  targetProblem?: UserProblem | null;
  onScanComplete?: (data: OlympiadAnalysisResult) => void;
  onProblemCreated?: (newProblem: UserProblem) => void;
  onQuotaExceeded?: () => void;
}

// Keeps phone photos small enough to upload quickly while staying legible for OCR
const PHOTO_QUALITY = 0.6;

const PRESET_PROBLEMS = [
  {
    id: 'bernoulli',
    code: 'BERNOULLI',
    title: 'Inegalitatea lui Bernoulli și Condiția Critică de Semn',
    domain: 'Algebră · Inegalități',
    enunt:
      'Fie x ∈ ℝ cu x > -1 și n ∈ ℕ*. Să se demonstreze prin inducție matematică inegalitatea: (1 + x)^n >= 1 + nx.',
    flawedText: `Pasul 1 (Cazul de bază): Pentru n = 1, avem (1 + x)^1 = 1 + 1·x, deci egalitatea are loc.
Pasul 2 (Ipoteza de inducție): Presupunem că (1 + x)^k >= 1 + kx este adevărată pentru k >= 1.
Pasul 3 (Pasul inductiv): Înmulțim ambii membri ai ipotezei cu (1 + x):
(1 + x)^(k+1) >= (1 + kx)(1 + x) = 1 + (k+1)x + kx^2 >= 1 + (k+1)x.
Pasul 4 (Concluzie): Conform principiului inducției matematice, inegalitatea este demonstrată pentru orice n ∈ ℕ*.`,
    soundText: `Pasul 1 (Cazul de bază): Pentru n = 1, avem (1 + x)^1 = 1 + 1·x, evident adevărat pentru orice x.
Pasul 2 (Ipoteza de inducție): Presupunem că (1 + x)^k >= 1 + kx este adevărată pentru k >= 1 fixat.
Pasul 3 (Pasul inductiv cu verificare semn): Din ipoteză știm că x > -1, ceea ce este echivalent cu 1 + x > 0.
Fiind strict pozitiv, înmulțirea ambilor membri ai inegalității P(k) cu (1 + x) conservă sensul:
(1 + x)^(k+1) >= (1 + kx)(1 + x) = 1 + (k+1)x + kx^2 >= 1 + (k+1)x (deoarece kx^2 >= 0).
Pasul 4 (Concluzie): Inducția matematică este riguros încheiată. Q.E.D.`,
  },
  {
    id: 'cauchy',
    code: 'CAUCHY–SCHWARZ',
    title: 'Inegalitatea lui Cauchy-Schwarz (Forma Algebrică)',
    domain: 'Algebră · Inegalități',
    enunt:
      'Fie a1..an și b1..bn numere reale. Demonstrați că (sum ai^2)(sum bi^2) >= (sum ai bi)^2.',
    flawedText: `Pasul 1: Construim funcția f(t) = sum (ai·t + bi)^2.
Pasul 2: Deoarece este o sumă de pătrate, f(t) >= 0 pentru orice t real.
Pasul 3: Dezvoltăm f(t) = (sum ai^2) t^2 + 2(sum ai bi) t + (sum bi^2).
Pasul 4: Deoarece f(t) >= 0, discriminantul trinomului este strict negativ Delta < 0.
Deci 4(sum ai bi)^2 - 4(sum ai^2)(sum bi^2) < 0, de unde rezultă inegalitatea strictă.`,
    soundText: `Pasul 1: Considerăm trinomul f(t) = sum (ai·t + bi)^2 = A t^2 + 2B t + C, unde A = sum ai^2, B = sum ai bi, C = sum bi^2.
Pasul 2: Fiind o sumă de pătrate reale, f(t) >= 0 pentru orice t ∈ ℝ.
Pasul 3: Cazul 1: Dacă A = 0, atunci ai = 0 pentru toți i, deci B = 0 și inegalitatea devine 0 >= 0 (trivial adevărată).
Pasul 4: Cazul 2: Dacă A > 0, f este o funcție de gradul 2 cu coeficient dominant pozitiv.
Condiția f(t) >= 0 pentru orice t implică discriminantul redus Delta' = B^2 - AC <= 0.
Pasul 5: Rezultă direct B^2 <= AC, adică (sum ai bi)^2 <= (sum ai^2)(sum bi^2). Egalitatea are loc dacă și numai dacă vectorii sunt proporționali.`,
  },
  {
    id: 'poly',
    code: 'POLINOAME ℤ[X]',
    title: 'Rădăcini Întregi pentru Polinoame cu Valori Impare',
    domain: 'Algebră · Polinoame',
    enunt:
      'Fie P(X) un polinom cu coeficienți întregi astfel încât P(0) și P(1) sunt numere impare. Demonstrați că P nu are rădăcini întregi.',
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
  mode = 'solution',
  initialInput = 'camera',
  targetProblem,
  onScanComplete,
  onProblemCreated,
  onQuotaExceeded,
}) => {
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();

  const [activeTab, setActiveTab] = useState<'camera' | 'text'>(initialInput);
  const [captureKind, setCaptureKind] = useState<'solution' | 'problem'>(mode);
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [torch, setTorch] = useState(false);
  const [capturedPhotoUri, setCapturedPhotoUri] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);

  const [sampleIndex, setSampleIndex] = useState(0);

  // Form states for typed input (start empty: the student's own work, not a sample)
  const [proofInput, setProofInput] = useState('');
  const [problemTitleInput, setProblemTitleInput] = useState('');
  const [problemDomainInput, setProblemDomainInput] = useState('');
  const [problemEnuntInput, setProblemEnuntInput] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const scale = useSharedValue(1.02);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setActiveTab(initialInput);
      setCaptureKind(mode);
      setCapturedPhotoUri(null);
      setProofInput('');
      setProblemTitleInput(targetProblem?.title ?? '');
      setProblemDomainInput(targetProblem?.domain ?? '');
      setProblemEnuntInput(targetProblem?.enuntRo ?? '');

      scale.value = 1.02;
      opacity.value = 0;
      scale.value = withSpring(1, SPRING_CONFIG);
      opacity.value = withSpring(1, SPRING_CONFIG);

      // Request camera permission on mount if needed
      if (initialInput === 'camera' && !permission?.granted && permission?.canAskAgain) {
        requestPermission().catch(() => {});
      }
    } else {
      scale.value = 1.02;
      opacity.value = 0;
      setTorch(false);
      setCameraReady(false);
    }
  }, [visible, mode, targetProblem, initialInput]);

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const handleLoadSample = () => {
    const sample = PRESET_PROBLEMS[sampleIndex % PRESET_PROBLEMS.length];
    setSampleIndex((i) => i + 1);
    if (!targetProblem) {
      setProblemTitleInput(sample.title);
      setProblemDomainInput(sample.domain);
      setProblemEnuntInput(sample.enunt);
    }
    if (captureKind === 'solution') setProofInput(sample.flawedText);
    showToast(`Exemplu încărcat: ${sample.code}`, 'done');
  };

  // Pick an existing photo (e.g. taken earlier in class)
  const handlePickFromGallery = async () => {
    if (isLoading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: PHOTO_QUALITY,
        base64: true,
      });
      if (result.canceled || !result.assets?.length) return;
      const asset = result.assets[0];
      if (!asset.base64) {
        showToast('Nu am putut citi imaginea selectată.', 'error');
        return;
      }
      setCapturedPhotoUri(asset.uri);
      await processCapturedPhoto(asset.base64, asset.mimeType || 'image/jpeg');
    } catch {
      showToast('Nu am putut deschide galeria.', 'error');
    }
  };

  // Direct In-App Camera Shutter Action
  const handleSnapFromViewfinder = async () => {
    if (isLoading) return;
    if (!permission?.granted) {
      requestPermission().catch(() => {});
      return;
    }
    if (!cameraRef.current || !cameraReady) {
      showToast('Camera încă pornește. Încearcă din nou într-o secundă.', 'none');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsLoading(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: PHOTO_QUALITY,
      });
      if (!photo?.base64) throw new Error('empty capture');
      setCapturedPhotoUri(photo.uri);
      await processCapturedPhoto(photo.base64, 'image/jpeg');
    } catch {
      setIsLoading(false);
      showToast('Fotografia nu a putut fi făcută. Încearcă din nou sau alege din galerie.', 'error');
    }
  };

  const handleError = (err: any, fallback: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    showToast(err?.message || fallback, 'error');
    if (err?.code === 'QUOTA_EXCEEDED') {
      onClose();
      onQuotaExceeded?.();
    }
  };

  const handleAuditResult = (res: OlympiadAnalysisResult) => {
    const isSound = res.phase === 'sound';
    Haptics.notificationAsync(
      isSound
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Warning
    );
    showToast(
      `Audit complet: ${res.scaledScores.onm7p.score.toFixed(2)} / 7p`,
      'done',
      isSound ? 'success' : 'warning'
    );
    onScanComplete?.(res);
  };

  // Send a photo to the backend: extract a problem statement, or grade a solution
  const processCapturedPhoto = async (photoBase64: string, mimeType: string) => {
    setIsLoading(true);
    try {
      if (captureKind === 'problem') {
        const res = await api.createProblem({ imageBase64: photoBase64, mimeType });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onProblemCreated?.(res);
        onClose();
      } else {
        const res = targetProblem?.id
          ? await api.submitProblemSolution(targetProblem.id, { imageBase64: photoBase64, mimeType })
          : await api.analyzeProof({ imageBase64: photoBase64, mimeType });
        handleAuditResult(res);
      }
    } catch (err: any) {
      setCapturedPhotoUri(null);
      handleError(
        err,
        captureKind === 'problem' ? 'Nu am putut citi enunțul din poză.' : 'Nu am putut evalua fotografia.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitTypedProblem = async () => {
    if (!problemEnuntInput.trim()) {
      showToast('Scrie enunțul problemei.', 'error');
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.createProblem({
        title: problemTitleInput.trim() || undefined,
        domain: problemDomainInput.trim() || undefined,
        enuntRo: problemEnuntInput.trim(),
      });
      onProblemCreated?.(res);
      onClose();
    } catch (err: any) {
      handleError(err, 'Eroare la salvare.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitTypedProof = async () => {
    const proof = proofInput.trim();
    if (!proof) {
      showToast('Scrie pașii demonstrației.', 'error');
      return;
    }
    setIsLoading(true);
    try {
      const res = targetProblem?.id
        ? await api.submitProblemSolution(targetProblem.id, { proofText: proof })
        : await api.analyzeProof({
            proofText: proof,
            problemTitle: problemTitleInput.trim() || undefined,
            enunt: problemEnuntInput.trim() || undefined,
          });
      handleAuditResult(res);
    } catch (err: any) {
      handleError(err, 'Eroare la audit.');
    } finally {
      setIsLoading(false);
    }
  };

  const isProblemMode = captureKind === 'problem';

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
            paddingTop: insets.top + 8,
            paddingBottom: Math.max(insets.bottom, 12),
          },
          overlayAnimatedStyle,
        ]}
      >
        {/* Top Header Bar */}
        <View style={styles.topRow}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={styles.headerTag}>
              {isProblemMode
                ? 'CAMERA TELEFONULUI · POZEAZĂ ENUNȚUL'
                : 'CAMERA TELEFONULUI · POZEAZĂ REZOLVAREA'}
            </Text>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {targetProblem
                ? `Rezolvare pentru: ${targetProblem.title}`
                : isProblemMode
                ? 'Fotografiază Enunțul Problemei'
                : 'Fotografiază Demonstrația Scrisă de Mână'}
            </Text>
          </View>
          <Pressable
            onPress={onClose}
            hitSlop={12}
            style={styles.closeBtn}
            accessibilityRole="button"
            accessibilityLabel="Închide"
          >
            <X size={17} color={C.foreground} strokeWidth={2.2} />
          </Pressable>
        </View>

        {activeTab === 'camera' ? (
          // ===================================================================
          // LIVE PHONE CAMERA VIEWFINDER & DIRECT SHUTTER
          // ===================================================================
          <View style={styles.cameraWorkspace}>
            {/* Quick Mode Toggle Pills (Rezolvare vs Enunț) */}
            {!targetProblem && (
              <View style={styles.modeToggleRow}>
                <Pressable
                  onPress={() => setCaptureKind('solution')}
                  style={[
                    styles.modeTogglePill,
                    captureKind === 'solution' && styles.modeTogglePillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.modeTogglePillText,
                      captureKind === 'solution' &&
                        styles.modeTogglePillTextActive,
                    ]}
                  >
                    1. Pozează Rezolvarea Foaie
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setCaptureKind('problem')}
                  style={[
                    styles.modeTogglePill,
                    captureKind === 'problem' && styles.modeTogglePillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.modeTogglePillText,
                      captureKind === 'problem' &&
                        styles.modeTogglePillTextActive,
                    ]}
                  >
                    2. Pozează Enunțul Problemei
                  </Text>
                </Pressable>
              </View>
            )}

            {/* The Live Phone Camera Feed */}
            <View style={styles.viewfinder}>
              {capturedPhotoUri ? (
                <Image
                  source={{ uri: capturedPhotoUri }}
                  style={StyleSheet.absoluteFill}
                  resizeMode="cover"
                />
              ) : permission?.granted ? (
                <CameraView
                  ref={cameraRef}
                  style={StyleSheet.absoluteFill}
                  facing={facing}
                  enableTorch={torch}
                  onCameraReady={() => setCameraReady(true)}
                />
              ) : (
                <View style={styles.permissionScreen}>
                  <Camera size={36} color="#FCFBF8" strokeWidth={1.8} />
                  <Text style={styles.permissionHeading}>
                    Pornește Camera Telefonului
                  </Text>
                  <Text style={styles.permissionDescription}>
                    MathSentry folosește camera pentru a fotografia direct
                    foaia de concurs sau rezolvarea ta pe caiet.
                  </Text>
                  <Pressable
                    onPress={requestPermission}
                    style={styles.enableCameraBtn}
                  >
                    <Camera size={14} color={C.slateDeep} strokeWidth={2.2} />
                    <Text style={styles.enableCameraBtnText}>
                      Permite Accesul la Cameră
                    </Text>
                  </Pressable>
                </View>
              )}

              {/* Viewfinder Brackets */}
              <View style={styles.framingOverlay} pointerEvents="none">
                <View style={styles.cornerTL} />
                <View style={styles.cornerTR} />
                <View style={styles.cornerBL} />
                <View style={styles.cornerBR} />

                <View style={styles.guideBadge}>
                  <Text style={styles.guideBadgeText}>
                    {isProblemMode
                      ? 'ÎNCADREAZĂ ENUNȚUL PE FOAIE'
                      : 'ÎNCADREAZĂ DEMONSTRAȚIA PE FOAIE'}
                  </Text>
                </View>
              </View>

              {/* Hardware Camera Controls (Flash + Flip) */}
              {permission?.granted && !capturedPhotoUri && (
                <View style={styles.hwControls}>
                  <Pressable
                    onPress={() => setTorch((t) => !t)}
                    accessibilityLabel="Lanternă"
                    hitSlop={4}
                    style={[styles.hwBtn, torch && styles.hwBtnActive]}
                  >
                    <Zap
                      size={15}
                      color={torch ? '#FDE68A' : '#FFFFFF'}
                      strokeWidth={2}
                    />
                  </Pressable>
                  <Pressable
                    onPress={() =>
                      setFacing((f) => (f === 'back' ? 'front' : 'back'))
                    }
                    accessibilityLabel="Schimbă camera"
                    hitSlop={4}
                    style={styles.hwBtn}
                  >
                    <RefreshCw size={15} color="#FFFFFF" strokeWidth={2} />
                  </Pressable>
                </View>
              )}

              {/* Processing state: AI reading can take a few seconds */}
              {isLoading && (
                <View style={styles.processingOverlay} pointerEvents="none">
                  <ActivityIndicator size="large" color="#FFFFFF" />
                  <Text style={styles.processingText}>
                    {isProblemMode ? 'Citesc enunțul…' : 'Citesc și verific demonstrația…'}
                  </Text>
                  <Text style={styles.processingSub}>Poate dura până la 30 de secunde</Text>
                </View>
              )}

              {/* Retake Button if photo was already snapped */}
              {capturedPhotoUri && !isLoading && (
                <Pressable
                  onPress={() => setCapturedPhotoUri(null)}
                  style={styles.retakeBtn}
                >
                  <RotateCcw size={13} color="#FFFFFF" />
                  <Text style={styles.retakeBtnText}>Refă poza</Text>
                </Pressable>
              )}
            </View>

            {/* Physical Shutter Button & Controls */}
            <View style={styles.shutterSection}>
              {/* Left: Switch to Manual Text */}
              <Pressable
                onPress={() => setActiveTab('text')}
                style={styles.sideOptionBtn}
              >
                <FileText size={16} color={C.foreground} strokeWidth={2} />
                <Text style={styles.sideOptionText}>Scrie Text</Text>
              </Pressable>

              {/* Center: BIG CAMERA SHUTTER BUTTON */}
              <Pressable
                onPress={handleSnapFromViewfinder}
                disabled={isLoading}
                accessibilityRole="button"
                accessibilityLabel="Fă poza"
                style={({ pressed }) => [
                  styles.shutterRing,
                  pressed && { transform: [{ scale: 0.94 }] },
                  isLoading && { opacity: 0.7 },
                ]}
              >
                <View style={styles.shutterDisk}>
                  {isLoading ? (
                    <ActivityIndicator size="small" color={C.primaryFg} />
                  ) : (
                    <Camera size={26} color={C.primaryFg} strokeWidth={2} />
                  )}
                </View>
              </Pressable>

              {/* Right: Pick from gallery */}
              <Pressable
                onPress={handlePickFromGallery}
                disabled={isLoading}
                style={styles.sideOptionBtn}
              >
                <ImageIcon size={16} color={C.primary} strokeWidth={2} />
                <Text style={styles.sideOptionText} numberOfLines={1}>
                  Galerie
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          // ===================================================================
          // MANUAL TEXT INPUT BACKUP
          // ===================================================================
          <KeyboardAvoidingView
            style={styles.scrollArea}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            {/* Header Switch to return to Camera */}
            <Pressable
              onPress={() => setActiveTab('camera')}
              style={styles.returnToCameraBtn}
            >
              <Camera size={15} color={C.primary} strokeWidth={2} />
              <Text style={styles.returnToCameraText}>
                ← Fotografiază în loc să scrii
              </Text>
            </Pressable>

            {!targetProblem && (
              <View style={styles.modeToggleRow}>
                <Pressable
                  onPress={() => setCaptureKind('solution')}
                  style={[
                    styles.modeTogglePill,
                    captureKind === 'solution' && styles.modeTogglePillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.modeTogglePillText,
                      captureKind === 'solution' && styles.modeTogglePillTextActive,
                    ]}
                  >
                    Demonstrație
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setCaptureKind('problem')}
                  style={[
                    styles.modeTogglePill,
                    captureKind === 'problem' && styles.modeTogglePillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.modeTogglePillText,
                      captureKind === 'problem' && styles.modeTogglePillTextActive,
                    ]}
                  >
                    Enunț de problemă
                  </Text>
                </Pressable>
              </View>
            )}

            <Pressable onPress={handleLoadSample} style={styles.sampleBtn} hitSlop={6}>
              <Scale size={13} color={C.primary} strokeWidth={2} />
              <Text style={styles.sampleBtnText}>
                Nu ai o demonstrație la îndemână? Încarcă un exemplu
              </Text>
            </Pressable>

            {isProblemMode ? (
              <>
                <Text style={styles.sectionLabel}>TITLUL PROBLEMEI (OPȚIONAL):</Text>
                <TextInput
                  style={styles.singleLineInput}
                  value={problemTitleInput}
                  onChangeText={setProblemTitleInput}
                  placeholder="Ex: Inegalitatea lui Cauchy-Schwarz"
                  placeholderTextColor={C.mutedFg}
                />

                <Text style={styles.sectionLabel}>DOMENIU MATEMATIC (OPȚIONAL):</Text>
                <TextInput
                  style={styles.singleLineInput}
                  value={problemDomainInput}
                  onChangeText={setProblemDomainInput}
                  placeholder="Ex: Algebră · Inegalități"
                  placeholderTextColor={C.mutedFg}
                />

                <Text style={styles.sectionLabel}>
                  ENUNȚUL COMPLET AL PROBLEMEI:
                </Text>
                <TextInput
                  style={styles.textInputArea}
                  value={problemEnuntInput}
                  onChangeText={setProblemEnuntInput}
                  multiline
                  placeholder="Scrie enunțul problemei..."
                  placeholderTextColor={C.mutedFg}
                  textAlignVertical="top"
                />

                <Pressable
                  onPress={handleSubmitTypedProblem}
                  disabled={isLoading}
                  style={[styles.primaryActionBtn, isLoading && { opacity: 0.65 }]}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color={C.primaryFg} />
                  ) : (
                    <Plus size={15} color={C.primaryFg} />
                  )}
                  <Text style={styles.actionBtnText}>Salvează problema</Text>
                </Pressable>
              </>
            ) : (
              <>
                {targetProblem ? (
                  <>
                    <Text style={styles.sectionLabel}>PROBLEMA:</Text>
                    <View style={styles.readOnlyStatement}>
                      <MathText style={styles.readOnlyStatementText}>
                        {targetProblem.enuntRo}
                      </MathText>
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={styles.sectionLabel}>ENUNȚUL PROBLEMEI (RECOMANDAT):</Text>
                    <TextInput
                      style={[styles.textInputArea, { minHeight: 90 }]}
                      value={problemEnuntInput}
                      onChangeText={setProblemEnuntInput}
                      multiline
                      maxLength={5000}
                      placeholder="Ce trebuie demonstrat? Ex: Fie x > -1 și n ∈ ℕ*. Arătați că (1 + x)^n ≥ 1 + nx."
                      placeholderTextColor={C.mutedFg}
                      textAlignVertical="top"
                    />
                  </>
                )}

                <Text style={styles.sectionLabel}>
                  DEMONSTRAȚIA TA (PAS CU PAS):
                </Text>
                <TextInput
                  style={styles.textInputArea}
                  value={proofInput}
                  onChangeText={setProofInput}
                  multiline
                  maxLength={20000}
                  placeholder={'Pasul 1: …\nPasul 2: …'}
                  placeholderTextColor={C.mutedFg}
                  textAlignVertical="top"
                />

                <Pressable
                  onPress={handleSubmitTypedProof}
                  disabled={isLoading}
                  style={[styles.primaryActionBtn, isLoading && { opacity: 0.65 }]}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color={C.primaryFg} />
                  ) : (
                    <Scale size={15} color={C.primaryFg} />
                  )}
                  <Text style={styles.actionBtnText}>
                    {isLoading ? 'Se verifică…' : 'Verifică demonstrația'}
                  </Text>
                </Pressable>
              </>
            )}
          </ScrollView>
          </KeyboardAvoidingView>
        )}
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(22, 22, 21, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
  },
  processingText: {
    fontFamily: F.uiSemi,
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  processingSub: {
    fontFamily: F.ui,
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
  },
  sampleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    marginBottom: 4,
  },
  sampleBtnText: {
    flex: 1,
    fontFamily: F.uiMed,
    fontSize: 12,
    color: C.primary,
  },
  readOnlyStatement: {
    backgroundColor: C.muted,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 6,
    padding: 10,
  },
  readOnlyStatementText: {
    fontSize: 14,
    lineHeight: 20,
  },
  container: {
    flex: 1,
    backgroundColor: C.background,
    paddingHorizontal: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerTag: {
    fontFamily: F.monoMed,
    fontSize: 9.5,
    color: C.primary,
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: F.mathMed,
    color: C.foreground,
    letterSpacing: -0.2,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // --- CAMERA WORKSPACE ---
  cameraWorkspace: {
    flex: 1,
    flexDirection: 'column',
  },
  modeToggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  modeTogglePill: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.card,
    alignItems: 'center',
  },
  modeTogglePillActive: {
    backgroundColor: C.slateDeep,
    borderColor: C.slateDeep,
  },
  modeTogglePillText: {
    fontFamily: F.monoMed,
    fontSize: 10,
    color: C.mutedFg,
  },
  modeTogglePillTextActive: {
    color: C.primaryFg,
  },
  viewfinder: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#141413',
    borderWidth: 1,
    borderColor: C.border,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionScreen: {
    padding: 24,
    alignItems: 'center',
    maxWidth: 300,
  },
  permissionHeading: {
    fontFamily: F.mathMed,
    fontSize: 19,
    color: '#FCFBF8',
    marginTop: 12,
    marginBottom: 6,
    textAlign: 'center',
  },
  permissionDescription: {
    fontFamily: F.ui,
    fontSize: 12.5,
    lineHeight: 18,
    color: 'rgba(252, 251, 248, 0.72)',
    textAlign: 'center',
    marginBottom: 16,
  },
  enableCameraBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#FCFBF8',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
  },
  enableCameraBtnText: {
    fontFamily: F.uiSemi,
    fontSize: 13,
    color: C.slateDeep,
  },
  framingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    margin: 16,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  cornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 28,
    height: 28,
    borderTopWidth: 2.5,
    borderLeftWidth: 2.5,
    borderColor: '#FCFBF8',
  },
  cornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 28,
    height: 28,
    borderTopWidth: 2.5,
    borderRightWidth: 2.5,
    borderColor: '#FCFBF8',
  },
  cornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 28,
    height: 28,
    borderBottomWidth: 2.5,
    borderLeftWidth: 2.5,
    borderColor: '#FCFBF8',
  },
  cornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderBottomWidth: 2.5,
    borderRightWidth: 2.5,
    borderColor: '#FCFBF8',
  },
  guideBadge: {
    backgroundColor: 'rgba(22, 22, 21, 0.78)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(252, 251, 248, 0.2)',
  },
  guideBadgeText: {
    fontFamily: F.monoMed,
    fontSize: 9.5,
    color: '#FCFBF8',
    letterSpacing: 0.5,
  },
  hwControls: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8,
  },
  hwBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(22, 22, 21, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hwBtnActive: {
    backgroundColor: 'rgba(180, 83, 9, 0.85)',
  },
  retakeBtn: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(22, 22, 21, 0.82)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
  },
  retakeBtnText: {
    fontFamily: F.uiSemi,
    fontSize: 12,
    color: '#FFFFFF',
  },
  shutterSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  sideOptionBtn: {
    width: 80,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.card,
    alignItems: 'center',
    gap: 3,
  },
  sideOptionText: {
    fontFamily: F.monoMed,
    fontSize: 10,
    color: C.foreground,
  },
  shutterRing: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 3,
    borderColor: C.slateDeep,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: C.card,
  },
  shutterDisk: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    backgroundColor: C.slateDeep,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // --- MANUAL TEXT ---
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 28,
  },
  returnToCameraBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 6,
    marginBottom: 14,
  },
  returnToCameraText: {
    fontFamily: F.uiSemi,
    fontSize: 12,
    color: C.primary,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: F.monoMed,
    color: C.mutedFg,
    letterSpacing: 0.6,
    marginBottom: 6,
    marginTop: 6,
  },
  singleLineInput: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: C.foreground,
    fontSize: 14,
    fontFamily: F.ui,
    marginBottom: 10,
  },
  textInputArea: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 6,
    padding: 14,
    color: C.foreground,
    fontSize: 14.5,
    fontFamily: F.math,
    minHeight: 160,
    lineHeight: 22,
    marginBottom: 16,
  },
  primaryActionBtn: {
    backgroundColor: C.slateDeep,
    borderRadius: 6,
    height: 48,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  actionBtnText: {
    color: C.primaryFg,
    fontFamily: F.uiSemi,
    fontSize: 13.5,
  },
});
