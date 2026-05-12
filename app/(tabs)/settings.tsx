import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/context/AuthContext';

type Row = { icon: string; label: string; value?: string; onPress?: () => void; danger?: boolean; toggle?: boolean; toggled?: boolean; onToggle?: (v: boolean) => void };

export default function SettingsScreen() {
  const { color, isDarkMode, toggleIsDarkMode } = useTheme();
  const { user, signOut } = useAuth();
  const s = styles(color);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  const sections: { title: string; rows: Row[] }[] = [
    {
      title: 'Account',
      rows: [
        { icon: 'person-outline',    label: 'Profile',        value: user?.displayName ?? 'Edit profile',       onPress: () => {} },
        { icon: 'mail-outline',      label: 'Email',          value: user?.email ?? '',                         onPress: () => {} },
        { icon: 'shield-checkmark-outline', label: 'Security', value: 'Password & 2FA',                        onPress: () => {} },
      ],
    },
    {
      title: 'Preferences',
      rows: [
        { icon: 'moon-outline',      label: 'Dark Mode',   toggle: true, toggled: isDarkMode, onToggle: () => toggleIsDarkMode() },
        { icon: 'notifications-outline', label: 'Notifications', value: 'Enabled',           onPress: () => {} },
        { icon: 'language-outline',  label: 'Language',    value: 'English',                  onPress: () => {} },
      ],
    },
    {
      title: 'CRM',
      rows: [
        { icon: 'funnel-outline',    label: 'Pipeline Stages', value: '6 stages',      onPress: () => {} },
        { icon: 'people-outline',    label: 'Team Members',    value: '8 members',     onPress: () => {} },
        { icon: 'sync-outline',      label: 'Integrations',    value: 'Gmail, Slack',  onPress: () => {} },
      ],
    },
    {
      title: 'Support',
      rows: [
        { icon: 'help-circle-outline',  label: 'Help Center',    onPress: () => {} },
        { icon: 'chatbubble-outline',   label: 'Contact Support', onPress: () => {} },
        { icon: 'information-circle-outline', label: 'About',    value: 'v1.0.0',      onPress: () => {} },
      ],
    },
  ];

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
        <Text style={s.pageTitle}>Settings</Text>

        {/* Profile Card */}
        <View style={s.profileCard}>
          <View style={s.profileAvatar}>
            <Text style={s.profileAvatarText}>
              {user?.displayName?.split(' ').map(n => n[0]).join('') ?? 'JD'}
            </Text>
          </View>
          <View>
            <Text style={s.profileName}>{user?.displayName ?? 'John Doe'}</Text>
            <Text style={s.profileEmail}>{user?.email ?? 'john@salemate.com'}</Text>
            {!user?.emailVerified && (
              <View style={s.unverifiedBadge}>
                <Ionicons name="warning-outline" size={12} color={color.warning} />
                <Text style={s.unverifiedText}>Email not verified</Text>
              </View>
            )}
          </View>
        </View>

        {/* Sections */}
        {sections.map(section => (
          <View key={section.title} style={s.section}>
            <Text style={s.sectionTitle}>{section.title}</Text>
            <View style={s.sectionCard}>
              {section.rows.map((row, i) => (
                <TouchableOpacity
                  key={row.label}
                  style={[s.row, i < section.rows.length - 1 && s.rowBorder]}
                  onPress={row.onPress}
                  activeOpacity={row.toggle ? 1 : 0.7}
                  disabled={row.toggle}
                >
                  <View style={s.rowLeft}>
                    <View style={s.rowIconBox}>
                      <Ionicons name={row.icon as any} size={18} color={color.accent} />
                    </View>
                    <Text style={s.rowLabel}>{row.label}</Text>
                  </View>
                  <View style={s.rowRight}>
                    {row.value && <Text style={s.rowValue} numberOfLines={1}>{row.value}</Text>}
                    {row.toggle
                      ? <Switch value={row.toggled} onValueChange={row.onToggle} trackColor={{ true: color.accent }} />
                      : <Ionicons name="chevron-forward" size={16} color={color.textMuted} />}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Sign Out */}
        <TouchableOpacity style={s.signOutBtn} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color={color.danger} />
          <Text style={[s.signOutText, { color: color.danger }]}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = (color: any) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: color.bg },
  content: { padding: 16, paddingBottom: 40 },
  pageTitle: { fontSize: 26, fontWeight: '700', color: color.text, marginBottom: 20 },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: color.card, borderRadius: 20, borderWidth: 1, borderColor: color.border, padding: 18, marginBottom: 24 },
  profileAvatar: { width: 56, height: 56, borderRadius: 16, backgroundColor: color.accent, justifyContent: 'center', alignItems: 'center' },
  profileAvatarText: { color: '#fff', fontWeight: '700', fontSize: 20 },
  profileName: { fontSize: 17, fontWeight: '700', color: color.text },
  profileEmail: { fontSize: 13, color: color.textMuted, marginTop: 2 },
  unverifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, backgroundColor: color.warningBg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start' },
  unverifiedText: { fontSize: 11, color: color.warning, fontWeight: '600' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: color.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionCard: { backgroundColor: color.card, borderRadius: 16, borderWidth: 1, borderColor: color.border, overflow: 'hidden' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: color.border },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowIconBox: { width: 34, height: 34, borderRadius: 10, backgroundColor: color.infoBg, justifyContent: 'center', alignItems: 'center' },
  rowLabel: { fontSize: 15, color: color.text, fontWeight: '500' },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 8, maxWidth: '45%' },
  rowValue: { fontSize: 13, color: color.textMuted },
  signOutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: color.dangerBg, borderRadius: 16, height: 54, marginTop: 8 },
  signOutText: { fontSize: 16, fontWeight: '700' },
});