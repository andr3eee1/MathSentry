import React, { useState } from 'react';
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
import { C, F, indigoShadow } from '@/theme';
import { useAuth } from '@/context/AuthContext';
import { showToast } from '@/components/ToastHelper';

interface AuthSheetProps {
  visible: boolean;
  onClose: () => void;
}

export const AuthSheet: React.FC<AuthSheetProps> = ({ visible, onClose }) => {
  const { login, register, isLoading } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async () => {
    setErrorMsg(null);
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Vă rugăm să completați toate câmpurile obligatorii.');
      return;
    }

    try {
      if (tab === 'login') {
        await login(email.trim(), password.trim());
        showToast('Autentificare reușită!', 'done', 'success');
        onClose();
      } else {
        if (!username.trim()) {
          setErrorMsg('Introduceți numele complet.');
          return;
        }
        await register(email.trim(), password.trim(), username.trim());
        showToast('Cont creat cu succes!', 'done', 'success');
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'A apărut o eroare la autentificare.');
      showToast(err.message || 'Eroare autentificare', 'error', 'error');
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
        <View style={[styles.card, indigoShadow]}>
          {/* Header Close Button */}
          <Pressable onPress={onClose} hitSlop={10} style={styles.closeBtn}>
            <X size={20} color={C.mutedFg} strokeWidth={2} />
          </Pressable>

          {/* Title */}
          <Text style={styles.title}>MathSentry</Text>
          <Text style={styles.subtitle}>
            Platforma de evaluare olimpică a raționamentelor matematice
          </Text>

          {/* Tabs */}
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
                Cont Nou
              </Text>
            </Pressable>
          </View>

          {/* Error Banner */}
          {errorMsg && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          {/* Form Fields */}
          <View style={styles.form}>
            {tab === 'register' && (
              <View style={styles.inputWrapper}>
                <UserIcon size={16} color={C.mutedFg} strokeWidth={2} style={styles.inputIcon} />
                <TextInput
                  placeholder="Nume Prenume (ex: Andrei Popescu)"
                  placeholderTextColor={C.mutedFg}
                  value={username}
                  onChangeText={setUsername}
                  style={styles.input}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.inputWrapper}>
              <Mail size={16} color={C.mutedFg} strokeWidth={2} style={styles.inputIcon} />
              <TextInput
                placeholder="Email olimpic (ex: elev@onm.ro)"
                placeholderTextColor={C.mutedFg}
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Lock size={16} color={C.mutedFg} strokeWidth={2} style={styles.inputIcon} />
              <TextInput
                placeholder="Parolă (minim 6 caractere)"
                placeholderTextColor={C.mutedFg}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
              />
            </View>

            {/* Quick Demo Credential Autofill */}
            {tab === 'login' && (
              <Pressable
                onPress={() => {
                  setEmail('olimpic@mathsentry.ro');
                  setPassword('olimpiada2026');
                }}
                style={styles.demoAutofill}
              >
                <Text style={styles.demoAutofillText}>
                  Completează cu contul demonstrativ (olimpic@mathsentry.ro)
                </Text>
              </Pressable>
            )}

            {/* Submit Button */}
            <Pressable
              onPress={handleSubmit}
              disabled={isLoading}
              style={[styles.submitBtn, isLoading && { opacity: 0.7 }]}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitBtnText}>
                  {tab === 'login' ? 'Intră în Cont' : 'Creează Contul'}
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
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: C.card,
    borderRadius: 20,
    padding: 24,
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 18,
    right: 18,
    zIndex: 10,
    padding: 4,
  },
  title: {
    fontFamily: F.uiBold,
    fontSize: 20,
    color: C.foreground,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: F.ui,
    fontSize: 12,
    color: C.mutedFg,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: C.muted,
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  tabBtnInactive: {
    backgroundColor: 'transparent',
  },
  tabText: {
    fontFamily: F.uiMed,
    fontSize: 13,
    color: C.mutedFg,
  },
  tabTextActive: {
    color: C.primary,
    fontFamily: F.uiSemi,
  },
  errorBanner: {
    backgroundColor: C.flawSoft,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    borderRadius: 8,
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
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: C.background,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontFamily: F.ui,
    fontSize: 14,
    color: C.foreground,
  },
  demoAutofill: {
    alignSelf: 'center',
    paddingVertical: 4,
  },
  demoAutofillText: {
    fontFamily: F.uiMed,
    fontSize: 11,
    color: C.primary,
    textDecorationLine: 'underline',
  },
  submitBtn: {
    backgroundColor: C.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  submitBtnText: {
    fontFamily: F.uiSemi,
    fontSize: 14,
    color: '#FFFFFF',
  },
});
