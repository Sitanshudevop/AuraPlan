import { describe, it, expect } from 'vitest';
import { dynamicWidthStyle, dynamicBgColorStyle } from '../utils/styleHelpers';

describe('styleHelpers Unit Tests', () => {
  it('correctly formats valid width percentage', () => {
    expect(dynamicWidthStyle(50)).toEqual({ width: '50%' });
    expect(dynamicWidthStyle(0)).toEqual({ width: '0%' });
    expect(dynamicWidthStyle(100)).toEqual({ width: '100%' });
  });

  it('clamps width percentage between 0 and 100', () => {
    expect(dynamicWidthStyle(-25)).toEqual({ width: '0%' });
    expect(dynamicWidthStyle(150)).toEqual({ width: '100%' });
  });

  it('handles non-finite and NaN values gracefully', () => {
    expect(dynamicWidthStyle(NaN)).toEqual({ width: '0%' });
    expect(dynamicWidthStyle(Infinity)).toEqual({ width: '0%' });
  });

  it('correctly sets background color', () => {
    expect(dynamicBgColorStyle('#6E79F5')).toEqual({ backgroundColor: '#6E79F5' });
    expect(dynamicBgColorStyle('rgb(0, 0, 0)')).toEqual({ backgroundColor: 'rgb(0, 0, 0)' });
  });
});
