import React, { useState, useRef, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { PRESET_OPTIONS } from '../../data/presets';
import { ChevronDown, Plus, Check } from 'lucide-react';

export const PresetDropdown: React.FC = () => {
  const { activePresetId, switchPreset, setNewEventModalOpen } = useWorkspace();
  const [presetOpen, setPresetOpen] = useState(false);
  const presetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (presetRef.current && !presetRef.current.contains(e.target as Node)) {
        setPresetOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPresetOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const currentPreset = PRESET_OPTIONS.find((p) => p.id === activePresetId) || PRESET_OPTIONS[0];

  return (
    <div className="relative" ref={presetRef}>
      <button
        onClick={() => setPresetOpen(!presetOpen)}
        aria-haspopup="true"
        aria-expanded={presetOpen}
        className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-700 text-stone-800 dark:text-zinc-200 border border-stone-200 dark:border-zinc-700/80 transition-colors"
      >
        <span className="text-stone-500 dark:text-zinc-400 hidden sm:inline">Preset:</span>
        <span className="font-semibold truncate max-w-[140px] sm:max-w-[180px]">{currentPreset.title}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-stone-500 transition-transform ${presetOpen ? 'rotate-180' : ''}`} />
      </button>

      <div
        className={`absolute left-0 mt-1.5 w-64 bg-white dark:bg-[#18181B] border border-stone-200 dark:border-zinc-700/80 rounded-xl shadow-lg p-1.5 z-40 transition-all duration-150 ${
          presetOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider text-stone-600 dark:text-zinc-400">
          Judge Showcase Presets
        </div>
        {PRESET_OPTIONS.map((p) => {
          const isActive = activePresetId === p.id;
          return (
            <button
              key={p.id}
              onClick={() => {
                switchPreset(p.id);
                setPresetOpen(false);
              }}
              aria-pressed={isActive}
              className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                isActive
                  ? 'bg-amber-500/10 text-amber-900 dark:text-amber-300 font-semibold'
                  : 'hover:bg-stone-100 dark:hover:bg-zinc-800 text-stone-700 dark:text-zinc-300'
              }`}
            >
              <div>
                <div className="font-medium">{p.title}</div>
                <div className="text-[10px] text-stone-600 dark:text-zinc-400 font-mono mt-0.5">{p.stats}</div>
              </div>
              {isActive && <Check className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />}
            </button>
          );
        })}
        <div className="my-1 border-t border-stone-100 dark:border-zinc-800" />
        <button
          onClick={() => {
            setNewEventModalOpen(true);
            setPresetOpen(false);
          }}
          aria-label="New Event - Generate Custom Event Plan"
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800 hover:text-stone-900 dark:hover:text-zinc-100 transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-amber-500" />
          <span>New Custom Event...</span>
        </button>
      </div>
    </div>
  );
};

