import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  ArrowRight,
  Check,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { C, F } from '@/theme';
import { useAuth } from '@/context/AuthContext';
import { showToast } from '@/components/ToastHelper';

export const AuthScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { login, register, loginDemo, continueAsGuest } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const busy = loading || demoLoading || guestLoading;
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleModeChange = (newMode: 'login' | 'register') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMode(newMode);
    setErrorMsg(null);
  };

  const handleSubmit = async () => {
    setErrorMsg(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Introduceți o adresă de email validă.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Parola trebuie să aibă minimum 6 caractere.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    if (mode === 'register' && !username.trim()) {
      setErrorMsg('Vă rugăm să introduceți numele dumneavoastră.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await login(cleanEmail, password);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showToast('Autentificare reușită.', 'done', 'success');
      } else {
        await register(cleanEmail, password, username.trim());
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showToast('Cont de candidat creat cu succes.', 'done', 'success');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Eroare de comunicare cu serverul.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    setErrorMsg(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await loginDemo();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Autentificat în contul demonstrativ ONM.', 'done', 'success');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Eroare la autentificarea demonstrativă.');
    } finally {
      setDemoLoading(false);
    }
  };

  const handleGuest = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setErrorMsg(null);
    setGuestLoading(true);
    try {
      await continueAsGuest();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Nu am putut porni sesiunea. Verifică conexiunea.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top + 24, 44),
            paddingBottom: Math.max(insets.bottom + 24, 40),
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Editorial Monograph Header */}
        <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
          <View style={styles.monogramRow}>
            <View style={styles.monogramSquare}>
              <Text style={styles.monogramText}>∑</Text>
            </View>
            <Text style={styles.editionLabel}>
              SISTEM FORMAL DE AUDIT · ONM 2026
            </Text>
          </View>

          <Text style={styles.title}>MathSentry</Text>
          <Text style={styles.subtitle}>
            Fotografiază sau scrie o demonstrație și află în câteva secunde unde
            se rupe raționamentul și câte puncte ai lua pe baremul ONM sau Bac.
          </Text>
        </Animated.View>

        {/* Manuscript Auth Card */}
        <Animated.View
          entering={FadeInUp.duration(500).delay(100)}
          style={styles.card}
        >
          {/* Segmented Switcher */}
          <View style={styles.tabContainer}>
            <Pressable
              onPress={() => handleModeChange('login')}
              style={[
                styles.tabButton,
                mode === 'login' && styles.tabButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  mode === 'login' && styles.tabButtonTextActive,
                ]}
              >
                Autentificare
              </Text>
            </Pressable>

            <Pressable
              onPress={() => handleModeChange('register')}
              style={[
                styles.tabButton,
                mode === 'register' && styles.tabButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  mode === 'register' && styles.tabButtonTextActive,
                ]}
              >
                Înregistrare Candidat
              </Text>
            </Pressable>
          </View>

          {/* Error Banner */}
          {errorMsg ? (
            <Animated.View entering={FadeIn} style={styles.errorBanner}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </Animated.View>
          ) : null}

          {/* Form Fields */}
          <View style={styles.form}>
            {mode === 'register' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>NUME ȘI PRENUME CANDIDAT</Text>
                <View style={styles.inputWrapper}>
                  <UserIcon size={15} color={C.mutedFg} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="ex. Andrei Popescu"
                    placeholderTextColor={C.mutedFg}
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>ADRESĂ EMAIL</Text>
              <View style={styles.inputWrapper}>
                <Mail size={15} color={C.mutedFg} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="candidat@olimpiada.ro"
                  placeholderTextColor={C.mutedFg}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  textContentType="emailAddress"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>PAROLĂ</Text>
              <View style={styles.inputWrapper}>
                <Lock size={15} color={C.mutedFg} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Minimum 6 caractere"
                  placeholderTextColor={C.mutedFg}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  textContentType={mode === 'login' ? 'password' : 'newPassword'}
                  autoCorrect={false}
                  returnKeyType="go"
                  onSubmitEditing={handleSubmit}
                />
                <Pressable
                  onPress={() => setShowPassword((p) => !p)}
                  hitSlop={8}
                  style={styles.eyeButton}
                >
                  {showPassword ? (
                    <EyeOff size={15} color={C.mutedFg} />
                  ) : (
                    <Eye size={15} color={C.mutedFg} />
                  )}
                </Pressable>
              </View>
            </View>

            {/* Primary Submit Button */}
            <Pressable
              onPress={handleSubmit}
              disabled={busy}
              style={({ pressed }) => [
                styles.submitButton,
                pressed && { opacity: 0.88 },
                busy && { opacity: 0.65 },
              ]}
            >
              {loading ? (
                <ActivityIndicator size="small" color={C.primaryFg} />
              ) : (
                <View style={styles.buttonContent}>
                  <Text style={styles.submitButtonText}>
                    {mode === 'login' ? 'Intră în cont' : 'Creează cont gratuit'}
                  </Text>
                  <ArrowRight size={15} color={C.primaryFg} strokeWidth={2} />
                </View>
              )}
            </Pressable>
          </View>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>SAU</Text>
            <View style={styles.divider} />
          </View>

          {/* Guest Mode: the fastest way to try the product */}
          <Pressable
            onPress={handleGuest}
            disabled={busy}
            style={({ pressed }) => [
              styles.demoButton,
              pressed && { backgroundColor: C.muted },
              guestLoading && { opacity: 0.6 },
            ]}
          >
            {guestLoading ? (
              <ActivityIndicator size="small" color={C.primary} />
            ) : (
              <Text style={styles.demoButtonText}>
                Încearcă fără cont
              </Text>
            )}
          </Pressable>

          {/* Shared demo account: development builds only */}
          {__DEV__ && (
            <Pressable
              onPress={handleDemoLogin}
              disabled={busy}
              style={({ pressed }) => [
                styles.guestButton,
                pressed && { opacity: 0.7 },
                demoLoading && { opacity: 0.6 },
              ]}
            >
              {demoLoading ? (
                <ActivityIndicator size="small" color={C.primary} />
              ) : (
                <Text style={styles.guestButtonText}>
                  [DEV] Cont demonstrativ partajat
                </Text>
              )}
            </Pressable>
          )}
        </Animated.View>

        {/* Footer Specification Strip */}
        <Animated.View
          entering={FadeInUp.duration(500).delay(200)}
          style={styles.featuresRow}
        >
          <View style={styles.featureItem}>
            <Check size={12} color={C.success} strokeWidth={2.5} />
            <Text style={styles.featureText}>Colaps deductiv în cascadă</Text>
          </View>
          <View style={styles.featureItem}>
            <Check size={12} color={C.success} strokeWidth={2.5} />
            <Text style={styles.featureText}>Barem ONM (7p) & Bac (10p)</Text>
          </View>
          <View style={styles.featureItem}>
            <Check size={12} color={C.success} strokeWidth={2.5} />
            <Text style={styles.featureText}>Export manuscris Typst</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: C.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 22,
    maxWidth: 390,
  },
  monogramRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  monogramSquare: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: C.slateDeep,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monogramText: {
    fontFamily: F.mathMed,
    fontSize: 14,
    color: C.primaryFg,
  },
  editionLabel: {
    fontFamily: F.monoMed,
    fontSize: 10,
    color: C.primary,
    letterSpacing: 0.7,
  },
  title: {
    fontFamily: F.mathMed,
    fontSize: 34,
    color: C.foreground,
    letterSpacing: -0.6,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: F.mathItalic,
    fontSize: 15.5,
    lineHeight: 22,
    color: C.mutedFg,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: C.card,
    borderRadius: 8,
    padding: 22,
    borderWidth: 1,
    borderColor: C.border,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: C.muted,
    borderRadius: 6,
    padding: 3,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: C.border,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 4,
  },
  tabButtonActive: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
  },
  tabButtonText: {
    fontFamily: F.uiMed,
    fontSize: 12.5,
    color: C.mutedFg,
  },
  tabButtonTextActive: {
    fontFamily: F.uiSemi,
    color: C.foreground,
  },
  errorBanner: {
    backgroundColor: C.flawSoft,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(185, 28, 28, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 14,
  },
  errorText: {
    fontFamily: F.uiMed,
    fontSize: 12,
    color: C.flaw,
    lineHeight: 17,
  },
  form: {
    gap: 14,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontFamily: F.monoMed,
    fontSize: 9.5,
    letterSpacing: 0.6,
    color: C.mutedFg,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.background,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 6,
    paddingHorizontal: 12,
    height: 46,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontFamily: F.ui,
    fontSize: 14,
    color: C.foreground,
    height: '100%',
  },
  eyeButton: {
    padding: 4,
  },
  submitButton: {
    backgroundColor: C.slateDeep,
    borderRadius: 6,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonText: {
    fontFamily: F.uiSemi,
    fontSize: 13.5,
    color: C.primaryFg,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 10,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: C.borderLight,
  },
  dividerText: {
    fontFamily: F.mono,
    fontSize: 9.5,
    color: C.mutedFg,
    letterSpacing: 0.8,
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.background,
    height: 42,
  },
  demoButtonText: {
    fontFamily: F.uiSemi,
    fontSize: 12.5,
    color: C.primary,
  },
  guestButton: {
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 4,
  },
  guestButtonText: {
    fontFamily: F.uiMed,
    fontSize: 12,
    color: C.mutedFg,
    textDecorationLine: 'underline',
  },
  featuresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 14,
    marginTop: 22,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  featureText: {
    fontFamily: F.mono,
    fontSize: 10.5,
    color: C.mutedFg,
  },
});
