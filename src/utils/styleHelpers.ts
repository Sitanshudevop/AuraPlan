import type { CSSProperties } from 'react';

/**
 * Generates a strongly typed CSS properties object for dynamic width percentage.
 * Clamps value safely between 0% and 100%.
 */
export function dynamicWidthStyle(percentage: number): CSSProperties {
  const safeNum = Number.isFinite(percentage) ? percentage : 0;
  const clamped = Math.min(100, Math.max(0, safeNum));
  return {
    width: `${clamped}%`,
  };
}

/**
 * Generates a strongly typed CSS properties object for dynamic background colors (e.g., swatches).
 */
export function dynamicBgColorStyle(hexColor: string): CSSProperties {
  return {
    backgroundColor: hexColor,
  };
}

