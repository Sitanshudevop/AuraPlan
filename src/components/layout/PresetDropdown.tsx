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
        className="h-8 flex items-center gap-1.5 px-2.5 text-xs font-medium rounded-lg bg-stone-100 dark:bg-white/[0.04] hover:bg-stone-200/70 dark:hover:bg-white/[0.06] text-stone-800 dark:text-[#EDEDEF] border border-stone-200/70 dark:border-white/[0.06] transition-colors"
      >
        <span className="text-stone-400 dark:text-zinc-500 hidden sm:inline font-normal">Preset:</span>
        <span className="font-medium truncate max-w-[140px] sm:max-w-[180px]">{currentPreset.title}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-stone-400 dark:text-zinc-500 stroke-[1.5] transition-transform ${presetOpen ? 'rotate-180' : ''}`} />
      </button>

      <div
        className={`absolute left-0 mt-1.5 w-64 bg-white dark:bg-[#161618] border border-hairline rounded-xl shadow-lg p-1 z-40 transition-all duration-150 ${
          presetOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div className="px-2 py-1 text-[11px] font-medium text-stone-400 dark:text-zinc-500">
          Event Presets
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
                  ? 'bg-[#6E79F5]/10 text-[#5D68E2] dark:text-[#6E79F5] font-medium'
                  : 'hover:bg-stone-100 dark:hover:bg-white/[0.06] text-stone-700 dark:text-[#EDEDEF]'
              }`}
            >
              <div>
                <div className="font-medium">{p.title}</div>
                <div className="text-[11px] text-stone-400 dark:text-zinc-500 mt-0.5">{p.stats}</div>
              </div>
              {isActive && <Check className="w-3.5 h-3.5 shrink-0 text-[#6E79F5]" />}
            </button>
          );
        })}

        <div className="h-px bg-stone-200/70 dark:bg-white/[0.06] my-1" />

        <button
          onClick={() => {
            setNewEventModalOpen(true);
            setPresetOpen(false);
          }}
          className="w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-stone-700 dark:text-[#EDEDEF] hover:bg-stone-100 dark:hover:bg-white/[0.06] font-medium transition-colors"
        >
          <Plus className="w-3.5 h-3.5 stroke-[1.5]" />
          <span>Create new custom event...</span>
        </button>
      </div>
    </div>
  );
};
