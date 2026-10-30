import React from 'react';
import { ColorSwatch } from '../../types/ideation';
import { Check } from 'lucide-react';

interface ThemePaletteTabProps {
  colors: ColorSwatch[];
  copiedHex: string | null;
  onCopyHex: (hex: string) => void;
}

export const ThemePaletteTab: React.FC<ThemePaletteTabProps> = ({
  colors,
  copiedHex,
  onCopyHex,
}) => {
  return (
    <div className="space-y-2 pt-1">
      <div className="text-xs text-stone-400 dark:text-zinc-500">
        Click swatch to copy hex code
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {colors.map((color, idx) => (
          <button
            key={idx}
            onClick={() => onCopyHex(color.hex)}
            className="flex items-center gap-2.5 p-2 rounded-lg border border-stone-200/80 dark:border-white/[0.08] hover:border-stone-300 dark:hover:border-white/[0.14] transition-colors text-left bg-stone-50/50 dark:bg-white/[0.02]"
            title={`Click to copy ${color.hex}`}
          >
            <div
              className="w-7 h-7 rounded-md border border-black/10 dark:border-white/10 shrink-0 flex items-center justify-center"
              style={{ backgroundColor: color.hex }}
            >
              {copiedHex === color.hex && <Check className="w-3.5 h-3.5 text-white drop-shadow-xs" />}
            </div>
            <div className="min-w-0">
              <span className="text-xs font-medium text-[#111113] dark:text-[#EDEDEF] block truncate">
                {color.name}
              </span>
              <span className="text-[11px] text-stone-400 dark:text-zinc-500 tabular-nums">
                {copiedHex === color.hex ? 'Copied' : color.hex}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
