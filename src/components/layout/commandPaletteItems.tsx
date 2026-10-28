import React from 'react';
import {
  LayoutDashboard,
  WalletCards,
  CalendarClock,
  Briefcase,
  Sparkles,
  Bot,
  Users,
  Moon,
  Sun,
  ShieldCheck,
  RefreshCw,
  Plus,
  IndianRupee,
  DollarSign,
  Download,
} from 'lucide-react';
import { EventWorkspaceState, ActiveTab } from '../../types/state';
import { Currency } from '../../types/event';

export interface PaletteItem {
  id: string;
  title: string;
  category: 'Navigation' | 'Presets' | 'Actions' | 'Vendors' | 'Tasks' | 'Settings';
  icon: React.ReactNode;
  action: () => void;
}

export interface BuildBaseItemsParams {
  state: EventWorkspaceState;
  currency: Currency;
  isDark: boolean;
  setActiveTab: (tab: ActiveTab) => void;
  switchPreset: (presetId: string) => void;
  setCurrency: (c: Currency) => void;
  toggleDarkMode: () => void;
  setAuditDrawerOpen: (open: boolean) => void;
  setCopilotOpen: (open: boolean) => void;
  setAssistantOpen: (open: boolean) => void;
  setNewEventModalOpen: (open: boolean) => void;
  autoBalanceBudget: () => void;
  resetToFactoryDefaults: () => void;
  announce: (msg: string) => void;
}

export const buildBasePaletteItems = (params: BuildBaseItemsParams): PaletteItem[] => {
  const {
    state,
    currency,
    isDark,
    setActiveTab,
    switchPreset,
    setCurrency,
    toggleDarkMode,
    setAuditDrawerOpen,
    setCopilotOpen,
    setAssistantOpen,
    setNewEventModalOpen,
    autoBalanceBudget,
    resetToFactoryDefaults,
    announce,
  } = params;

  return [
    { id: 'nav-dash', title: 'Go to Executive Bento Dashboard', category: 'Navigation', icon: <LayoutDashboard className="w-4 h-4" />, action: () => setActiveTab('dashboard') },
    { id: 'nav-budget', title: 'Go to Smart Budget Engine', category: 'Navigation', icon: <WalletCards className="w-4 h-4" />, action: () => setActiveTab('budget') },
    { id: 'nav-timeline', title: 'Go to Dual-Horizon Timeline & Run-of-Show', category: 'Navigation', icon: <CalendarClock className="w-4 h-4" />, action: () => setActiveTab('timeline') },
    { id: 'nav-vendors', title: 'Go to Vendor CRM & Negotiation Studio', category: 'Navigation', icon: <Briefcase className="w-4 h-4" />, action: () => setActiveTab('vendors') },
    { id: 'nav-ideation', title: 'Go to AI Ideation & Themes Studio', category: 'Navigation', icon: <Sparkles className="w-4 h-4" />, action: () => setActiveTab('ideation') },
    { id: 'nav-guests', title: 'Go to Guest RSVP & Capacity Planner', category: 'Navigation', icon: <Users className="w-4 h-4" />, action: () => setActiveTab('guests') },

    { id: 'pre-wedding', title: 'Switch to Udaipur Royal Heritage Wedding (Wedding Mode)', category: 'Presets', icon: <Sparkles className="w-4 h-4 text-indigo-500" />, action: () => switchPreset('preset-wedding-udaipur') },
    { id: 'pre-birthday', title: 'Switch to Midnight Botanical 25th Milestone Gala (Birthday Mode)', category: 'Presets', icon: <Sparkles className="w-4 h-4 text-amber-500" />, action: () => switchPreset('preset-birthday-botanical') },
    { id: 'pre-community', title: 'Switch to Bengaluru Open-Source AI Builders Summit (Community Mode)', category: 'Presets', icon: <Sparkles className="w-4 h-4 text-emerald-500" />, action: () => switchPreset('preset-community-builders') },

    { id: 'act-assistant', title: 'Open AuraPlan AI Planning Assistant (Q&A and 1-Click Injection)', category: 'Actions', icon: <Bot className="w-4 h-4 text-indigo-500" />, action: () => setAssistantOpen(true) },
    { id: 'act-ripple', title: 'Trigger "What-If" Ripple Simulator Drawer', category: 'Actions', icon: <Sparkles className="w-4 h-4 text-indigo-500" />, action: () => setCopilotOpen(true) },
    { id: 'act-audit', title: 'Open 100/100 System Diagnostic Audit Drawer', category: 'Actions', icon: <ShieldCheck className="w-4 h-4 text-emerald-500" />, action: () => setAuditDrawerOpen(true) },
    { id: 'act-new-event', title: 'Create + New Custom Event with AI Synthesizer', category: 'Actions', icon: <Plus className="w-4 h-4" />, action: () => setNewEventModalOpen(true) },
    { id: 'act-balance', title: 'Auto-Balance Budget Allocations to 100%', category: 'Actions', icon: <RefreshCw className="w-4 h-4" />, action: () => autoBalanceBudget() },
    {
      id: 'act-export',
      title: 'Export Event Plan Backup (JSON)',
      category: 'Actions',
      icon: <Download className="w-4 h-4" />,
      action: () => {
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
        const a = document.createElement('a');
        a.href = dataStr;
        a.download = `${state.event.name.toLowerCase().replace(/\s+/g, '-')}-plan.json`;
        a.click();
        announce('Exported event plan backup');
      },
    },

    { id: 'act-currency', title: `Toggle Currency (Currently ${currency})`, category: 'Settings', icon: currency === 'INR' ? <DollarSign className="w-4 h-4" /> : <IndianRupee className="w-4 h-4" />, action: () => setCurrency(currency === 'INR' ? 'USD' : 'INR') },
    { id: 'act-theme', title: `Toggle Dark / Light Mode (Currently ${isDark ? 'Dark' : 'Light'})`, category: 'Settings', icon: isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />, action: () => toggleDarkMode() },
    { id: 'act-reset', title: 'Reset Workspace to Factory Presets', category: 'Settings', icon: <RefreshCw className="w-4 h-4 text-rose-500" />, action: () => resetToFactoryDefaults() },
  ];
};
