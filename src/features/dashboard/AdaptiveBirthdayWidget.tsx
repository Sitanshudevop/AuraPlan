import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { formatCurrency } from '../../utils/formatters';

export const AdaptiveBirthdayWidget: React.FC = () => {
  const { state, currency, updateEvent } = useWorkspace();

  const [cakeTier, setCakeTier] = useState(
    state.event.cakeTier || '3-Tier Artisanal Matcha & Raspberry'
  );
  const [vibe, setVibe] = useState(
    state.event.vibePlaylist || 'Indie Sunset → Melodic Deep House'
  );
  const [favorPerHead, setFavorPerHead] = useState<number>(180);

  const favorTotal = favorPerHead * state.event.guestCount;

  const cakeOptions = [
    { value: '3-Tier Artisanal Matcha & Raspberry', label: '3-tier artisanal matcha & raspberry (8kg)' },
    { value: '4-Tier Dark Belgian Truffle & Gold Foil', label: '4-tier dark Belgian truffle & gold foil (12kg)' },
    { value: 'Contemporary Minimalist Biscoff Mirror Glaze', label: 'Contemporary Biscoff mirror glaze (6kg)' },
    { value: 'Deconstructed Macaron & Choux Tower', label: 'Deconstructed macaron tower (200 pieces)' },
  ];

  const vibeOptions = [
    { value: 'Indie Sunset → Melodic Deep House', label: 'Indie sunset → Melodic deep house' },
    { value: 'Golden Age Vinyl Jazz → Nu-Disco', label: 'Golden age vinyl jazz → Nu-disco' },
    { value: 'Lo-Fi Beats → R&B Retro Jam', label: 'Lo-fi beats → R&B retro jam' },
    { value: 'High-Energy Electronic & Club Anthems', label: 'High-energy electronic & club anthems' },
  ];

  return (
    <Card className="col-span-12 lg:col-span-8 space-y-4 rounded-xl border border-stone-200/80 dark:border-white/[0.08]">
      <div className="flex items-center justify-between border-b border-stone-200/80 dark:border-white/[0.08] pb-3">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-[#111113] dark:text-[#EDEDEF]">
            Milestone Soirée Experience Customizer
          </h3>
          <p className="text-xs text-stone-500 dark:text-[#8B8B93] mt-0.5">
            Artisanal cake tiering, soundscape playlist, and party favor estimator
          </p>
        </div>
        <span className="text-xs text-stone-400 dark:text-zinc-500">
          Birthday Experience
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Cake Tier */}
        <div className="p-3.5 bg-stone-50/50 dark:bg-white/[0.02] border border-stone-200/80 dark:border-white/[0.08] rounded-lg space-y-2">
          <div className="text-xs font-medium text-stone-700 dark:text-[#EDEDEF]">
            Custom cake / dessert tier
          </div>
          <Select
            value={cakeTier}
            onChange={(val) => {
              setCakeTier(val);
              updateEvent({ cakeTier: val });
            }}
            options={cakeOptions}
            ariaLabel="Custom cake tier"
          />
          <p className="text-[11px] text-stone-500 dark:text-[#8B8B93]">
            Selected: <span className="text-stone-700 dark:text-[#EDEDEF]">{cakeTier}</span>
          </p>
        </div>

        {/* Music Vibe */}
        <div className="p-3.5 bg-stone-50/50 dark:bg-white/[0.02] border border-stone-200/80 dark:border-white/[0.08] rounded-lg space-y-2">
          <div className="text-xs font-medium text-stone-700 dark:text-[#EDEDEF]">
            Playlist & soundscape curve
          </div>
          <Select
            value={vibe}
            onChange={(val) => {
              setVibe(val);
              updateEvent({ vibePlaylist: val });
            }}
            options={vibeOptions}
            ariaLabel="Soundscape curve"
          />
          <p className="text-[11px] text-stone-500 dark:text-[#8B8B93]">
            Acoustic tone transitions dynamically after midnight toast.
          </p>
        </div>
      </div>

      {/* Favor Estimator */}
      <div className="p-3.5 bg-stone-50/50 dark:bg-white/[0.02] border border-stone-200/80 dark:border-white/[0.08] rounded-lg space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium text-stone-700 dark:text-[#EDEDEF]">
            Party favor & return-gift estimator
          </div>
          <span className="text-xs font-semibold tabular-nums text-stone-800 dark:text-[#EDEDEF]">
            {formatCurrency(favorTotal, currency)} total ({state.event.guestCount} guests)
          </span>
        </div>

        <div className="flex items-center gap-4 pt-1">
          <input
            type="range"
            min="50"
            max="1000"
            step="10"
            value={favorPerHead}
            onChange={(e) => setFavorPerHead(Number(e.target.value))}
            className="flex-1 accent-[#6E79F5]"
          />
          <span className="text-xs tabular-nums text-stone-600 dark:text-[#8B8B93] shrink-0">
            {formatCurrency(favorPerHead, currency)} / guest
          </span>
        </div>
      </div>
    </Card>
  );
};
