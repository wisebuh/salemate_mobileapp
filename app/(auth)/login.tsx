import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useTheme } from '@/hooks/useTheme';

WebBrowser.maybeCompleteAuthSession();

function firebaseError(code: string): string {
  const map: Record<string, string> = {
    'auth/user-not-found':        'No account found with this email.',
    'auth/wrong-password':        'Incorrect password.',
    'auth/invalid-email':         'Please enter a valid email address.',
    'auth/too-many-requests':     'Too many attempts. Try again later.',
    'auth/network-request-failed':'Network error. Check your connection.',
    'auth/invalid-credential':    'Invalid email or password.',
    'auth/account-exists-with-different-credential':
      'Account exists with this email under a different sign-in method.',
  };
  return map[code] ?? 'Something went wrong. Please try again.';
}

export default function LoginScreen() {
  const { color } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  // ── Google Auth ────────────────────────────────────────────────────────────
  const [request, response, promptAsync] = Google.useAuthRequest({
    // TODO: replace with your client IDs from Firebase Console
    // Project Settings → Your apps → Google Sign-In
    iosClientId:     process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID,
    webClientId:     process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleCredential(response.params.id_token);
    } else if (response?.type === 'error') {
      setError('Google sign-in failed. Please try again.');
      setGoogleLoading(false);
    } else if (response?.type === 'dismiss') {
      setGoogleLoading(false);
    }
  }, [response]);

  const handleGoogleCredential = async (idToken: string) => {
    setGoogleLoading(true);
    setError('');
    try {
      const credential = GoogleAuthProvider.credential(idToken);
      const result = await signInWithCredential(auth, credential);
      // Save/update Firestore doc in case it's a new Google user
      await setDoc(doc(db, 'users', result.user.uid), {
        name:      result.user.displayName,
        email:     result.user.email,
        photoURL:  result.user.photoURL,
        phone: result.user.phoneNumber,
        provider:  'google',
        lastLogin: new Date().toISOString(),
      }, { merge: true });
      // onAuthStateChanged in AuthContext handles redirect
    } catch (err: any) {
      setError(firebaseError(err.code));
    } finally {
      setGoogleLoading(false);
    }
  };

  // ── Email / Password ───────────────────────────────────────────────────────
  const handleLogin = async () => {
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true); setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged handles redirect
    } catch (err: any) {
      setError(firebaseError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const busy = loading || googleLoading;
  const s = styles(color);

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

        {/* Logo */}
        <View style={s.logoRow}>
          <View style={s.logoBox}>
            <Ionicons name="trending-up" size={28} color="#fff" />
          </View>
          <Text style={s.logoText}>SaleMate</Text>
        </View>

        <Text style={s.title}>Welcome back</Text>
        <Text style={s.subtitle}>Sign in to your account</Text>

        {/* Error */}
        {!!error && (
          <View style={s.errorBox}>
            <Ionicons name="alert-circle" size={16} color={color.danger} />
            <Text style={s.errorText}>{error}</Text>
          </View>
        )}

        {/* ── Google Button ── */}
        <TouchableOpacity
          style={[s.googleBtn, (!request || busy) && { opacity: 0.55 }]}
          onPress={() => { setGoogleLoading(true); promptAsync(); }}
          disabled={!request || busy}
          activeOpacity={0.8}
        >
          {googleLoading ? (
            <ActivityIndicator color={color.text} size="small" />
          ) : (
            <>
              <GoogleLogo size={20} />
              <Text style={s.googleBtnText}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Divider */}
        <View style={s.dividerRow}>
          <View style={s.dividerLine} />
          <Text style={s.dividerText}>or sign in with email</Text>
          <View style={s.dividerLine} />
        </View>

        {/* Email */}
        <View style={s.fieldGroup}>
          <Text style={s.label}>Email</Text>
          <View style={s.inputWrap}>
            <Ionicons name="mail-outline" size={18} color={color.textMuted} style={s.inputIcon} />
            <TextInput
              style={s.input}
              placeholder="you@company.com"
              placeholderTextColor={color.textMuted}
              value={email}
              onChangeText={t => { setEmail(t); setError(''); }}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!busy}
            />
          </View>
        </View>

        {/* Password */}
        <View style={s.fieldGroup}>
          <Text style={s.label}>Password</Text>
          <View style={s.inputWrap}>
            <Ionicons name="lock-closed-outline" size={18} color={color.textMuted} style={s.inputIcon} />
            <TextInput
              style={[s.input, { flex: 1 }]}
              placeholder="••••••••"
              placeholderTextColor={color.textMuted}
              value={password}
              onChangeText={t => { setPassword(t); setError(''); }}
              secureTextEntry={!showPassword}
              editable={!busy}
            />
            <TouchableOpacity onPress={() => setShowPassword(p => !p)} style={s.eyeBtn}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={color.textMuted}
              />
            </TouchableOpacity>
          </View>
        </View>

        <Link href="/(auth)/forgot-password" style={s.forgotLink}>
          Forgot password?
        </Link>

        {/* Sign In */}
        <TouchableOpacity
          style={[s.btn, busy && { opacity: 0.55 }]}
          onPress={handleLogin}
          disabled={busy}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.btnText}>Sign In</Text>}
        </TouchableOpacity>

        <View style={s.bottomRow}>
          <Text style={s.bottomText}>Don't have an account? </Text>
          <Link href="/(auth)/signup" style={s.linkText}>Sign up</Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ── Official Google G logo via react-native-svg ───────────────────────────────
