import React, { useState, useRef, useEffect } from 'react';
import {
  Moon,
  Sun,
  ShieldCheck,
  Download,
  MoreHorizontal,
  GitCompare,
} from 'lucide-react';

interface HeaderActionsMenuProps {
  isDark: boolean;
  toggleDarkMode: () => void;
  openCopilot: () => void;
  openAuditDrawer: () => void;
  onExportJson: () => void;
}

export const HeaderActionsMenu: React.FC<HeaderActionsMenuProps> = ({
  isDark,
  toggleDarkMode,
  openCopilot,
  openAuditDrawer,
  onExportJson,
}) => {
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

  return (
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
            openCopilot();
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
            openAuditDrawer();
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
            onExportJson();
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
  );
};

