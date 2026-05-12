import { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

const STAGES = ['All', 'Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won'];

const deals = [
  { id: '1', name: 'Acme Corp',      value: '$24,000', stage: 'Proposal',      priority: 'high',   contact: 'Jane Smith',  days: 5  },
  { id: '2', name: 'TechFlow Inc',   value: '$18,500', stage: 'Negotiation',   priority: 'medium', contact: 'Bob Lee',     days: 12 },
  { id: '3', name: 'Global Retail',  value: '$9,200',  stage: 'Qualification', priority: 'low',    contact: 'Amy Chen',    days: 3  },
  { id: '4', name: 'Nexus Labs',     value: '$42,000', stage: 'Prospecting',   priority: 'high',   contact: 'Mark Rivera', days: 1  },
  { id: '5', name: 'Bright Media',   value: '$15,800', stage: 'Closed Won',    priority: 'medium', contact: 'Lisa Park',   days: 20 },
  { id: '6', name: 'Summit Health',  value: '$31,000', stage: 'Proposal',      priority: 'high',   contact: 'Tom Harris',  days: 7  },
  { id: '7', name: 'Delta Systems',  value: '$8,400',  stage: 'Qualification', priority: 'low',    contact: 'Sara Kim',    days: 2  },
];

export default function SalesScreen() {
  const { color } = useTheme();
  const [activeStage, setActiveStage] = useState('All');
  const s = styles(color);

  const filtered = activeStage === 'All' ? deals : deals.filter(d => d.stage === activeStage);

  const stageColor = (stage: string): string => ({
    Prospecting:   color.stageProspecting,
    Qualification: color.stageQualification,
    Proposal:      color.stageProposal,
    Negotiation:   color.stageNegotiation,
    'Closed Won':  color.stageClosedWon,
    'Closed Lost': color.stageClosedLost,
  }[stage] ?? color.textMuted);

  const priorityColor = (p: string) => ({
    high:   { bg: color.priorityHighBg,   text: color.priorityHigh   },
    medium: { bg: color.priorityMediumBg, text: color.priorityMedium },
    low:    { bg: color.priorityLowBg,    text: color.priorityLow    },
  }[p] ?? { bg: color.card, text: color.textMuted });

  const totalValue = filtered.reduce((sum, d) => sum + parseInt(d.value.replace(/\D/g, '')), 0);

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.title}>Sales Pipeline</Text>
          <Text style={s.subtitle}>{filtered.length} deals · ${(totalValue / 1000).toFixed(0)}K total</Text>
        </View>
        <TouchableOpacity style={s.addBtn}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Stage Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filterRow}
      >
        {STAGES.map((stage) => (
          <TouchableOpacity
            key={stage}
            onPress={() => setActiveStage(stage)}
            style={[s.chip, activeStage === stage && { backgroundColor: color.accent, borderColor: color.accent }]}
          >
            {stage !== 'All' && (
              <View style={[s.chipDot, { backgroundColor: activeStage === stage ? '#ffffff88' : stageColor(stage) }]} />
            )}
            <Text style={[s.chipText, activeStage === stage && { color: '#fff' }]}>{stage}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Deals */}
      <ScrollView style={s.list} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {filtered.map((deal) => {
          const sc = stageColor(deal.stage);
          const pc = priorityColor(deal.priority);
          return (
            <TouchableOpacity key={deal.id} style={s.dealCard} activeOpacity={0.85}>
              <View style={s.dealTop}>
                <View style={{ flex: 1 }}>
                  <Text style={s.dealName}>{deal.name}</Text>
                  <Text style={s.dealContact}>{deal.contact}</Text>
                </View>
                <Text style={s.dealValue}>{deal.value}</Text>
              </View>
              <View style={s.dealBottom}>
                <View style={[s.stagePill, { backgroundColor: sc + '22' }]}>
                  <View style={[s.stageDot, { backgroundColor: sc }]} />
                  <Text style={[s.stageText, { color: sc }]}>{deal.stage}</Text>
                </View>
                <View style={s.dealMeta}>
                  <View style={[s.priorityBadge, { backgroundColor: pc.bg }]}>
                    <Text style={[s.priorityText, { color: pc.text }]}>{deal.priority}</Text>
                  </View>
                  <Text style={s.daysText}>{deal.days}d</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = (color: any) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: color.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 16, paddingTop: 20, paddingBottom: 16 },
  title: { fontSize: 26, fontWeight: '700', color: color.text },
  subtitle: { fontSize: 13, color: color.textMuted, marginTop: 2 },
  addBtn: { width: 42, height: 42, borderRadius: 12, backgroundColor: color.accent, justifyContent: 'center', alignItems: 'center' },
  filterRow: { paddingHorizontal: 16, gap: 8, paddingBottom: 16 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: color.card, borderWidth: 1, borderColor: color.border },
  chipDot: { width: 7, height: 7, borderRadius: 4 },
  chipText: { fontSize: 13, fontWeight: '600', color: color.textMuted },
  list: { flex: 1, paddingHorizontal: 16 },
  dealCard: { backgroundColor: color.card, borderRadius: 16, borderWidth: 1, borderColor: color.border, padding: 16, marginBottom: 12 },
  dealTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  dealName: { fontSize: 16, fontWeight: '700', color: color.text },
  dealContact: { fontSize: 13, color: color.textMuted, marginTop: 2 },
  dealValue: { fontSize: 17, fontWeight: '700', color: color.accent },
  dealBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stagePill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  stageDot: { width: 6, height: 6, borderRadius: 3 },
  stageText: { fontSize: 12, fontWeight: '600' },
  dealMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  priorityText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  daysText: { fontSize: 12, color: color.textMuted, fontWeight: '500' },
});