import React from 'react';
import { RipplePresetId } from '../../types/ripple';
import { CloudRain, Users, Percent, TrendingUp } from 'lucide-react';

export interface RipplePresetOption {
  id: RipplePresetId;
  label: string;
  icon: React.ReactNode;
}

export const PRESET_SCENARIOS: RipplePresetOption[] = [
  { id: 'guest_surge_25', label: '+25% Guest Surge', icon: <Users className="w-3.5 h-3.5 text-amber-500" /> },
  { id: 'cut_budget_15', label: '-15% Budget Cut', icon: <Percent className="w-3.5 h-3.5 text-emerald-500" /> },
  { id: 'monsoon_warning', label: 'Monsoon Rain Alert', icon: <CloudRain className="w-3.5 h-3.5 text-blue-500" /> },
  { id: 'inflation_spike_20', label: '+20% Food Inflation', icon: <TrendingUp className="w-3.5 h-3.5 text-rose-500" /> },
];

