import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import { X, Check, Minus, CreditCard, ShieldAlert } from 'lucide-react-native';
import { C, F } from '@/theme';
import { useAuth } from '@/context/AuthContext';
import { api, ApiError, BillingConfig } from '@/services/api';
import { showToast } from '@/components/ToastHelper';
import * as Haptics from '@/components/Haptics';

interface ProSheetProps {
  visible: boolean;
  onClose: () => void;
  /** Called when a guest tries to upgrade; the parent opens the sign-up sheet. */
  onRequireAccount: () => void;
}

type Step = 'paywall' | 'checkout' | 'pending' | 'success';

const TEST_CARD = { number: '4242424242424242', expiry: '12/34', cvc: '123' };

const formatCardNumber = (digits: string) => digits.replace(/(\d{4})(?=\d)/g, '$1 ');

const formatExpiry = (raw: string) => {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
};

const formatDate = (iso: string | null | undefined) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' });
};

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export const ProSheet: React.FC<ProSheetProps> = ({ visible, onClose, onRequireAccount }) => {
  const insets = useSafeAreaInsets();
  const { user, stats, isGuest, refreshStats } = useAuth();

  const [step, setStep] = useState<Step>('paywall');
  const [config, setConfig] = useState<BillingConfig | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [proUntil, setProUntil] = useState<string | null>(null);

  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [holder, setHolder] = useState('');

  // Bumped on every open/close so results of in-flight requests are ignored
  const runId = useRef(0);

  const clearCard = () => {
    setCardNumber('');
    setExpiry('');
    setCvc('');
    setHolder('');
  };

  const loadConfig = useCallback(async () => {
    const id = runId.current;
    setConfigError(null);
    try {
      const cfg = await api.getBillingConfig();
      if (id === runId.current) setConfig(cfg);
    } catch (err: any) {
      if (id === runId.current) {
        setConfigError(err?.message || 'Nu am putut încărca prețurile.');
      }
    }
  }, []);

  useEffect(() => {
    runId.current += 1;
    if (visible) {
      setStep('paywall');
      setBusy(false);
      setProcessing(false);
      setErrorMsg(null);
      setSessionId(null);
      setProUntil(null);
      setConfig(null);
      clearCard();
      loadConfig();
    } else {
      clearCard();
    }
  }, [visible, loadConfig]);

  const handleClose = () => {
    if (processing) return;
    onClose();
  };

  const finishSuccess = async (until: string) => {
    setProUntil(until);
    setStep('success');
    clearCard();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await refreshStats();
  };

  const confirmStripe = async (sid: string, id: number) => {
    setBusy(true);
    setErrorMsg(null);
    try {
      const res = await api.confirmCheckout(sid);
      if (id !== runId.current) return;
      await finishSuccess(res.proUntil);
    } catch (err: any) {
      if (id !== runId.current) return;
      setStep('pending');
      setErrorMsg(
        err instanceof ApiError && err.code === 'PAYMENT_PENDING'
          ? 'Plata nu a fost încă confirmată.'
          : err?.message || 'Nu am putut verifica plata.'
      );
    } finally {
      if (id === runId.current) setBusy(false);
    }
  };

  const handleUpgrade = async () => {
    if (!config || config.mode === 'disabled' || busy) return;
    if (isGuest) {
      showToast('Creează un cont gratuit, apoi treci la Pro.', 'none');
      onRequireAccount();
      return;
    }
    const id = runId.current;
    setBusy(true);
    setErrorMsg(null);
    try {
      const session = await api.startCheckout();
      if (id !== runId.current) return;
      setSessionId(session.sessionId);
      if (session.mode === 'stripe') {
        await WebBrowser.openBrowserAsync(session.url);
        if (id !== runId.current) return;
        await confirmStripe(session.sessionId, id);
      } else {
        setStep('checkout');
      }
    } catch (err: any) {
      if (id !== runId.current) return;
      if (err instanceof ApiError && err.code === 'ACCOUNT_REQUIRED') {
        showToast('Creează un cont gratuit, apoi treci la Pro.', 'none');
        onRequireAccount();
      } else if (err instanceof ApiError && err.code === 'BILLING_DISABLED') {
        setConfig((prev) => (prev ? { ...prev, mode: 'disabled' } : prev));
      } else {
        setErrorMsg(err?.message || 'Nu am putut porni plata. Încearcă din nou.');
      }
    } finally {
      if (id === runId.current) setBusy(false);
    }
  };

  const cardReady =
    cardNumber.length >= 13 && expiry.length === 5 && cvc.length >= 3;

  const handlePayDemo = async () => {
    if (!sessionId || !cardReady || processing) return;
    const id = runId.current;
    setErrorMsg(null);
    setProcessing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await wait(1200);
      const res = await api.confirmCheckout(sessionId, cardNumber);
      if (id !== runId.current) return;
      await finishSuccess(res.proUntil);
    } catch (err: any) {
      if (id !== runId.current) return;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setErrorMsg(
        err instanceof ApiError && err.code === 'CARD_DECLINED'
          ? 'Card refuzat. Verifică datele sau folosește cardul de test.'
          : err?.message || 'Plata a eșuat. Încearcă din nou.'
      );
    } finally {
      if (id === runId.current) setProcessing(false);
    }
  };

  const fillTestCard = () => {
    setCardNumber(TEST_CARD.number);
    setExpiry(TEST_CARD.expiry);
    setCvc(TEST_CARD.cvc);
    if (!holder) setHolder(user?.username && !isGuest ? user.username : 'Candidat Olimpic');
    setErrorMsg(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const priceLabel = config?.priceLabel ?? '';
  const disabled = config?.mode === 'disabled';
  const freeLimit = stats && stats.dailyLimit && user?.plan !== 'pro' ? stats.dailyLimit : 20;

  const comparison: { label: string; free: string | boolean; pro: string | boolean }[] = [
    { label: 'Audituri pe zi', free: String(freeLimit), pro: '200' },
    { label: 'Prioritate la evaluare', free: false, pro: true },
    { label: 'Export PDF / Typst', free: false, pro: true },
    { label: 'Istoric nelimitat', free: false, pro: true },
  ];

  const renderCell = (value: string | boolean, pro: boolean) => {
    if (typeof value === 'string') {
      return <Text style={[styles.cellText, pro && styles.cellTextPro]}>{value}</Text>;
    }
    return value ? (
      <Check size={16} color={C.success} strokeWidth={2.6} />
    ) : (
      <Minus size={16} color={C.mutedFg} strokeWidth={2} />
    );
  };

  const renderPaywall = () => (
    <>
      <Text style={styles.tag}>ABONAMENT</Text>
      <Text style={styles.title}>MathSentry Pro</Text>
      <Text style={styles.subtitle}>
        Mai multe audituri și instrumente pentru pregătirea de olimpiadă.
      </Text>

      <View style={styles.priceBox}>
        {config ? (
          <>
            <Text style={styles.priceText}>{priceLabel}</Text>
            {config.periodDays > 0 && (
              <Text style={styles.priceSub}>
                pentru {config.periodDays} de zile de acces Pro
              </Text>
            )}
          </>
        ) : configError ? (
          <Pressable onPress={loadConfig} accessibilityRole="button">
            <Text style={styles.priceSub}>{configError}</Text>
            <Text style={styles.linkText}>Reîncearcă</Text>
          </Pressable>
        ) : (
          <ActivityIndicator size="small" color={C.primary} />
        )}
      </View>

      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHead]}>
          <Text style={[styles.rowLabel, styles.headText]} />
          <Text style={[styles.cellCol, styles.headText]}>GRATUIT</Text>
          <Text style={[styles.cellCol, styles.headText, { color: C.primary }]}>PRO</Text>
        </View>
        {comparison.map((row, i) => (
          <View
            key={row.label}
            style={[styles.tableRow, i < comparison.length - 1 && styles.tableRowBorder]}
          >
            <Text style={styles.rowLabel}>{row.label}</Text>
            <View style={styles.cellCol}>{renderCell(row.free, false)}</View>
            <View style={styles.cellCol}>{renderCell(row.pro, true)}</View>
          </View>
        ))}
      </View>

      {errorMsg && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      )}

      {disabled && <Text style={styles.soonText}>Plățile vor fi disponibile în curând</Text>}

      <Pressable
        onPress={handleUpgrade}
        disabled={!config || disabled || busy}
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.primaryBtn,
          (!config || disabled) && { opacity: 0.45 },
          pressed && { opacity: 0.88 },
        ]}
      >
        {busy ? (
          <ActivityIndicator size="small" color={C.primaryFg} />
        ) : (
          <Text style={styles.primaryBtnText}>
            {priceLabel ? `Treci la Pro — ${priceLabel}` : 'Treci la Pro'}
          </Text>
        )}
      </Pressable>

      <Text style={styles.smallPrint}>Se reînnoiește manual. Poți anula oricând.</Text>
    </>
  );

  const renderPending = () => (
    <>
      <Text style={styles.tag}>PLATĂ ÎN AȘTEPTARE</Text>
      <Text style={styles.title}>Verificăm plata</Text>
      <Text style={styles.subtitle}>
        Dacă ai finalizat plata în browser, apasă butonul de mai jos pentru a o confirma.
      </Text>
      {errorMsg && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      )}
      <Pressable
        onPress={() => sessionId && confirmStripe(sessionId, runId.current)}
        disabled={busy}
        accessibilityRole="button"
        style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.88 }]}
      >
        {busy ? (
          <ActivityIndicator size="small" color={C.primaryFg} />
        ) : (
          <Text style={styles.primaryBtnText}>Am plătit — verifică din nou</Text>
        )}
      </Pressable>
      <Pressable onPress={handleClose} style={styles.secondaryBtn} accessibilityRole="button">
        <Text style={styles.secondaryBtnText}>Anulează</Text>
      </Pressable>
    </>
  );

  const renderCheckout = () => (
    <>
      <View style={styles.demoBanner}>
        <ShieldAlert size={15} color={C.warn} strokeWidth={2.2} />
        <Text style={styles.demoBannerText}>
          MOD DEMONSTRATIV — nu se percepe nicio plată reală
        </Text>
      </View>

      <Text style={styles.title}>Plată cu cardul</Text>
      <Text style={styles.subtitle}>MathSentry Pro · {priceLabel}</Text>

      {processing ? (
        <View style={styles.processing}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={styles.processingText}>Se procesează plata…</Text>
        </View>
      ) : (
        <View style={styles.form}>
          {errorMsg && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          <Text style={styles.fieldLabel}>NUMĂR CARD</Text>
          <View style={styles.inputWrapper}>
            <CreditCard size={15} color={C.mutedFg} strokeWidth={2} style={styles.inputIcon} />
            <TextInput
              placeholder="1234 5678 9012 3456"
              placeholderTextColor={C.mutedFg}
              value={formatCardNumber(cardNumber)}
              onChangeText={(t) => setCardNumber(t.replace(/\D/g, '').slice(0, 19))}
              keyboardType="number-pad"
              maxLength={23}
              autoComplete="off"
              textContentType="none"
              style={[styles.input, { fontFamily: F.mono }]}
              accessibilityLabel="Număr card"
            />
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>EXPIRARE</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  placeholder="LL/AA"
                  placeholderTextColor={C.mutedFg}
                  value={expiry}
                  onChangeText={(t) => setExpiry(formatExpiry(t))}
                  keyboardType="number-pad"
                  maxLength={5}
                  autoComplete="off"
                  style={[styles.input, { fontFamily: F.mono }]}
                  accessibilityLabel="Data expirării"
                />
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>CVC</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  placeholder="123"
                  placeholderTextColor={C.mutedFg}
                  value={cvc}
                  onChangeText={(t) => setCvc(t.replace(/\D/g, '').slice(0, 4))}
                  keyboardType="number-pad"
                  maxLength={4}
                  secureTextEntry
                  autoComplete="off"
                  style={[styles.input, { fontFamily: F.mono }]}
                  accessibilityLabel="Cod de securitate CVC"
                />
              </View>
            </View>
          </View>

          <Text style={styles.fieldLabel}>NUME PE CARD</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Nume și prenume"
              placeholderTextColor={C.mutedFg}
              value={holder}
              onChangeText={setHolder}
              autoCapitalize="words"
              autoComplete="off"
              style={styles.input}
              accessibilityLabel="Numele de pe card"
            />
          </View>

          <Pressable onPress={fillTestCard} style={styles.testLink} accessibilityRole="button">
            <Text style={styles.linkText}>Folosește cardul de test</Text>
          </Pressable>

          <Pressable
            onPress={handlePayDemo}
            disabled={!cardReady}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.primaryBtn,
              !cardReady && { opacity: 0.45 },
              pressed && { opacity: 0.88 },
            ]}
          >
            <Text style={styles.primaryBtnText}>Plătește {priceLabel}</Text>
          </Pressable>
        </View>
      )}
    </>
  );

  const renderSuccess = () => (
    <View style={styles.successWrap}>
      <View style={styles.successCircle}>
        <Check size={34} color={C.success} strokeWidth={2.8} />
      </View>
      <Text style={styles.title}>Bun venit în MathSentry Pro!</Text>
      {formatDate(proUntil) !== '' && (
        <Text style={styles.subtitle}>Activ până la {formatDate(proUntil)}</Text>
      )}
      <Pressable
        onPress={onClose}
        accessibilityRole="button"
        style={({ pressed }) => [styles.primaryBtn, { alignSelf: 'stretch' }, pressed && { opacity: 0.88 }]}
      >
        <Text style={styles.primaryBtnText}>Începe să auditezi</Text>
      </Pressable>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <View style={[styles.screen, { paddingTop: insets.top + 8 }]}>
        <Pressable
          onPress={handleClose}
          hitSlop={10}
          style={styles.closeBtn}
          accessibilityRole="button"
          accessibilityLabel="Închide"
        >
          <X size={20} color={C.mutedFg} strokeWidth={2} />
        </Pressable>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 28 }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {step === 'paywall' && renderPaywall()}
            {step === 'checkout' && renderCheckout()}
            {step === 'pending' && renderPending()}
            {step === 'success' && renderSuccess()}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.background,
  },
  closeBtn: {
    alignSelf: 'flex-end',
    marginRight: 16,
    padding: 6,
    zIndex: 10,
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 6,
  },
  tag: {
    fontFamily: F.monoMed,
    fontSize: 9.5,
    color: C.primary,
    textAlign: 'center',
    letterSpacing: 0.7,
    marginBottom: 4,
  },
  title: {
    fontFamily: F.mathMed,
    fontSize: 26,
    color: C.foreground,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: F.ui,
    fontSize: 13,
    lineHeight: 19,
    color: C.mutedFg,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 18,
  },
  priceBox: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 64,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    paddingVertical: 14,
    marginBottom: 16,
  },
  priceText: {
    fontFamily: F.monoMed,
    fontSize: 24,
    color: C.foreground,
  },
  priceSub: {
    fontFamily: F.ui,
    fontSize: 12,
    color: C.mutedFg,
    marginTop: 2,
    textAlign: 'center',
  },
  table: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 18,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  tableHead: {
    backgroundColor: C.muted,
    paddingVertical: 8,
  },
  tableRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: C.borderLight,
  },
  headText: {
    fontFamily: F.monoMed,
    fontSize: 10,
    color: C.mutedFg,
    letterSpacing: 0.6,
  },
  rowLabel: {
    flex: 1,
    fontFamily: F.uiMed,
    fontSize: 13,
    color: C.foreground,
  },
  cellCol: {
    width: 64,
    alignItems: 'center',
    textAlign: 'center',
  },
  cellText: {
    fontFamily: F.monoMed,
    fontSize: 13,
    color: C.mutedFg,
  },
  cellTextPro: {
    color: C.primary,
  },
  soonText: {
    fontFamily: F.uiSemi,
    fontSize: 13,
    color: C.warn,
    textAlign: 'center',
    marginBottom: 10,
  },
  primaryBtn: {
    backgroundColor: C.slateDeep,
    borderRadius: 6,
    paddingVertical: 14,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    fontFamily: F.uiSemi,
    fontSize: 14,
    color: C.primaryFg,
  },
  secondaryBtn: {
    marginTop: 10,
    paddingVertical: 13,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.card,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontFamily: F.uiMed,
    fontSize: 13.5,
    color: C.foreground,
  },
  smallPrint: {
    fontFamily: F.ui,
    fontSize: 11.5,
    color: C.mutedFg,
    textAlign: 'center',
    marginTop: 12,
  },
  linkText: {
    fontFamily: F.mono,
    fontSize: 11.5,
    color: C.primary,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
  errorBanner: {
    backgroundColor: C.flawSoft,
    borderWidth: 1,
    borderColor: 'rgba(185, 28, 28, 0.3)',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
  errorText: {
    fontFamily: F.ui,
    fontSize: 12.5,
    color: C.flaw,
  },
  demoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.warnSoft,
    borderWidth: 1,
    borderColor: C.warn,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 18,
  },
  demoBannerText: {
    flexShrink: 1,
    fontFamily: F.monoMed,
    fontSize: 10.5,
    color: C.warn,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  form: {
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  fieldLabel: {
    fontFamily: F.monoMed,
    fontSize: 9.5,
    color: C.mutedFg,
    letterSpacing: 0.6,
    marginTop: 8,
    marginBottom: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 6,
    paddingHorizontal: 12,
    backgroundColor: C.card,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontFamily: F.ui,
    fontSize: 15,
    color: C.foreground,
  },
  testLink: {
    alignSelf: 'center',
    paddingVertical: 10,
  },
  processing: {
    alignItems: 'center',
    gap: 14,
    paddingVertical: 48,
  },
  processingText: {
    fontFamily: F.uiMed,
    fontSize: 14,
    color: C.mutedFg,
  },
  successWrap: {
    alignItems: 'center',
    paddingTop: 48,
  },
  successCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: C.successSoft,
    borderWidth: 1,
    borderColor: 'rgba(22, 101, 52, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
});
