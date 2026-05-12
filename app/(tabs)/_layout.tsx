import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

type TabConfig = {
  name: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
};

const tabs: TabConfig[] = [
  { name: 'index',     title: 'Dashboard', icon: 'grid-outline',          activeIcon: 'grid' },
  { name: 'sales',     title: 'Sales',     icon: 'briefcase-outline',      activeIcon: 'briefcase' },
  { name: 'reports',   title: 'Reports',   icon: 'bar-chart-outline',      activeIcon: 'bar-chart' },
  { name: 'contacts',  title: 'Contacts',  icon: 'people-outline',         activeIcon: 'people' },
  { name: 'documents', title: 'Docs',      icon: 'document-text-outline',  activeIcon: 'document-text' },
  { name: 'settings',  title: 'Settings',  icon: 'settings-outline',       activeIcon: 'settings' },
];

export default function MainLayout() {
  const { color } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: color.tabBar,
          borderTopColor: color.tabBarBorder,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 10,
          paddingTop: 6,
        },
        tabBarActiveTintColor: color.tabBarActive,
        tabBarInactiveTintColor: color.tabBarInactive,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused, color: c }) => (
              <Ionicons name={focused ? tab.activeIcon : tab.icon} size={22} color={c} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}