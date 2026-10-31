import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Search } from 'lucide-react';
import { useCommandPaletteSearch } from './useCommandPaletteSearch';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    state,
    setActiveTab,
    switchPreset,
    currency,
    setCurrency,
    isDark,
    toggleDarkMode,
    setAuditDrawerOpen,
    setCopilotOpen,
    setAssistantOpen,
    setNewEventModalOpen,
    autoBalanceBudget,
    resetToFactoryDefaults,
    announce,
  } = useWorkspace();

  const listRef = useRef<HTMLDivElement>(null);

  const { query, setQuery, selectedIndex, setSelectedIndex, filtered } = useCommandPaletteSearch({
    isOpen: isCommandPaletteOpen,
    onClose: () => setCommandPaletteOpen(false),
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
  });

  if (!isCommandPaletteOpen) return null;

  const content = (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={() => setCommandPaletteOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-[#161618] border border-stone-200/80 dark:border-white/[0.08] rounded-xl shadow-xl overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-stone-200/80 dark:border-white/[0.08]">
          <Search className="w-4 h-4 text-stone-500 dark:text-zinc-500 stroke-[1.5] shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, search vendor or task (↑↓ to navigate, ↵ to run)..."
            className="flex-1 bg-transparent text-sm text-[#111113] dark:text-[#EDEDEF] placeholder:text-stone-500 dark:placeholder:text-zinc-500 outline-none"
            autoFocus
            aria-label="Search workspace commands, vendors, or tasks"
            aria-autocomplete="list"
            aria-controls="command-results"
          />
          <kbd className="text-[11px] font-sans px-1.5 py-0.5 bg-stone-100 dark:bg-white/[0.06] text-stone-500 dark:text-[#8B8B93] rounded border border-stone-200/80 dark:border-white/[0.08] shrink-0">
            ESC
          </kbd>
        </div>

        <div
          ref={listRef}
          id="command-results"
          role="listbox"
          aria-label="Available commands"
          className="max-h-80 overflow-y-auto p-1.5 space-y-0.5 no-scrollbar"
        >
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-stone-500 dark:text-[#8B8B93]">
              No matching actions, vendors, or tasks found.
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    item.action();
                    setCommandPaletteOpen(false);
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left group ${
                    isSelected
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                      : 'text-stone-700 dark:text-[#8B8B93] hover:bg-stone-100 dark:hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <span className={isSelected ? 'text-indigo-600 dark:text-indigo-400 shrink-0' : 'text-stone-500 dark:text-zinc-500 shrink-0'}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.title}</span>
                  </div>
                  <span className="text-[11px] text-stone-500 dark:text-zinc-500 shrink-0">
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : content;
};
