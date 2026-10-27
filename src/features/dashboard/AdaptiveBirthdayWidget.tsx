import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency } from '../../utils/formatters';
import { Cake, Music, Gift } from 'lucide-react';

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

  return (
    <Card className="col-span-12 lg:col-span-7 space-y-4">
      <div className="flex items-center justify-between border-b border-stone-200 dark:border-zinc-800 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-[#18181B] dark:text-[#FAFAFA]">
            Milestone Soirée Experience Customizer
          </h3>
          <p className="text-xs text-stone-500 dark:text-zinc-400">
            Artisanal cake tiering, soundscape playlist, and party favor estimator
          </p>
        </div>
        <Badge variant="amber" size="sm">Birthday Mode</Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Cake Tier */}
        <div className="p-3.5 bg-stone-50 dark:bg-zinc-900/60 border border-stone-200 dark:border-zinc-800 rounded-lg space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-800 dark:text-zinc-200">
            <Cake className="w-4 h-4 text-amber-600" />
            <span>Custom Cake / Dessert Tier</span>
          </div>
          <select
            value={cakeTier}
            onChange={(e) => {
              setCakeTier(e.target.value);
              updateEvent({ cakeTier: e.target.value });
            }}
            className="w-full text-xs p-2 bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md text-stone-800 dark:text-white"
          >
            <option value="3-Tier Artisanal Matcha & Raspberry">3-Tier Artisanal Matcha & Raspberry (8kg)</option>
            <option value="4-Tier Dark Belgian Truffle & Gold Foil">4-Tier Dark Belgian Truffle & Gold Foil (12kg)</option>
            <option value="Contemporary Minimalist Biscoff Mirror Glaze">Contemporary Biscoff Mirror Glaze (6kg)</option>
            <option value="Deconstructed Macaron & Choux Tower">Deconstructed Macaron Tower (200 pieces)</option>
          </select>
          <p className="text-[11px] text-stone-500 dark:text-zinc-400">
            Current Selection: <span className="font-medium text-stone-700 dark:text-zinc-300">{cakeTier}</span>
          </p>
        </div>

        {/* Music Vibe */}
        <div className="p-3.5 bg-stone-50 dark:bg-zinc-900/60 border border-stone-200 dark:border-zinc-800 rounded-lg space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-800 dark:text-zinc-200">
            <Music className="w-4 h-4 text-indigo-600" />
            <span>Playlist & Soundscape Curve</span>
          </div>
          <select
            value={vibe}
            onChange={(e) => {
              setVibe(e.target.value);
              updateEvent({ vibePlaylist: e.target.value });
            }}
            className="w-full text-xs p-2 bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md text-stone-800 dark:text-white"
          >
            <option value="Indie Sunset → Melodic Deep House">Indie Sunset → Melodic Deep House</option>
            <option value="Golden Age Vinyl Jazz → Nu-Disco">Golden Age Vinyl Jazz → Nu-Disco</option>
            <option value="Lo-Fi Beats → R&B Retro Jam">Lo-Fi Beats → R&B Retro Jam</option>
            <option value="High-Energy Electronic & Club Anthems">High-Energy Electronic & Club Anthems</option>
          </select>
          <p className="text-[11px] text-stone-500 dark:text-zinc-400">
            Acoustic tone transitions dynamically after midnight toast.
          </p>
        </div>
      </div>

      {/* Favor Estimator */}
      <div className="p-3.5 bg-stone-50 dark:bg-zinc-900/60 border border-stone-200 dark:border-zinc-800 rounded-lg space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-800 dark:text-zinc-200">
            <Gift className="w-4 h-4 text-emerald-600" />
            <span>Party Favor & Return-Gift Estimator</span>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {formatCurrency(favorTotal, currency)} total ({state.event.guestCount} guests)
          </span>
        </div>

        <div className="flex items-center gap-4">
          <input
            type="range"
            min="50"
            max="1000"
            step="10"
            value={favorPerHead}
            onChange={(e) => setFavorPerHead(Number(e.target.value))}
            className="flex-1 accent-stone-900 dark:accent-white"
          />
          <span className="text-xs font-mono font-medium text-stone-700 dark:text-zinc-300 tabular-nums shrink-0">
            {formatCurrency(favorPerHead, currency)} / guest
          </span>
        </div>
      </div>
    </Card>
  );
};
