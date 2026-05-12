import { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

type DocType = 'pdf' | 'doc' | 'xls' | 'ppt' | 'img';

const DOCS: { id: string; name: string; type: DocType; size: string; date: string; deal: string }[] = [
  { id: '1', name: 'Acme Corp Proposal Q2.pdf',       type: 'pdf', size: '2.4 MB', date: 'Today',       deal: 'Acme Corp'     },
  { id: '2', name: 'TechFlow Contract Draft.docx',    type: 'doc', size: '840 KB', date: 'Yesterday',   deal: 'TechFlow Inc'  },
  { id: '3', name: 'Revenue Forecast 2024.xlsx',      type: 'xls', size: '1.1 MB', date: 'May 8',       deal: 'Internal'      },
  { id: '4', name: 'Product Demo Deck.pptx',          type: 'ppt', size: '5.2 MB', date: 'May 6',       deal: 'Nexus Labs'    },
  { id: '5', name: 'Global Retail NDA.pdf',           type: 'pdf', size: '320 KB', date: 'May 3',       deal: 'Global Retail' },
  { id: '6', name: 'Summit Health SOW.docx',          type: 'doc', size: '680 KB', date: 'Apr 30',      deal: 'Summit Health' },
  { id: '7', name: 'Q1 Pipeline Report.xlsx',         type: 'xls', size: '900 KB', date: 'Apr 28',      deal: 'Internal'      },
];

const TYPE_META: Record<DocType, { icon: string; color: string; bg: string }> = {
  pdf: { icon: 'document-text',  color: '#ef4444', bg: 'rgba(239,68,68,0.1)'   },
  doc: { icon: 'document',       color: '#2563eb', bg: 'rgba(37,99,235,0.1)'   },
  xls: { icon: 'grid',           color: '#059669', bg: 'rgba(5,150,105,0.1)'   },
  ppt: { icon: 'easel',          color: '#f59e0b', bg: 'rgba(245,158,11,0.1)'  },
  img: { icon: 'image',          color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)'  },
};

const FILTERS = ['All', 'PDF', 'DOC', 'XLS', 'PPT'];

export default function DocumentsScreen() {
  const { color } = useTheme();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const s = styles(color);

  const filtered = DOCS.filter(d => {
    const matchQuery = d.name.toLowerCase().includes(query.toLowerCase()) || d.deal.toLowerCase().includes(query.toLowerCase());
    const matchFilter = filter === 'All' || d.type.toUpperCase() === filter;
    return matchQuery && matchFilter;
  });

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.title}>Documents</Text>
        <TouchableOpacity style={s.addBtn}>
          <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={s.searchWrap}>
        <Ionicons name="search-outline" size={18} color={color.textMuted} style={s.searchIcon} />
        <TextInput style={s.searchInput} placeholder="Search documents..." placeholderTextColor={color.textMuted}
          value={query} onChangeText={setQuery} />
        {!!query && <TouchableOpacity onPress={() => setQuery('')}><Ionicons name="close-circle" size={18} color={color.textMuted} /></TouchableOpacity>}
      </View>

      <View style={s.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity key={f} onPress={() => setFilter(f)}
            style={[s.filterChip, filter === f && { backgroundColor: color.accent, borderColor: color.accent }]}>
            <Text style={[s.filterText, filter === f && { color: '#fff' }]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const meta = TYPE_META[item.type];
          return (
            <TouchableOpacity style={s.card} activeOpacity={0.85}>
              <View style={[s.iconBox, { backgroundColor: meta.bg }]}>
                <Ionicons name={meta.icon as any} size={22} color={meta.color} />
              </View>
              <View style={s.info}>
                <Text style={s.docName} numberOfLines={1}>{item.name}</Text>
                <Text style={s.docMeta}>{item.deal} · {item.size} · {item.date}</Text>
              </View>
              <TouchableOpacity style={s.moreBtn}>
                <Ionicons name="ellipsis-vertical" size={18} color={color.textMuted} />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = (color: any) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: color.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 20, paddingBottom: 12 },
  title: { fontSize: 26, fontWeight: '700', color: color.text },
  addBtn: { width: 42, height: 42, borderRadius: 12, backgroundColor: color.accent, justifyContent: 'center', alignItems: 'center' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: color.card, borderWidth: 1, borderColor: color.border, borderRadius: 14, marginHorizontal: 16, paddingHorizontal: 14, marginBottom: 12 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: 46, color: color.text, fontSize: 14 },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 14 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: color.card, borderWidth: 1, borderColor: color.border },
  filterText: { fontSize: 13, fontWeight: '600', color: color.textMuted },
  list: { paddingHorizontal: 16, paddingBottom: 32 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: color.card, borderRadius: 16, borderWidth: 1, borderColor: color.border, padding: 14, marginBottom: 10 },
  iconBox: { width: 46, height: 46, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  info: { flex: 1 },
  docName: { fontSize: 14, fontWeight: '600', color: color.text, marginBottom: 4 },
  docMeta: { fontSize: 12, color: color.textMuted },
  moreBtn: { padding: 4 },
});