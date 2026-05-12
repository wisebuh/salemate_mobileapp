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
  createUserWithEmailAndPassword, updateProfile, sendEmailVerification,
  GoogleAuthProvider, signInWithCredential,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useTheme } from '@/hooks/useTheme';

WebBrowser.maybeCompleteAuthSession();

type Country = { name: string; dial_code: string; code: string; flag: string };
const toFlag = (code: string) =>
  code.toUpperCase().replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt(0)));

function firebaseError(code: string): string {
  const map: Record<string, string> = {
    'auth/email-already-in-use':   'An account with this email already exists.',
    'auth/invalid-email':          'Please enter a valid email address.',
    'auth/weak-password':          'Password must be at least 6 characters.',
    'auth/network-request-failed': 'Network error. Check your connection.',
    'auth/account-exists-with-different-credential': 'Account exists with this email under a different sign-in method.',
  };
  return map[code] ?? 'Something went wrong. Please try again.';
}

export default function SignupScreen() {
  const { color } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [verifyEmail, setVerifyEmail] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [countryLoading, setCountryLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('https://countriesnow.space/api/v0.1/countries/codes');
        const json = await res.json();
        const parsed: Country[] = (json.data as any[])
          .filter(c => c.dial_code)
          .map(c => ({ name: c.name, dial_code: c.dial_code, code: c.code, flag: toFlag(c.code) }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setCountries(parsed);
        setSelectedCountry(parsed.find(c => c.code === 'NG') ?? parsed[0]);
      } catch {
        const fallback = { name: 'Nigeria', dial_code: '+234', code: 'NG', flag: String.fromCodePoint(127475, 127468) };
        setCountries([fallback]);
        setSelectedCountry(fallback);
      } finally {
        setCountryLoading(false);
      }
    })();
  }, []);

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
      await setDoc(doc(db, 'users', result.user.uid), {
        name:      result.user.displayName,
        email:     result.user.email,
        photoURL:  result.user.photoURL,
        phone: result.user.phoneNumber,
        provider:  'google',
        createdAt: new Date().toISOString(),
      }, { merge: true });
      // onAuthStateChanged in AuthContext handles redirect automatically
    } catch (err: any) {
      setError(firebaseError(err.code));
    } finally {
      setGoogleLoading(false);
    }
  };

  // ── Email/password signup ──────────────────────────────────────────────────
  const handleSignup = async () => {
    if (!name || !email || !password || !phone) { setError('Please fill in all fields'); return; }
    if (password !== confirmPassword) { setError("Passwords don't match."); return; }
    setLoading(true); setError('');
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, { displayName: name });
      await setDoc(doc(db, 'users', user.uid), {
        name, email,
        phone: `${selectedCountry?.dial_code ?? ''}${phone}`,
        createdAt: new Date().toISOString(),
      }, { merge: true });
      await sendEmailVerification(user);
      setVerifyEmail(true);
    } catch (err: any) {
      setError(firebaseError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch    = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const s = styles(color);

  // ── Email verification screen ──────────────────────────────────────────────
  if (verifyEmail) {
    return (
      <View style={[s.container, s.centered]}>
        <View style={s.verifyIconBox}>
          <Ionicons name="mail-unread-outline" size={36} color={color.accent} />
        </View>
        <Text style={s.title}>Check your inbox</Text>
        <Text style={s.subtitle}>We sent a verification link to</Text>
        <Text style={[s.subtitle, { color: color.text, fontWeight: '600', marginBottom: 20 }]}>{email}</Text>
        <Text style={[s.subtitle, { fontSize: 12, marginBottom: 32 }]}>
          Tap the link in the email to activate your account. Check spam too.
        </Text>
        <ResendButton color={color} />
        <Link href="/(auth)/login" style={[s.linkText, { textAlign: 'center', marginTop: 28 }]}>
          Already verified? Sign in
        </Link>
      </View>
    );
  }

  // ── Signup form ────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

        <View style={s.logoRow}>
          <View style={s.logoBox}><Ionicons name="trending-up" size={28} color="#fff" /></View>
          <Text style={s.logoText}>SaleMate</Text>
        </View>
        <Text style={s.title}>Create account</Text>
        <Text style={s.subtitle}>Start closing more deals today</Text>

        {!!error && (
          <View style={s.errorBox}>
            <Ionicons name="alert-circle" size={16} color={color.danger} />
            <Text style={s.errorText}>{error}</Text>
          </View>
        )}

        {/* ── Google ── */}
        <TouchableOpacity
          style={[s.googleBtn, (!request || loading) && { opacity: 0.5 }]}
          onPress={() => { setGoogleLoading(true); promptAsync(); }}
          disabled={!request || loading || googleLoading}
          activeOpacity={0.8}
        >
          {googleLoading
            ? <ActivityIndicator color={color.text} size="small" />
            : <><GoogleLogo /><Text style={s.googleBtnText}>Continue with Google</Text></>}
        </TouchableOpacity>

        <View style={s.dividerRow}>
          <View style={s.dividerLine} />
          <Text style={s.dividerText}>or</Text>
          <View style={s.dividerLine} />
        </View>

        {/* Full Name */}
        <View style={s.fieldGroup}>
          <Text style={s.label}>Full name</Text>
          <View style={s.inputWrap}>
            <Ionicons name="person-outline" size={18} color={color.textMuted} style={s.inputIcon} />
            <TextInput style={s.input} placeholder="John Doe" placeholderTextColor={color.textMuted}
              value={name} onChangeText={t => { setName(t); setError(''); }} />
          </View>
        </View>

        {/* Email */}
        <View style={s.fieldGroup}>
          <Text style={s.label}>Email</Text>
          <View style={s.inputWrap}>
            <Ionicons name="mail-outline" size={18} color={color.textMuted} style={s.inputIcon} />
            <TextInput style={s.input} placeholder="you@company.com" placeholderTextColor={color.textMuted}
              value={email} onChangeText={t => { setEmail(t); setError(''); }}
              autoCapitalize="none" keyboardType="email-address" />
          </View>
        </View>

        {/* Phone */}
        <View style={s.fieldGroup}>
          <Text style={s.label}>Phone number</Text>
          <View style={s.phoneRow}>
            <TouchableOpacity style={s.dialBox} disabled={countryLoading}>
              <Text style={s.dialText}>
                {countryLoading ? '...' : `${selectedCountry?.flag ?? ''} ${selectedCountry?.dial_code ?? ''}`}
              </Text>
            </TouchableOpacity>
            <View style={[s.inputWrap, { flex: 1 }]}>
              <TextInput style={s.input} placeholder="8012345670" placeholderTextColor={color.textMuted}
                value={phone} onChangeText={t => { setPhone(t); setError(''); }} keyboardType="phone-pad" />
            </View>
          </View>
          {!!phone && !!selectedCountry && (
            <Text style={s.hintText}>Full: {selectedCountry.dial_code}{phone}</Text>
          )}
        </View>

        {/* Password */}
        <View style={s.fieldGroup}>
          <Text style={s.label}>Password</Text>
          <View style={s.inputWrap}>
            <Ionicons name="lock-closed-outline" size={18} color={color.textMuted} style={s.inputIcon} />
            <TextInput style={[s.input, { flex: 1 }]} placeholder="Min. 6 characters" placeholderTextColor={color.textMuted}
              value={password} onChangeText={t => { setPassword(t); setError(''); }} secureTextEntry={!showPassword} />
            <TouchableOpacity onPress={() => setShowPassword(p => !p)} style={s.eyeBtn}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={color.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirm Password */}
        <View style={s.fieldGroup}>
          <Text style={s.label}>Confirm password</Text>
          <View style={s.inputWrap}>
            <Ionicons name="lock-closed-outline" size={18} color={color.textMuted} style={s.inputIcon} />
            <TextInput style={[s.input, { flex: 1 }]} placeholder="Min. 6 characters" placeholderTextColor={color.textMuted}
              value={confirmPassword} onChangeText={t => { setConfirmPassword(t); setError(''); }} secureTextEntry={!showConfirm} />
            <TouchableOpacity onPress={() => setShowConfirm(p => !p)} style={s.eyeBtn}>
              <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={18} color={color.textMuted} />
            </TouchableOpacity>
          </View>
          {passwordsMatch    && <Text style={[s.matchText, { color: color.success }]}>Passwords match</Text>}
          {passwordsMismatch && <Text style={[s.matchText, { color: color.danger  }]}>Passwords do not match</Text>}
        </View>

        <TouchableOpacity
          style={[s.btn, (passwordsMismatch || googleLoading) && { opacity: 0.5 }]}
          onPress={handleSignup}
          disabled={loading || passwordsMismatch || googleLoading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Create Account</Text>}
        </TouchableOpacity>

        <View style={s.bottomRow}>
          <Text style={s.bottomText}>Already have an account? </Text>
          <Link href="/(auth)/login" style={s.linkText}>Sign in</Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function ResendButton({ color }: { color: any }) {
  const [cooldown, setCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0 || !auth.currentUser) return;
    setResendLoading(true); setMsg('');
    try {
      await sendEmailVerification(auth.currentUser);
      setMsg('Email resent!'); setCooldown(60);
    } catch { setMsg('Could not resend. Try again later.'); }
    finally { setResendLoading(false); }
  };

  return (
    <View style={{ width: '100%' }}>
      <TouchableOpacity disabled={cooldown > 0 || resendLoading}
        style={{ borderWidth: 1, borderColor: color.border, borderRadius: 14, height: 50, justifyContent: 'center', alignItems: 'center', opacity: cooldown > 0 ? 0.5 : 1 }}
        onPress={handleResend}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: color.text }}>
          {resendLoading ? 'Sending...' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend verification email'}
        </Text>
      </TouchableOpacity>
      {!!msg && <Text style={{ textAlign: 'center', marginTop: 8, fontSize: 13, color: color.success }}>{msg}</Text>}
    </View>
  );
}

