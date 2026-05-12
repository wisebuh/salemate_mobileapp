import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

export default function ForgotPasswordScreen() {
  const { color } = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!email) return;
    setLoading(true);
    // TODO: replace with your API call
    await new Promise(res => setTimeout(res, 1000));
    setLoading(false);
    setSent(true);
  };

  const s = styles(color);

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={s.inner}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={color.text} />
        </TouchableOpacity>

        <View style={s.iconCircle}>
          <Ionicons name="lock-open-outline" size={32} color={color.accent} />
        </View>

        <Text style={s.title}>Reset Password</Text>
        <Text style={s.subtitle}>
          Enter your email and we'll send you a link to reset your password.
        </Text>

        {sent ? (
          <View style={s.successBox}>
            <Ionicons name="checkmark-circle" size={22} color={color.success} />
            <View style={{ flex: 1 }}>
              <Text style={s.successTitle}>Email sent!</Text>
              <Text style={s.successSub}>Check your inbox for the reset link.</Text>
            </View>
          </View>
        ) : (
          <>
            <View style={s.inputWrap}>
              <Ionicons name="mail-outline" size={18} color={color.textMuted} style={s.inputIcon} />
              <TextInput
                style={s.input}
                placeholder="you@company.com"
                placeholderTextColor={color.textMuted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
            <TouchableOpacity
              style={[s.btn, !email && { opacity: 0.5 }]}
              onPress={handleReset}
              disabled={loading || !email}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={s.btnText}>Send Reset Link</Text>}
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity onPress={() => router.replace('/(auth)/login')} style={s.backToLogin}>
          <Ionicons name="arrow-back-outline" size={16} color={color.accentText} />
          <Text style={[s.backToLoginText, { color: color.accentText }]}>Back to Sign In</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = (color: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: color.bg },
  inner: { flex: 1, padding: 24, paddingTop: 56 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  iconCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: color.infoBg, justifyContent: 'center', alignItems: 'center', marginTop: 32, marginBottom: 28 },
  title: { fontSize: 28, fontWeight: '700', color: color.text, marginBottom: 10 },
  subtitle: { fontSize: 15, color: color.textMuted, marginBottom: 36, lineHeight: 22 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: color.inputBg, borderWidth: 1, borderColor: color.inputBorder, borderRadius: 14, paddingHorizontal: 14, marginBottom: 18 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, height: 50, color: color.text, fontSize: 15 },
  btn: { backgroundColor: color.accent, borderRadius: 14, height: 54, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  successBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, backgroundColor: color.successBg, borderRadius: 14, padding: 18, marginBottom: 20 },
  successTitle: { color: color.success, fontSize: 15, fontWeight: '700' },
  successSub: { color: color.success, fontSize: 13, marginTop: 2, opacity: 0.8 },
  backToLogin: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center', marginTop: 32 },
  backToLoginText: { fontSize: 15, fontWeight: '600' },
});
