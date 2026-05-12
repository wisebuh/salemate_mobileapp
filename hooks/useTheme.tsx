import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ColorScheme {
  bg: string;
  text: string;
  textMuted: string;
  border: string;
  card: string;
  navBg: string;
  accent: string;
  accentText: string;
  success: string;
  successBg: string;
  warning: string;
  warningBg: string;
  danger: string;
  dangerBg: string;
  info: string;
  infoBg: string;
  inputBg: string;
  inputBorder: string;
  inputFocus: string;
  overlay: string;
  modalBg: string;
  modalBorder: string;
  btnPrimary: string;
  btnPrimaryText: string;
  tabBar: string;
  tabBarBorder: string;
  tabBarActive: string;
  tabBarInactive: string;
  tableHeader: string;
  tableBorder: string;
  stageProspecting: string;
  stageQualification: string;
  stageProposal: string;
  stageNegotiation: string;
  stageClosedWon: string;
  stageClosedLost: string;
  priorityHigh: string;
  priorityHighBg: string;
  priorityMedium: string;
  priorityMediumBg: string;
  priorityLow: string;
  priorityLowBg: string;
}

interface ThemeContextType {
  isDarkMode: boolean;
  toggleIsDarkMode: () => void;
  color: ColorScheme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const lightColors: ColorScheme = {
  bg: '#ffffff',
  text: '#111827',
  textMuted: '#6b7280',
  border: '#e5e7eb',
  card: '#f9fafb',
  navBg: '#ffffff',
  accent: '#2563eb',
  accentText: '#2563eb',
  success: '#059669',
  successBg: 'rgba(16,185,129,0.1)',
  warning: '#d97706',
  warningBg: 'rgba(245,158,11,0.1)',
  danger: '#dc2626',
  dangerBg: 'rgba(239,68,68,0.1)',
  info: '#0891b2',
  infoBg: 'rgba(6,182,212,0.1)',
  inputBg: '#ffffff',
  inputBorder: '#e5e7eb',
  inputFocus: '#2563eb',
  overlay: 'rgba(0,0,0,0.5)',
  modalBg: '#ffffff',
  modalBorder: '#e5e7eb',
  btnPrimary: '#2563eb',
  btnPrimaryText: '#ffffff',
  tabBar: '#ffffff',
  tabBarBorder: '#e5e7eb',
  tabBarActive: '#2563eb',
  tabBarInactive: '#9ca3af',
  tableHeader: '#6b7280',
  tableBorder: '#e5e7eb',
  stageProspecting: '#8b5cf6',
  stageQualification: '#3b82f6',
  stageProposal: '#06b6d4',
  stageNegotiation: '#f59e0b',
  stageClosedWon: '#10b981',
  stageClosedLost: '#ef4444',
  priorityHigh: '#ef4444',
  priorityHighBg: 'rgba(239,68,68,0.1)',
  priorityMedium: '#f59e0b',
  priorityMediumBg: 'rgba(245,158,11,0.1)',
  priorityLow: '#6b7280',
  priorityLowBg: 'rgba(107,114,128,0.1)',
};

const darkColors: ColorScheme = {
  bg: '#030712',
  text: '#f3f4f6',
  textMuted: '#9ca3af',
  border: '#1f2937',
  card: '#111827',
  navBg: '#030712',
  accent: '#3b82f6',
  accentText: '#60a5fa',
  success: '#34d399',
  successBg: 'rgba(52,211,153,0.1)',
  warning: '#fbbf24',
  warningBg: 'rgba(251,191,36,0.1)',
  danger: '#f87171',
  dangerBg: 'rgba(248,113,113,0.1)',
  info: '#22d3ee',
  infoBg: 'rgba(34,211,238,0.1)',
  inputBg: '#111827',
  inputBorder: '#374151',
  inputFocus: '#3b82f6',
  overlay: 'rgba(0,0,0,0.7)',
  modalBg: '#111827',
  modalBorder: '#1f2937',
  btnPrimary: '#3b82f6',
  btnPrimaryText: '#ffffff',
  tabBar: '#030712',
  tabBarBorder: '#1f2937',
  tabBarActive: '#3b82f6',
  tabBarInactive: '#6b7280',
  tableHeader: '#9ca3af',
  tableBorder: '#1f2937',
  stageProspecting: '#a78bfa',
  stageQualification: '#60a5fa',
  stageProposal: '#22d3ee',
  stageNegotiation: '#fbbf24',
  stageClosedWon: '#34d399',
  stageClosedLost: '#f87171',
  priorityHigh: '#f87171',
  priorityHighBg: 'rgba(248,113,113,0.1)',
  priorityMedium: '#fbbf24',
  priorityMediumBg: 'rgba(251,191,36,0.1)',
  priorityLow: '#9ca3af',
  priorityLowBg: 'rgba(156,163,175,0.1)',
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('dark-mode').then((val) => {
      if (val === 'true') setIsDarkMode(true);
      setMounted(true);
    });
  }, []);

  const toggleIsDarkMode = async () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    await AsyncStorage.setItem('dark-mode', String(next));
  };

  const color = isDarkMode ? darkColors : lightColors;

  if (!mounted) return null;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleIsDarkMode, color }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}