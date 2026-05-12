import { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

const CONTACTS = [
  { id: '1', name: 'Alice Johnson',  company: 'Acme Corp',     email: 'alice@acme.com',      phone: '+1 555 0101', tag: 'Client'   },
  { id: '2', name: 'Bob Chen',       company: 'TechFlow Inc',  email: 'bob@techflow.com',    phone: '+1 555 0102', tag: 'Lead'     },
  { id: '3', name: 'Carol Davis',    company: 'Global Retail', email: 'carol@globalretail.com', phone: '+1 555 0103', tag: 'Client' },
  { id: '4', name: 'David Kim',      company: 'Nexus Labs',    email: 'david@nexuslabs.com', phone: '+1 555 0104', tag: 'Prospect' },
  { id: '5', name: 'Eva Martinez',   company: 'Summit Health', email: 'eva@summithealth.com', phone: '+1 555 0105', tag: 'Client'  },
  { id: '6', name: 'Frank Wilson',   company: 'Bright Media',  email: 'frank@brightmedia.com', phone: '+1 555 0106', tag: 'Lead'  },
  { id: '7', name: 'Grace Lee',      company: 'Delta Systems', email: 'grace@delta.com',     phone: '+1 555 0107', tag: 'Prospect' },
  { id: '8', name: 'Henry Brown',    company: 'Orbit Cloud',   email: 'henry@orbit.com',     phone: '+1 555 0108', tag: 'Client'  },
];

const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  Client:   { bg: 'rgba(16,185,129,0.1)',  text: '#059669' },
  Lead:     { bg: 'rgba(59,130,246,0.1)',  text: '#2563eb' },
  Prospect: { bg: 'rgba(245,158,11,0.1)', text: '#d97706' },
};

export default function ContactsScreen() {
  const { color } = useTheme();
  const [query, setQuery] = useState('');
  const s = styles(color);

  const filtered = CONTACTS.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.company.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.title}>Contacts</Text>
        <TouchableOpacity style={s.addBtn}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={s.searchWrap}>
        <Ionicons name="search-outline" size={18} color={color.textMuted} style={s.searchIcon} />
        <TextInput
          style={s.searchInput}
          placeholder="Search contacts..."
          placeholderTextColor={color.textMuted}
          value={query}
          onChangeText={setQuery}
        />
        {!!query && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={18} color={color.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <Text style={s.count}>{filtered.length} contacts</Text>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const tc = TAG_COLORS[item.tag] ?? { bg: color.card, text: color.textMuted };
          return (
            <TouchableOpacity style={s.card} activeOpacity={0.85}>
              <View style={s.avatar}>
                <Text style={s.avatarText}>{item.name.split(' ').map(n => n[0]).join('')}</Text>
              </View>
              <View style={s.info}>
                <View style={s.nameRow}>
                  <Text style={s.name}>{item.name}</Text>
                  <View style={[s.tag, { backgroundColor: tc.bg }]}>
                    <Text style={[s.tagText, { color: tc.text }]}>{item.tag}</Text>
                  </View>
                </View>
                <Text style={s.company}>{item.company}</Text>
                <View style={s.contactRow}>
                  <Ionicons name="mail-outline" size={12} color={color.textMuted} />
                  <Text style={s.contactText}>{item.email}</Text>
                </View>
              </View>
              <View style={s.actions}>
                <TouchableOpacity style={s.actionBtn}>
                  <Ionicons name="call-outline" size={18} color={color.accent} />
                </TouchableOpacity>
                <TouchableOpacity style={s.actionBtn}>
                  <Ionicons name="ellipsis-vertical" size={18} color={color.textMuted} />
                </TouchableOpacity>
              </View>
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
  count: { fontSize: 13, color: color.textMuted, paddingHorizontal: 16, marginBottom: 12 },
  list: { paddingHorizontal: 16, paddingBottom: 32 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: color.card, borderRadius: 16, borderWidth: 1, borderColor: color.border, padding: 14, marginBottom: 10 },
  avatar: { width: 46, height: 46, borderRadius: 14, backgroundColor: color.accent + '22', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontSize: 15, fontWeight: '700', color: color.accent },
  info: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  name: { fontSize: 15, fontWeight: '700', color: color.text },
  tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  tagText: { fontSize: 11, fontWeight: '700' },
  company: { fontSize: 13, color: color.textMuted, marginBottom: 4 },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  contactText: { fontSize: 12, color: color.textMuted },
  actions: { gap: 6 },
  actionBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: color.bg, borderWidth: 1, borderColor: color.border, justifyContent: 'center', alignItems: 'center' },
});