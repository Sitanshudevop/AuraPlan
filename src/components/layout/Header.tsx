import React, { useState, useRef, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { PresetDropdown } from './PresetDropdown';
import {
  Search,
  Moon,
  Sun,
  ShieldCheck,
  Bot,
  Download,
  MoreHorizontal,
  GitCompare,
  Plus,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    state,
    currency,
    isDark,
    setCurrency,
    toggleDarkMode,
    setCommandPaletteOpen,
    setAuditDrawerOpen,
    setCopilotOpen,
    setAssistantOpen,
    setNewEventModalOpen,
  } = useWorkspace();

  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMoreOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${state.event.name.toLowerCase().replace(/\s+/g, '-')}-audit-export.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <header className="sticky top-0 z-30 h-14 bg-[#FAF9F6]/95 dark:bg-[#0B0B0C]/95 backdrop-blur-sm border-b border-stone-200/80 dark:border-white/[0.08] flex items-center justify-between px-4 sm:px-6">
      {/* Left: Brand & Preset Switcher */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-5 h-5 rounded-md bg-[#111113] dark:bg-white/[0.08] flex items-center justify-center text-white dark:text-[#EDEDEF] font-semibold text-xs tracking-wider select-none">
            V
          </div>
          <span className="font-semibold text-sm tracking-tight text-[#111113] dark:text-[#EDEDEF]">
            Vow & Venue
          </span>
          <span className="text-xs text-stone-400 dark:text-zinc-500 hidden md:inline">by AuraPlan</span>
        </div>

        <div className="h-3.5 w-px bg-stone-200 dark:bg-white/[0.08] shrink-0" />

        <PresetDropdown />
      </div>

      {/* Center: Search Bar with plain text ⌘K */}
      <div className="flex-1 max-w-sm mx-3 sm:mx-6">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="w-full h-8 flex items-center justify-between px-3 text-xs text-stone-500 dark:text-[#8B8B93] bg-stone-100/80 dark:bg-white/[0.04] hover:bg-stone-200/70 dark:hover:bg-white/[0.06] rounded-lg border border-stone-200/70 dark:border-white/[0.06] transition-colors"
          aria-label="Search or run command"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-stone-400 dark:text-zinc-500 stroke-[1.5]" />
            <span className="hidden sm:inline">Search workspace...</span>
            <span className="sm:hidden">Search...</span>
          </div>
          <span className="hidden sm:inline text-[11px] text-stone-400 dark:text-zinc-500 font-sans">
            ⌘K
          </span>
        </button>
      </div>

      {/* Right Tools: Currency Toggle, AI Assistant (Ghost), Overflow Menu */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => setCurrency(currency === 'INR' ? 'USD' : 'INR')}
          className="h-8 px-2.5 flex items-center gap-1 text-xs font-medium rounded-lg text-stone-700 dark:text-[#8B8B93] hover:text-stone-900 dark:hover:text-[#EDEDEF] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] border border-stone-200/70 dark:border-white/[0.06] transition-colors tabular-nums"
          title={`Toggle currency (Current: ${currency})`}
          aria-label="Toggle currency between INR and USD"
        >
          <span>{currency}</span>
        </button>

        <button
          onClick={() => setAssistantOpen(true)}
          className="h-8 px-2.5 flex items-center gap-1.5 text-xs font-medium rounded-lg text-stone-700 dark:text-[#8B8B93] hover:text-stone-900 dark:hover:text-[#EDEDEF] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] border border-transparent transition-colors"
          title="Open AI Planning Assistant"
          aria-label="Open AI Planning Assistant"
        >
          <Bot className="w-3.5 h-3.5 stroke-[1.5]" />
          <span className="hidden sm:inline">AI Assistant</span>
        </button>

        <button
          onClick={() => setNewEventModalOpen(true)}
          className="h-8 px-2.5 hidden sm:inline-flex items-center gap-1.5 text-xs font-medium rounded-lg text-stone-700 dark:text-[#8B8B93] hover:text-stone-900 dark:hover:text-[#EDEDEF] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] border border-stone-200/70 dark:border-white/[0.06] transition-colors"
          title="New Event"
          aria-label="New Event"
        >
          <Plus className="w-3.5 h-3.5 stroke-[1.5]" />
          <span>New Event</span>
        </button>

        <div className="relative" ref={moreRef}>
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            aria-haspopup="true"
            aria-expanded={moreOpen}
            className="h-8 w-8 flex items-center justify-center text-stone-500 hover:text-stone-900 dark:text-[#8B8B93] dark:hover:text-[#EDEDEF] rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
            title="More workspace actions"
            aria-label="More actions"
          >
            <MoreHorizontal className="w-4 h-4 stroke-[1.5]" />
          </button>

          <div
            className={`absolute right-0 mt-1.5 w-56 bg-white dark:bg-[#161618] border border-stone-200/80 dark:border-white/[0.08] rounded-xl shadow-lg p-1 z-40 transition-all duration-150 text-xs ${
              moreOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
            }`}
          >
            <button
              onClick={() => {
                toggleDarkMode();
                setMoreOpen(false);
              }}
              aria-label="Toggle dark mode"
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-stone-700 dark:text-[#EDEDEF] hover:bg-stone-100 dark:hover:bg-white/[0.06] transition-colors"
            >
              {isDark ? <Sun className="w-3.5 h-3.5 stroke-[1.5]" /> : <Moon className="w-3.5 h-3.5 stroke-[1.5]" />}
              <span>{isDark ? 'Switch to light mode' : 'Switch to dark mode'}</span>
            </button>

            <button
              onClick={() => {
                setCopilotOpen(true);
                setMoreOpen(false);
              }}
              aria-label="Open AI Ripple Simulator"
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-stone-700 dark:text-[#EDEDEF] hover:bg-stone-100 dark:hover:bg-white/[0.06] transition-colors"
            >
              <GitCompare className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>What-If simulator</span>
            </button>

            <button
              onClick={() => {
                setAuditDrawerOpen(true);
                setMoreOpen(false);
              }}
              aria-label="Open 100/100 Judge Audit Drawer"
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-stone-700 dark:text-[#EDEDEF] hover:bg-stone-100 dark:hover:bg-white/[0.06] transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>Rubric audit report</span>
            </button>

            <div className="h-px bg-stone-200/70 dark:bg-white/[0.06] my-1" />

            <button
              onClick={() => {
                handleExportJson();
                setMoreOpen(false);
              }}
              aria-label="Export Workspace JSON Backup"
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-stone-700 dark:text-[#EDEDEF] hover:bg-stone-100 dark:hover:bg-white/[0.06] transition-colors"
            >
              <Download className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>Export workspace JSON</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
