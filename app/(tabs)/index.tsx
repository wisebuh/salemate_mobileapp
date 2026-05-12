import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/context/AuthContext';

const stats = [
  { label: 'Revenue',     value: '$124.5K', change: '+12.5%', up: true,  icon: 'trending-up'   },
  { label: 'Active Deals', value: '38',     change: '+4',     up: true,  icon: 'briefcase'     },
  { label: 'Contacts',    value: '1,284',   change: '+8.2%',  up: true,  icon: 'people'        },
  { label: 'Win Rate',    value: '64%',     change: '-2.1%',  up: false, icon: 'trophy'        },
];

const recentDeals = [
  { name: 'Acme Corp',     value: '$24,000', stage: 'Proposal',      priority: 'high'   },
  { name: 'TechFlow Inc',  value: '$18,500', stage: 'Negotiation',   priority: 'medium' },
  { name: 'Global Retail', value: '$9,200',  stage: 'Qualification', priority: 'low'    },
  { name: 'Nexus Labs',    value: '$42,000', stage: 'Prospecting',   priority: 'high'   },
];

const activities = [
  { text: 'Call scheduled with Acme Corp',      time: '10 min ago', icon: 'call'           },
  { text: 'Proposal sent to TechFlow Inc',       time: '1 hr ago',  icon: 'mail'           },
  { text: 'Deal closed with Bright Media',       time: '3 hrs ago', icon: 'checkmark-circle'},
  { text: 'New contact: Sarah Johnson added',    time: '5 hrs ago', icon: 'person-add'     },
];

export default function DashboardScreen() {
  const { color } = useTheme();
  const s = styles(color);
  const { user } = useAuth();
  const priorityColor = (p: string) => ({
    high:   { bg: color.priorityHighBg,   text: color.priorityHigh   },
    medium: { bg: color.priorityMediumBg, text: color.priorityMedium },
    low:    { bg: color.priorityLowBg,    text: color.priorityLow    },
  }[p] ?? { bg: color.card, text: color.textMuted });

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>Good morning 👋</Text>
            <Text style={s.name}>{user?.displayName || 'John Doe'}</Text>
          </View>
          <View style={s.avatar}>
            <Text style={s.avatarText}>JD</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <Text style={s.sectionTitle}>Overview</Text>
        <View style={s.statsGrid}>
          {stats.map((stat) => (
            <View key={stat.label} style={s.statCard}>
              <View style={s.statTop}>
                <View style={s.statIconBox}>
                  <Ionicons name={stat.icon as any} size={18} color={color.accent} />
                </View>
                <Text style={[s.statChange, { color: stat.up ? color.success : color.danger }]}>
                  {stat.change}
                </Text>
              </View>
              <Text style={s.statValue}>{stat.value}</Text>
              <Text style={s.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Recent Deals */}
        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>Recent Deals</Text>
          <TouchableOpacity><Text style={s.seeAll}>See all</Text></TouchableOpacity>
        </View>
        <View style={s.card}>
          {recentDeals.map((deal, i) => {
            const pc = priorityColor(deal.priority);
            return (
              <View key={deal.name} style={[s.dealRow, i < recentDeals.length - 1 && s.rowBorder]}>
                <View style={s.dealLeft}>
                  <View style={s.dealAvatar}>
                    <Text style={s.dealAvatarText}>{deal.name[0]}</Text>
                  </View>
                  <View>
                    <Text style={s.dealName}>{deal.name}</Text>
                    <Text style={s.dealStage}>{deal.stage}</Text>
                  </View>
                </View>
                <View style={s.dealRight}>
                  <Text style={s.dealValue}>{deal.value}</Text>
                  <View style={[s.badge, { backgroundColor: pc.bg }]}>
                    <Text style={[s.badgeText, { color: pc.text }]}>{deal.priority}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Activity Feed */}
        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>Recent Activity</Text>
        </View>
        <View style={s.card}>
          {activities.map((act, i) => (
            <View key={i} style={[s.actRow, i < activities.length - 1 && s.rowBorder]}>
              <View style={s.actIcon}>
                <Ionicons name={act.icon as any} size={16} color={color.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.actText}>{act.text}</Text>
                <Text style={s.actTime}>{act.time}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = (color: any) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: color.bg },
  content: { padding: 16, paddingBottom: 32 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  greeting: { fontSize: 13, color: color.textMuted },
  name: { fontSize: 22, fontWeight: '700', color: color.text },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: color.accent, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: color.text },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 12 },
  seeAll: { fontSize: 13, color: color.accentText, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 },
  statCard: { width: '47%', backgroundColor: color.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: color.border },
  statTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  statIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: color.infoBg, justifyContent: 'center', alignItems: 'center' },
  statChange: { fontSize: 12, fontWeight: '700' },
  statValue: { fontSize: 22, fontWeight: '700', color: color.text, marginBottom: 4 },
  statLabel: { fontSize: 12, color: color.textMuted },
  card: { backgroundColor: color.card, borderRadius: 16, borderWidth: 1, borderColor: color.border, overflow: 'hidden' },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: color.border },
  dealRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  dealLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dealAvatar: { width: 38, height: 38, borderRadius: 10, backgroundColor: color.infoBg, justifyContent: 'center', alignItems: 'center' },
  dealAvatarText: { color: color.accent, fontWeight: '700', fontSize: 15 },
  dealName: { fontSize: 14, fontWeight: '600', color: color.text },
  dealStage: { fontSize: 12, color: color.textMuted, marginTop: 2 },
  dealRight: { alignItems: 'flex-end', gap: 6 },
  dealValue: { fontSize: 14, fontWeight: '700', color: color.text },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  actRow: { flexDirection: 'row', alignItems: 'flex-start', padding: 14, gap: 12 },
  actIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: color.infoBg, justifyContent: 'center', alignItems: 'center' },
  actText: { fontSize: 13, color: color.text, fontWeight: '500', lineHeight: 18 },
  actTime: { fontSize: 12, color: color.textMuted, marginTop: 3 },
});