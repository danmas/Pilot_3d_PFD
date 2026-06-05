/**
 * Aircraft3DInstrument.tsx — ЗАГЛУШКА.
 *
 * Полноценный 3D-движок (Three.js, физика полёта) отключён для демонстрации.
 * Компонент показывает стилизованный placeholder с HUD-данными телеметрии.
 *
 * Регистрируется через registerPanelKitWidget и доступен в PanelBuilder.
 */
import React, { memo } from 'react';
import type { TelemetryFrame } from '../../types';
import { registerPanelKitWidget } from '../PanelKit';

/* ─── helpers ─── */
const finite = (v: unknown): number =>
  typeof v === 'number' && Number.isFinite(v) ? v : 0;
const fmt = (v: unknown, d = 1): string =>
  typeof v === 'number' && Number.isFinite(v) ? v.toFixed(d) : '—';

/* ─── Stub component ─── */
const Aircraft3DInstrument: React.FC<{ frame: TelemetryFrame }> = memo(({ frame }) => {
  const pitch   = finite(frame?.PitchAngle);
  const roll    = finite(frame?.RollAngle);
  const heading = finite(frame?.Heading1);
  const alt     = frame?.RAltitude;
  const cas     = finite(frame?.CAS);
  const vy      = finite(frame?.Vy);

  return (
    <div className="w-full h-full relative bg-[#0a0a14] overflow-hidden select-none flex flex-col items-center justify-center">
      {/* Декоративная HUD-сетка */}
      <div className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Силуэт самолёта */}
      <div className="relative z-10 mb-6">
        <svg width="100" height="64" viewBox="0 0 100 64" className="text-cyan-500/30" fill="currentColor">
          <path d="M50 4 L57 32 L90 34 L94 30 L90 34 L94 38 L90 34 L57 36 L50 60 L43 36 L10 34 L6 30 L10 34 L6 38 L10 34 L43 32 Z" />
        </svg>
      </div>

      {/* Заголовок */}
      <div className="text-white/15 text-xl font-mono tracking-[0.3em] uppercase mb-4 z-10">
        3D Aircraft
      </div>
      <div className="text-white/8 text-xs font-mono tracking-wider mb-10 z-10">
        Flight Visualization · Coming Soon
      </div>

      {/* HUD-данные: верхний левый */}
      <div className="absolute top-4 left-4 text-[11px] font-mono text-white/40 leading-tight z-10">
        <div>PITCH <span className="text-cyan-400/50">{fmt(pitch)}°</span></div>
        <div>ROLL{'  '}<span className="text-cyan-400/50">{fmt(roll)}°</span></div>
      </div>

      {/* HUD-данные: верхний правый */}
      <div className="absolute top-4 right-4 text-[11px] font-mono text-white/40 leading-tight text-right z-10">
        <div>HDG <span className="text-cyan-400/50">{Math.round(heading).toString().padStart(3, '0')}°</span></div>
        <div>ALT <span className="text-orange-400/50">{fmt(alt, 0)} м</span></div>
      </div>

      {/* HUD-данные: нижний левый */}
      <div className="absolute bottom-4 left-4 text-[11px] font-mono text-white/40 leading-tight z-10">
        <div>CAS <span className="text-green-400/50">{fmt(cas, 0)}</span></div>
        <div>Vy{'  '}<span className="text-green-400/50">{fmt(vy)}</span></div>
      </div>

      {/* Неактивные пресеты камеры */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1 z-10">
        {['🔵', '🟢', '🟡', '🔴'].map((icon, i) => (
          <span key={i} className="px-2 py-0.5 text-[13px] rounded bg-white/[0.03] text-white/15 leading-none">
            {icon}
          </span>
        ))}
      </div>

      {/* Неактивная кнопка модели */}
      <span className="absolute bottom-4 right-4 px-2 py-0.5 text-[11px] rounded bg-white/[0.03] text-white/15 z-10 font-mono">
        ✈ Primitive
      </span>
    </div>
  );
}, (prev, next) => {
  const pf = prev.frame;
  const nf = next.frame;
  if (!pf || !nf) return false;
  return (
    pf.PitchAngle === nf.PitchAngle &&
    pf.RollAngle === nf.RollAngle &&
    pf.Heading1 === nf.Heading1 &&
    pf.CAS === nf.CAS &&
    pf.Vy === nf.Vy &&
    pf.RAltitude === nf.RAltitude
  );
});

/* ─── PanelKit Registration ─── */
registerPanelKitWidget({
  id: 'aircraft-3d',
  name: '3D Aircraft',
  iconName: 'Plane',
  Component: Aircraft3DInstrument,
  tooltip:
    '3D Aircraft — визуализация пространственного положения. Pitch, Roll, Heading, скорость, высота.',
  frameVariables: ['PitchAngle', 'RollAngle', 'Heading1', 'CAS', 'Vy', 'RAltitude'],
});

export default Aircraft3DInstrument;