// Official Google G logo via react-native-svg
function GoogleLogo({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <Path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v8.51h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.14z" />
      <Path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <Path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </Svg>
  );
}

const styles = (color: any) => StyleSheet.create({
  container:     { flex: 1, backgroundColor: color.bg },
  centered:      { justifyContent: 'center', alignItems: 'center', padding: 32 },
  scroll:        { flexGrow: 1, justifyContent: 'center', padding: 24 },
  verifyIconBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: color.infoBg, justifyContent: 'center', alignItems: 'center', marginBottom: 28 },
  logoRow:       { flexDirection: 'row', alignItems: 'center', marginBottom: 40 },
  logoBox:       { width: 48, height: 48, borderRadius: 14, backgroundColor: color.accent, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  logoText:      { fontSize: 26, fontWeight: '700', color: color.text },
  title:         { fontSize: 28, fontWeight: '700', color: color.text, marginBottom: 6 },
  subtitle:      { fontSize: 15, color: color.textMuted, marginBottom: 8 },
  errorBox:      { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: color.dangerBg, borderRadius: 12, padding: 14, marginBottom: 20 },
  errorText:     { color: color.danger, fontSize: 14, flex: 1 },
  googleBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, borderWidth: 1, borderColor: color.border, borderRadius: 14, height: 52, backgroundColor: color.card, marginBottom: 20 },
  googleBtnText: { fontSize: 15, fontWeight: '600', color: color.text },
  dividerRow:    { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  dividerLine:   { flex: 1, height: 1, backgroundColor: color.border },
  dividerText:   { fontSize: 13, color: color.textMuted },
  fieldGroup:    { marginBottom: 18 },
  label:         { fontSize: 14, fontWeight: '600', color: color.text, marginBottom: 8 },
  inputWrap:     { flexDirection: 'row', alignItems: 'center', backgroundColor: color.inputBg, borderWidth: 1, borderColor: color.inputBorder, borderRadius: 14, paddingHorizontal: 14 },
  inputIcon:     { marginRight: 10 },
  input:         { flex: 1, height: 50, color: color.text, fontSize: 15 },
  eyeBtn:        { padding: 6 },
  phoneRow:      { flexDirection: 'row', gap: 10 },
  dialBox:       { backgroundColor: color.inputBg, borderWidth: 1, borderColor: color.inputBorder, borderRadius: 14, paddingHorizontal: 14, justifyContent: 'center', height: 50 },
  dialText:      { fontSize: 14, color: color.text, fontWeight: '600' },
  hintText:      { fontSize: 12, color: color.textMuted, marginTop: 5 },
  matchText:     { fontSize: 12, marginTop: 5, fontWeight: '600' },
  btn:           { backgroundColor: color.accent, borderRadius: 14, height: 54, justifyContent: 'center', alignItems: 'center', marginBottom: 28, marginTop: 8 },
  btnText:       { color: '#fff', fontSize: 16, fontWeight: '700' },
  bottomRow:     { flexDirection: 'row', justifyContent: 'center' },
  bottomText:    { color: color.textMuted, fontSize: 14 },
  linkText:      { color: color.accentText, fontSize: 14, fontWeight: '700' },
});