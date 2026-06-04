// ─── Theme constants ───

import type { ChartTheme, RgbColor } from './types.js';

export const PALETTE: RgbColor[] = [
  { r: 0,   g: 200, b: 255 }, // #00C8FF
  { r: 255, g: 180, b: 0   }, // #FFB400
  { r: 80,  g: 220, b: 120 }, // #50DC78
  { r: 255, g: 90,  b: 90  }, // #FF5A5A
  { r: 180, g: 140, b: 255 }, // #B48CFF
  { r: 255, g: 120, b: 200 }, // #FF78C8
  { r: 200, g: 200, b: 80  }, // #C8C850
  { r: 120, g: 180, b: 255 }, // #78B4FF
];

export function paletteColor(index: number): string {
  const c = PALETTE[index % PALETTE.length];
  return `rgb(${c.r},${c.g},${c.b})`;
}

export const THEME: ChartTheme = {
  widgetBg: '#0B0F14',
  plotBg: '#151A22',
  border: '#283241',
  cursor: '#00DCFF',
  textDim: '#788CA0',
  text: '#B4C8DC',
  palette: PALETTE,
};

export const STACKED_LAYOUT = {
  leftMargin: 50,
  rightMargin: 10,
  minStripHeight: 8,
  maxSeries: 20,
} as const;

export const OVERLAY_LAYOUT = {
  plotLeft: 56,
  plotRight: 12,
  plotTop: 12,
  plotBottom: 36,
  legendLineHeight: 16,
  maxSeries: 24,
} as const;
