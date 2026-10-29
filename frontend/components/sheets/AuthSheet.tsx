import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { X, Lock, Mail, User as UserIcon } from 'lucide-react-native';
import { C, F } from '@/theme';
import { useAuth } from '@/context/AuthContext';
import { showToast } from '@/components/ToastHelper';

interface AuthSheetProps {
  visible: boolean;
  onClose: () => void;
}

export const AuthSheet: React.FC<AuthSheetProps> = ({ visible, onClose }) => {
  const { login, register, isGuest } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Guests usually open this sheet to save their work, so start on sign-up
  useEffect(() => {
    if (visible) {
      setTab(isGuest ? 'register' : 'login');
      setErrorMsg(null);
    }
  }, [visible, isGuest]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async () => {
    setErrorMsg(null);
    if (!email.trim() || !password) {
      setErrorMsg('Completați toate câmpurile obligatorii.');
      return;
    }
    if (tab === 'register' && password.length < 6) {
      setErrorMsg('Parola trebuie să aibă minimum 6 caractere.');
      return;
    }
    setIsLoading(true);
    try {
      if (tab === 'login') {
        await login(email.trim(), password);
        showToast('Autentificare reușită.', 'done', 'success');
        onClose();
      } else {
        if (!username.trim()) {
          setErrorMsg('Introduceți numele complet.');
          return;
        }
        await register(email.trim(), password, username.trim());
        showToast(
          isGuest ? 'Cont creat. Analizele tale au fost păstrate.' : 'Cont creat cu succes.',
          'done',
          'success'
        );
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'A apărut o eroare la autentificare.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Pressable onPress={onClose} hitSlop={10} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel="Închide">
            <X size={18} color={C.mutedFg} strokeWidth={2} />
          </Pressable>

          <Text style={styles.tag}>REGISTRUL OLIMPIC</Text>
          <Text style={styles.title}>MathSentry</Text>
          <Text style={styles.subtitle}>
            {isGuest
              ? 'Păstrează analizele făcute până acum și primește mai multe audituri pe zi.'
              : 'Sincronizează problemele și analizele pe toate dispozitivele.'}
          </Text>

          <View style={styles.tabContainer}>
            <Pressable
              onPress={() => {
                setTab('login');
                setErrorMsg(null);
              }}
              style={[
                styles.tabBtn,
                tab === 'login' ? styles.tabBtnActive : styles.tabBtnInactive,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  tab === 'login' && styles.tabTextActive,
                ]}
              >
                Autentificare
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setTab('register');
                setErrorMsg(null);
              }}
              style={[
                styles.tabBtn,
                tab === 'register' ? styles.tabBtnActive : styles.tabBtnInactive,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  tab === 'register' && styles.tabTextActive,
                ]}
              >
                Înregistrare
              </Text>
            </Pressable>
          </View>

          {errorMsg && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          <View style={styles.form}>
            {tab === 'register' && (
              <View style={styles.inputWrapper}>
                <UserIcon size={15} color={C.mutedFg} strokeWidth={2} style={styles.inputIcon} />
                <TextInput
                  placeholder="Nume și prenume"
                  placeholderTextColor={C.mutedFg}
                  value={username}
                  onChangeText={setUsername}
                  style={styles.input}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.inputWrapper}>
              <Mail size={15} color={C.mutedFg} strokeWidth={2} style={styles.inputIcon} />
              <TextInput
                placeholder="Email (ex: elev@onm.ro)"
                placeholderTextColor={C.mutedFg}
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Lock size={15} color={C.mutedFg} strokeWidth={2} style={styles.inputIcon} />
              <TextInput
                placeholder="Parolă (minimum 6 caractere)"
                placeholderTextColor={C.mutedFg}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
              />
            </View>

            <Pressable
              onPress={handleSubmit}
              disabled={isLoading}
              style={[styles.submitBtn, isLoading && { opacity: 0.7 }]}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={C.primaryFg} />
              ) : (
                <Text style={styles.submitBtnText}>
                  {tab === 'login' ? 'Deschide Contul' : 'Creează Contul'}
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(22, 22, 21, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 410,
    backgroundColor: C.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
    padding: 22,
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 4,
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
    fontSize: 22,
    color: C.foreground,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: F.ui,
    fontSize: 12,
    color: C.mutedFg,
    textAlign: 'center',
    marginTop: 3,
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: C.muted,
    borderRadius: 6,
    padding: 3,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
  },
  tabBtnInactive: {
    backgroundColor: 'transparent',
  },
  tabText: {
    fontFamily: F.uiMed,
    fontSize: 12.5,
    color: C.mutedFg,
  },
  tabTextActive: {
    color: C.foreground,
    fontFamily: F.uiSemi,
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
    fontSize: 12,
    color: C.flaw,
  },
  form: {
    gap: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 6,
    paddingHorizontal: 12,
    backgroundColor: C.background,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 11,
    fontFamily: F.ui,
    fontSize: 14,
    color: C.foreground,
  },
  demoAutofill: {
    alignSelf: 'center',
    paddingVertical: 4,
  },
  demoAutofillText: {
    fontFamily: F.mono,
    fontSize: 10.5,
    color: C.primary,
    textDecorationLine: 'underline',
  },
  submitBtn: {
    backgroundColor: C.slateDeep,
    borderRadius: 6,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  submitBtnText: {
    fontFamily: F.uiSemi,
    fontSize: 13.5,
    color: C.primaryFg,
  },
});
