import { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

const PERIODS = ['Week', 'Month', 'Quarter', 'Year'];

const metrics = [
  { label: 'Revenue',      value: '$124.5K', change: '+12.5%', up: true  },
  { label: 'Deals Closed', value: '24',      change: '+6',     up: true  },
  { label: 'Avg Deal',     value: '$5,188',  change: '-3.2%',  up: false },
  { label: 'Pipeline',     value: '$380K',   change: '+18%',   up: true  },
];

const bars = [
  { label: 'Jan', pct: 55 }, { label: 'Feb', pct: 70 }, { label: 'Mar', pct: 45 },
  { label: 'Apr', pct: 88 }, { label: 'May', pct: 78 }, { label: 'Jun', pct: 100 },
];

const topDeals = [
  { name: 'Enterprise SaaS Bundle',   value: '$42,000', rep: 'Alice Johnson' },
  { name: 'Cloud Migration Project',  value: '$35,500', rep: 'Bob Chen'      },
  { name: 'Annual Support Contract',  value: '$28,000', rep: 'Carol Davis'   },
  { name: 'Data Platform License',    value: '$22,000', rep: 'David Kim'     },
];

export default function ReportsScreen() {
  const { color } = useTheme();
  const [period, setPeriod] = useState('Month');
  const s = styles(color);

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
        <Text style={s.pageTitle}>Reports</Text>

        {/* Period Picker */}
        <View style={s.periodRow}>
          {PERIODS.map(p => (
            <TouchableOpacity key={p} onPress={() => setPeriod(p)}
              style={[s.periodChip, period === p && { backgroundColor: color.accent, borderColor: color.accent }]}>
              <Text style={[s.periodText, period === p && { color: '#fff' }]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Metrics Grid */}
        <View style={s.metricsGrid}>
          {metrics.map(m => (
            <View key={m.label} style={s.metricCard}>
              <Text style={s.metricValue}>{m.value}</Text>
              <Text style={s.metricLabel}>{m.label}</Text>
              <View style={[s.changeRow]}>
                <Ionicons name={m.up ? 'trending-up' : 'trending-down'} size={12} color={m.up ? color.success : color.danger} />
                <Text style={[s.metricChange, { color: m.up ? color.success : color.danger }]}>{m.change}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Bar Chart */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Revenue Trend</Text>
          <View style={s.chartWrap}>
            {bars.map(bar => (
              <View key={bar.label} style={s.barCol}>
                <View style={s.barTrack}>
                  <View style={[s.bar, { height: `${bar.pct}%` as any, backgroundColor: color.accent }]} />
                </View>
                <Text style={s.barLabel}>{bar.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Top Deals */}
        <View style={[s.card, { marginTop: 16 }]}>
          <Text style={s.cardTitle}>Top Deals</Text>
          {topDeals.map((deal, i) => (
            <View key={deal.name}
              style={[s.dealRow, i < topDeals.length - 1 && { borderBottomWidth: 1, borderBottomColor: color.border }]}>
              <View style={s.rankBadge}><Text style={s.rankText}>{i + 1}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.dealName}>{deal.name}</Text>
                <Text style={s.dealRep}>{deal.rep}</Text>
              </View>
              <Text style={s.dealValue}>{deal.value}</Text>
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
  pageTitle: { fontSize: 26, fontWeight: '700', color: color.text, marginBottom: 20 },
  periodRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  periodChip: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12, backgroundColor: color.card, borderWidth: 1, borderColor: color.border },
  periodText: { fontSize: 13, fontWeight: '700', color: color.textMuted },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  metricCard: { width: '47%', backgroundColor: color.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: color.border },
  metricValue: { fontSize: 22, fontWeight: '700', color: color.text, marginBottom: 4 },
  metricLabel: { fontSize: 12, color: color.textMuted, marginBottom: 8 },
  changeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metricChange: { fontSize: 12, fontWeight: '700' },
  card: { backgroundColor: color.card, borderRadius: 16, borderWidth: 1, borderColor: color.border, padding: 16 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: color.text, marginBottom: 16 },
  chartWrap: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 120 },
  barCol: { flex: 1, alignItems: 'center', height: '100%' },
  barTrack: { flex: 1, width: '100%', justifyContent: 'flex-end', backgroundColor: color.border, borderRadius: 6, overflow: 'hidden' },
  bar: { width: '100%', borderRadius: 6 },
  barLabel: { fontSize: 11, color: color.textMuted, marginTop: 6, fontWeight: '600' },
  dealRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  rankBadge: { width: 28, height: 28, borderRadius: 8, backgroundColor: color.infoBg, justifyContent: 'center', alignItems: 'center' },
  rankText: { fontSize: 13, fontWeight: '700', color: color.accent },
  dealName: { fontSize: 14, fontWeight: '600', color: color.text },
  dealRep: { fontSize: 12, color: color.textMuted, marginTop: 2 },
  dealValue: { fontSize: 14, fontWeight: '700', color: color.accent },
});