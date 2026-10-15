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
  LayoutAnimationConfig,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  Sparkles,
  Award,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { C, F, indigoShadow } from '@/theme';
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleModeChange = (newMode: 'login' | 'register') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMode(newMode);
    setErrorMsg(null);
  };

  const handleSubmit = async () => {
    setErrorMsg(null);

    // Validation
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
        showToast('Autentificare reușită!', 'done', 'success');
      } else {
        await register(cleanEmail, password, username.trim());
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showToast('Cont creat cu succes! Bine ai venit.', 'done', 'success');
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
      showToast('Autentificat ca Olimpic!', 'done', 'success');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Eroare la autentificarea demo.');
    } finally {
      setDemoLoading(false);
    }
  };

  const handleGuest = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    continueAsGuest();
    showToast('Mod Oaspete activat', 'done');
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
            paddingTop: Math.max(insets.top + 20, 40),
            paddingBottom: Math.max(insets.bottom + 24, 40),
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Header */}
        <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <ShieldCheck size={13} color={C.primary} strokeWidth={2.5} />
              <Text style={styles.badgeText}>AST ENGINE · ONM 2026</Text>
            </View>
          </View>

          <Text style={styles.title}>MathSentry</Text>
          <Text style={styles.subtitle}>
            Verificare Formală și Notare Automată a Demonstrațiilor de Olimpiadă
          </Text>
        </Animated.View>

        {/* Auth Card */}
        <Animated.View
          entering={FadeInUp.duration(600).delay(150)}
          style={[styles.card, indigoShadow]}
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
                Înregistrare
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
                <Text style={styles.label}>NUME ȘI PRENUME</Text>
                <View style={styles.inputWrapper}>
                  <UserIcon size={16} color={C.mutedFg} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="ex. Andrei Popescu"
                    placeholderTextColor="#94A3B8"
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
                <Mail size={16} color={C.mutedFg} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="nume@domeniu.ro"
                  placeholderTextColor="#94A3B8"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>PAROLĂ</Text>
              <View style={styles.inputWrapper}>
                <Lock size={16} color={C.mutedFg} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Minimum 6 caractere"
                  placeholderTextColor="#94A3B8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Pressable
                  onPress={() => setShowPassword((p) => !p)}
                  hitSlop={8}
                  style={styles.eyeButton}
                >
                  {showPassword ? (
                    <EyeOff size={16} color={C.mutedFg} />
                  ) : (
                    <Eye size={16} color={C.mutedFg} />
                  )}
                </Pressable>
              </View>
            </View>

            {/* Primary Submit Button */}
            <Pressable
              onPress={handleSubmit}
              disabled={loading || demoLoading}
              style={({ pressed }) => [
                styles.submitButton,
                pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
                (loading || demoLoading) && { opacity: 0.7 },
              ]}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <View style={styles.buttonContent}>
                  <Text style={styles.submitButtonText}>
                    {mode === 'login'
                      ? 'Autentificare în MathSentry'
                      : 'Creează cont de Olimpic'}
                  </Text>
                  <ArrowRight size={16} color="#FFFFFF" strokeWidth={2.5} />
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

          {/* Demo Button */}
          <Pressable
            onPress={handleDemoLogin}
            disabled={loading || demoLoading}
            style={({ pressed }) => [
              styles.demoButton,
              pressed && { backgroundColor: C.indigoSoft },
              demoLoading && { opacity: 0.6 },
            ]}
          >
            {demoLoading ? (
              <ActivityIndicator size="small" color={C.primary} />
            ) : (
              <>
                <Award size={16} color={C.primary} strokeWidth={2} />
                <Text style={styles.demoButtonText}>
                  Intră cu Cont Demo Olimpic
                </Text>
              </>
            )}
          </Pressable>

          {/* Guest Mode Button */}
          <Pressable
            onPress={handleGuest}
            style={({ pressed }) => [
              styles.guestButton,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={styles.guestButtonText}>
              Continuă în mod Oaspete (fără cont)
            </Text>
          </Pressable>
        </Animated.View>

        {/* Footer Features */}
        <Animated.View
          entering={FadeInUp.duration(600).delay(300)}
          style={styles.featuresRow}
        >
          <View style={styles.featureItem}>
            <CheckCircle2 size={13} color={C.success} strokeWidth={2.5} />
            <Text style={styles.featureText}>Detecție erori în cascadă</Text>
          </View>
          <View style={styles.featureItem}>
            <CheckCircle2 size={13} color={C.success} strokeWidth={2.5} />
            <Text style={styles.featureText}>Scor adaptabil 0-100%</Text>
          </View>
          <View style={styles.featureItem}>
            <CheckCircle2 size={13} color={C.success} strokeWidth={2.5} />
            <Text style={styles.featureText}>Baze de date SQLite</Text>
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
    marginBottom: 24,
    maxWidth: 380,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: C.indigoSoft,
    borderWidth: 1,
    borderColor: 'rgba(91, 82, 242, 0.25)',
  },
  badgeText: {
    fontFamily: F.monoMed,
    fontSize: 10,
    color: C.primary,
    letterSpacing: 0.8,
  },
  title: {
    fontFamily: F.uiBold,
    fontSize: 32,
    color: C.slateDeep,
    letterSpacing: -0.8,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: F.math,
    fontSize: 16,
    lineHeight: 22,
    color: C.mutedFg,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: C.card,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: C.border,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: C.muted,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 9,
  },
  tabButtonActive: {
    backgroundColor: C.card,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  tabButtonText: {
    fontFamily: F.uiMed,
    fontSize: 13,
    color: C.mutedFg,
  },
  tabButtonTextActive: {
    fontFamily: F.uiSemi,
    color: C.foreground,
  },
  errorBanner: {
    backgroundColor: C.flawSoft,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  errorText: {
    fontFamily: F.uiMed,
    fontSize: 12,
    color: C.flaw,
    lineHeight: 17,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontFamily: F.uiSemi,
    fontSize: 10,
    letterSpacing: 0.8,
    color: C.mutedFg,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFCFE',
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
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
    backgroundColor: C.primary,
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonText: {
    fontFamily: F.uiSemi,
    fontSize: 14,
    color: '#FFFFFF',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    gap: 10,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: C.borderLight,
  },
  dividerText: {
    fontFamily: F.mono,
    fontSize: 10,
    color: C.mutedFg,
    letterSpacing: 1,
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(91, 82, 242, 0.4)',
    backgroundColor: 'rgba(91, 82, 242, 0.05)',
    height: 44,
  },
  demoButtonText: {
    fontFamily: F.uiSemi,
    fontSize: 13,
    color: C.primary,
  },
  guestButton: {
    alignItems: 'center',
    paddingVertical: 12,
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
    gap: 16,
    marginTop: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureText: {
    fontFamily: F.uiMed,
    fontSize: 11,
    color: C.mutedFg,
  },
});