function GoogleLogo({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <Path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v8.51h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.14z"
      />
      <Path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <Path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </Svg>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = (color: any) => StyleSheet.create({
  container:     { flex: 1, backgroundColor: color.bg },
  scroll:        { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logoRow:       { flexDirection: 'row', alignItems: 'center', marginBottom: 48 },
  logoBox:       { width: 48, height: 48, borderRadius: 14, backgroundColor: color.accent, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  logoText:      { fontSize: 26, fontWeight: '700', color: color.text },
  title:         { fontSize: 30, fontWeight: '700', color: color.text, marginBottom: 6 },
  subtitle:      { fontSize: 15, color: color.textMuted, marginBottom: 32 },
  errorBox:      { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: color.dangerBg, borderRadius: 12, padding: 14, marginBottom: 20 },
  errorText:     { color: color.danger, fontSize: 14, flex: 1 },
  googleBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, borderWidth: 1, borderColor: color.border, borderRadius: 14, height: 52, backgroundColor: color.card, marginBottom: 20 },
  googleBtnText: { fontSize: 15, fontWeight: '600', color: color.text },
  dividerRow:    { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 24 },
  dividerLine:   { flex: 1, height: 1, backgroundColor: color.border },
  dividerText:   { fontSize: 12, color: color.textMuted, flexShrink: 0 },
  fieldGroup:    { marginBottom: 18 },
  label:         { fontSize: 14, fontWeight: '600', color: color.text, marginBottom: 8 },
  inputWrap:     { flexDirection: 'row', alignItems: 'center', backgroundColor: color.inputBg, borderWidth: 1, borderColor: color.inputBorder, borderRadius: 14, paddingHorizontal: 14 },
  inputIcon:     { marginRight: 10 },
  input:         { flex: 1, height: 50, color: color.text, fontSize: 15 },
  eyeBtn:        { padding: 6 },
  forgotLink:    { alignSelf: 'flex-end', color: color.accentText, fontSize: 14, fontWeight: '600', marginBottom: 28 },
  btn:           { backgroundColor: color.accent, borderRadius: 14, height: 54, justifyContent: 'center', alignItems: 'center', marginBottom: 28 },
  btnText:       { color: '#fff', fontSize: 16, fontWeight: '700' },
  bottomRow:     { flexDirection: 'row', justifyContent: 'center' },
  bottomText:    { color: color.textMuted, fontSize: 14 },
  linkText:      { color: color.accentText, fontSize: 14, fontWeight: '700' },
});