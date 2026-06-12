import React, { useRef, useEffect, useCallback } from 'react';
import type { TelemetryFrame } from '../../types';
import { registerPanelKitWidget } from '../PanelKit';

// ─── Types ───
interface DataPoint {
  t: number; // epoch seconds
  v: number; // value
}

interface GraphRendererProps {
  frame: TelemetryFrame;
  fieldKey: string;
  label: string;
  unit?: string;
  lineColor?: string;
}

const MAX_POINTS = 300;
const TIME_WINDOW_SEC = 30;

// ─── Value formatter ───
function formatValue(v: number): string {
  const abs = Math.abs(v);
  if (abs >= 10000) return v.toFixed(0);
  if (abs >= 1000) return v.toFixed(1);
  if (abs >= 100) return v.toFixed(1);
  if (abs >= 10) return v.toFixed(2);
  if (abs >= 1) return v.toFixed(2);
  return v.toFixed(3);
}

// ─── Graph Renderer ───
const GraphRenderer: React.FC<GraphRendererProps> = ({
  frame,
  fieldKey,
  label,
  unit = '',
  lineColor = '#00ff88',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const bufferRef = useRef<DataPoint[]>([]);
  const sizeRef = useRef({ w: 0, h: 0 });

  // ─── ResizeObserver → resize canvas ───
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const dpr = window.devicePixelRatio || 1;
        const w = Math.floor(entry.contentRect.width * dpr);
        const h = Math.floor(entry.contentRect.height * dpr);
        sizeRef.current = { w, h };
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = w;
          canvas.height = h;
          canvas.style.width = entry.contentRect.width + 'px';
          canvas.style.height = entry.contentRect.height + 'px';
        }
      }
      draw();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Draw function (stable via useCallback) ───
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { w, h } = sizeRef.current;
    if (w === 0 || h === 0) return;

    const buf = bufferRef.current;

    // Background
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, w, h);

    if (buf.length < 2) {
      ctx.fillStyle = '#555';
      ctx.font = `${Math.max(10, h / 20)}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText('Waiting for data...', w / 2, h / 2);
      return;
    }

    const margin = { top: 26, right: 14, bottom: 20, left: 50 };
    const pw = w - margin.left - margin.right;
    const ph = h - margin.top - margin.bottom;

    // ─── Y range with 10% padding ───
    const vals = buf.map(p => p.v);
    let yMin = Math.min(...vals);
    let yMax = Math.max(...vals);
    if (yMax === yMin) {
      yMin -= 1;
      yMax += 1;
    }
    const pad = (yMax - yMin) * 0.1;
    yMin -= pad;
    yMax += pad;

    const tMin = buf[0].t;
    const tMax = buf[buf.length - 1].t;
    const tRange = tMax - tMin || 1;

    // ─── Grid + Y labels ───
    const gridLines = 4;
    const yFontSize = Math.max(9, h / 48);
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridLines; i++) {
      const y = margin.top + (ph * i) / gridLines;
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(w - margin.right, y);
      ctx.stroke();

      const labelVal = yMax - ((yMax - yMin) * i) / gridLines;
      ctx.fillStyle = '#777';
      ctx.font = `${yFontSize}px monospace`;
      ctx.textAlign = 'right';
      ctx.fillText(formatValue(labelVal), margin.left - 5, y + yFontSize / 3);
    }

    // ─── X labels (relative time) ───
    const xFontSize = Math.max(9, h / 52);
    ctx.fillStyle = '#555';
    ctx.font = `${xFontSize}px monospace`;
    ctx.textAlign = 'center';
    // Show 3 labels: left, center, right
    for (let i = 0; i <= 3; i++) {
      const relSec = tRange * (1 - i / 3);
      const x = margin.left + pw * (i / 3);
      ctx.fillText(`-${relSec.toFixed(0)}s`, x, h - 4);
    }

    // ─── Line ───
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    for (let i = 0; i < buf.length; i++) {
      const x = margin.left + ((buf[i].t - tMin) / tRange) * pw;
      const y = margin.top + ph - ((buf[i].v - yMin) / (yMax - yMin)) * ph;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // ─── Semi-transparent fill under line ───
    ctx.globalAlpha = 0.07;
    ctx.fillStyle = lineColor;
    ctx.lineTo(margin.left + pw, margin.top + ph);
    ctx.lineTo(margin.left, margin.top + ph);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;

    // ─── Label (top-left) ───
    ctx.fillStyle = '#aaa';
    ctx.font = `bold ${Math.max(11, h / 32)}px monospace`;
    ctx.textAlign = 'left';
    ctx.fillText(label, margin.left, 16);

    // ─── Current value (top-right) ───
    const cv = buf[buf.length - 1].v;
    ctx.fillStyle = lineColor;
    ctx.font = `bold ${Math.max(12, h / 28)}px monospace`;
    ctx.textAlign = 'right';
    ctx.fillText(`${formatValue(cv)}${unit}`, w - margin.right, 16);
  }, [lineColor, label, unit]);

  // ─── Ingest data + trigger draw ───
  const value = frame[fieldKey];
  const t0 = (frame as Record<string, unknown>)._t0_ms as number | undefined;

  useEffect(() => {
    if (typeof value !== 'number' || !Number.isFinite(value)) return;

    const buf = bufferRef.current;
    const now = t0 ? t0 / 1000 : Date.now() / 1000;

    // Deduplicate same-timestamp with same value
    const last = buf.length > 0 ? buf[buf.length - 1] : null;
    if (last && last.t === now && last.v === value) return;

    buf.push({ t: now, v: value });

    // Trim by time window
    const cutoff = now - TIME_WINDOW_SEC;
    while (buf.length > 1 && buf[0].t < cutoff) buf.shift();
    // Trim by max count
    while (buf.length > MAX_POINTS) buf.shift();

    draw();
  }, [value, t0, draw]);

  return (
    <div ref={containerRef} className="w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════
//  Factory — creates a pre-configured PanelKit widget for one param
// ══════════════════════════════════════════════════════════════════

interface GraphWidgetConfig {
  id: string;
  name: string;
  fieldKey: string;
  label: string;
  unit?: string;
  lineColor?: string;
  iconName?: string;
  tooltip?: string;
}

function createGraphWidget(config: GraphWidgetConfig) {
  const {
    id,
    name,
    fieldKey,
    label,
    unit = '',
    lineColor = '#00ff88',
    iconName = 'TrendingUp',
    tooltip,
  } = config;

  const Component: React.FC<{ frame: TelemetryFrame }> = ({ frame }) => (
    <GraphRenderer
      frame={frame}
      fieldKey={fieldKey}
      label={label}
      unit={unit}
      lineColor={lineColor}
    />
  );

  registerPanelKitWidget({
    id,
    name,
    iconName,
    Component,
    tooltip: tooltip ?? `Graph: ${label} (${fieldKey})`,
    frameVariables: [fieldKey],
  });

  return Component;
}

// ─── Register graph widgets ───

createGraphWidget({
  id: 'graph-cas',
  name: 'Graph: Airspeed',
  fieldKey: 'CAS',
  label: 'CAS',
  unit: ' kt',
  lineColor: '#00e676',
  tooltip: 'График приборной скорости (CAS)',
});

createGraphWidget({
  id: 'graph-alt',
  name: 'Graph: Altitude',
  fieldKey: 'BaroAltitude',
  label: 'Altitude',
  unit: ' ft',
  lineColor: '#4fc3f7',
  tooltip: 'График барометрической высоты',
});

createGraphWidget({
  id: 'graph-roll',
  name: 'Graph: Roll',
  fieldKey: 'RollAngle',
  label: 'Roll',
  unit: '°',
  lineColor: '#ff8a65',
  tooltip: 'График угла крена',
});

createGraphWidget({
  id: 'graph-pitch',
  name: 'Graph: Pitch',
  fieldKey: 'PitchAngle',
  label: 'Pitch',
  unit: '°',
  lineColor: '#ffd54f',
  tooltip: 'График угла тангажа',
});

createGraphWidget({
  id: 'graph-vs',
  name: 'Graph: Vert Speed',
  fieldKey: 'Vy',
  label: 'Vy',
  unit: ' fpm',
  lineColor: '#ce93d8',
  tooltip: 'График вертикальной скорости',
});

createGraphWidget({
  id: 'graph-hdg',
  name: 'Graph: Heading',
  fieldKey: 'MagneticHeading',
  label: 'Heading',
  unit: '°',
  lineColor: '#81d4fa',
  tooltip: 'График магнитного курса',
});

createGraphWidget({
  id: 'graph-aoa',
  name: 'Graph: AoA',
  fieldKey: 'AoA',
  label: 'AoA',
  unit: '°',
  lineColor: '#ef5350',
  tooltip: 'График угла атаки',
});

createGraphWidget({
  id: 'graph-n1',
  name: 'Graph: N1 Left',
  fieldKey: 'Engine_N1_Left',
  label: 'N1 Left',
  unit: '%',
  lineColor: '#a5d6a7',
  tooltip: 'График оборотов N1 левого двигателя',
});

createGraphWidget({
  id: 'graph-g',
  name: 'Graph: G-Load',
  fieldKey: 'NormalG',
  label: 'G-Load',
  unit: ' g',
  lineColor: '#ffcc80',
  tooltip: 'График нормальной перегрузки (Ny)',
});

createGraphWidget({
  id: 'graph-ra',
  name: 'Graph: Radio Alt',
  fieldKey: 'RadioAltitude',
  label: 'Radio Alt',
  unit: ' ft',
  lineColor: '#80cbc4',
  tooltip: 'График радиовысоты',
});

export default GraphRenderer;
export { createGraphWidget };
