import React from 'react';
import type { TelemetryFrame } from '../../types';
import { SvgTooltipGroup } from '../PanelBuilder/InstrumentTooltip';
import { registerPanelKitWidget } from '../PanelKit';

const finiteNumber = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

const ConfigDisplayInstrument: React.FC<{ frame: TelemetryFrame }> = ({ frame }) => {
  const flaps = finiteNumber(frame.FlapsPosition) ?? 0;
  const slats = finiteNumber(frame.SlatsPosition) ?? 0;
  const s = {
    flapL: flaps,
    flapR: flaps,
    slatL: slats,
    slatR: slats,
    phiST: finiteNumber(frame.StabPosition) ?? -1.8,
    deltaPB: finiteNumber(frame.Airbrake_Inner_Cmd) ?? -0.1,
    deltaEPL: finiteNumber(frame.Elev_Left_Inner) ?? finiteNumber(frame.Elev_Left_Outer),
    deltaEPR: finiteNumber(frame.Elev_Right_Inner) ?? finiteNumber(frame.Elev_Right_Outer),
  };

  const formatWithComma = (val: number | null) => {
    if (val === null) return "--,-";
    return val.toFixed(1).replace('.', ',');
  };

  const formatWithDot = (val: number | null) => {
    if (val === null) return "--.-";
    return val.toFixed(1);
  };

  return (
    <div className="w-full h-full relative bg-[#050505] font-sans flex flex-col items-center justify-center select-none overflow-hidden">
      <svg viewBox="0 0 800 600" className="w-full h-full" preserveAspectRatio="xMidYMid meet">

        {/* TOP SECTION: FRONT VIEW */}
        <SvgTooltipGroup
          transform="translate(0, -30)"
          description="Вид спереди: текущие положения стабилизатора, интерцептора, рулей высоты, закрылков и предкрылков."
          frameVariables={[
            'StabPosition',
            'Airbrake_Inner_Cmd',
            'Elev_Left_Inner',
            'Elev_Left_Outer',
            'Elev_Right_Inner',
            'Elev_Right_Outer',
            'FlapsPosition',
            'SlatsPosition',
          ]}
        >
          {/* Plane Outline */}
          <g stroke="#999" strokeWidth="1.5" fill="none">
            {/* Wings */}
            <path d="M 370 240 Q 200 240 100 170 Q 150 250 370 255" />
            <path d="M 430 240 Q 600 240 700 170 Q 650 250 430 255" />

            {/* Winglets */}
            <path d="M 100 170 Q 100 150 110 140" />
            <path d="M 700 170 Q 700 150 690 140" />

            {/* Engines */}
            <circle cx="310" cy="270" r="18" />
            <circle cx="310" cy="270" r="10" />
            <path d="M 310 252 L 310 248 L 330 248 L 330 252" />

            <circle cx="490" cy="270" r="18" />
            <circle cx="490" cy="270" r="10" />
            <path d="M 490 252 L 490 248 L 470 248 L 470 252" />

            {/* Fuselage */}
            <circle cx="400" cy="240" r="35" />
            <path d="M 380 215 Q 400 190 420 215" strokeWidth="1" />
            <circle cx="400" cy="240" r="5" strokeWidth="1" />
            <circle cx="400" cy="240" r="2" />

            {/* Tail */}
            <path d="M 395 205 L 395 60 Q 400 55 405 60 L 405 205" />

            {/* Horizontal Stab */}
            <path d="M 395 180 L 320 185 L 320 190 L 395 195" />
            <path d="M 405 180 L 480 185 L 480 190 L 405 195" />

            {/* Landing Gear */}
            {/* Nose gear */}
            <rect x="396" y="275" width="8" height="25" />
            <rect x="388" y="300" width="10" height="20" rx="3" />
            <rect x="402" y="300" width="10" height="20" rx="3" />

            {/* Main gear L */}
            <rect x="348" y="280" width="6" height="30" />
            <rect x="335" y="300" width="12" height="24" rx="3" />
            <rect x="355" y="300" width="12" height="24" rx="3" />

            {/* Main gear R */}
            <rect x="446" y="280" width="6" height="30" />
            <rect x="433" y="300" width="12" height="24" rx="3" />
            <rect x="453" y="300" width="12" height="24" rx="3" />
          </g>

          {/* Orange ground blocks */}
          <g fill="#FFA500">
            <rect x="325" y="330" width="45" height="10" />
            <rect x="375" y="330" width="50" height="10" />
            <rect x="430" y="330" width="45" height="10" />
            <rect x="325" y="345" width="150" height="10" />
          </g>

          {/* TEXTS */}
          <g fontSize="20" fontFamily="sans-serif" textAnchor="middle">
            {/* phiST */}
            <text x="320" y="100" fill="white">ϕST</text>
            <text x="320" y="125" fill="#00FF00">{formatWithComma(s.phiST)}</text>

            {/* deltaPB */}
            <text x="480" y="100" fill="white">δPB</text>
            <text x="480" y="125" fill="#00FF00">{formatWithComma(s.deltaPB)}</text>

            {/* deltaEPL */}
            <text x="140" y="130" fill="#444">δЭП-L</text>
            <text x="140" y="155" fill={s.deltaEPL === null ? "#155015" : "#00FF00"}>{formatWithComma(s.deltaEPL)}</text>

            {/* deltaEPR */}
            <text x="660" y="130" fill="#444">δЭП-R</text>
            <text x="660" y="155" fill={s.deltaEPR === null ? "#155015" : "#00FF00"}>{formatWithComma(s.deltaEPR)}</text>

            {/* FlapL */}
            <text x="210" y="160" fill="white">FlapL</text>
            <text x="210" y="185" fill="#00FF00">{formatWithComma(s.flapL)}</text>

            {/* FlapR */}
            <text x="590" y="160" fill="white">FlapR</text>
            <text x="590" y="185" fill="#00FF00">{formatWithComma(s.flapR)}</text>

            {/* SlatL */}
            <text x="210" y="270" fill="white">SlatL</text>
            <text x="210" y="295" fill="#00FF00">{formatWithComma(s.slatL)}</text>

            {/* SlatR */}
            <text x="590" y="270" fill="white">SlatR</text>
            <text x="590" y="295" fill="#00FF00">{formatWithComma(s.slatR)}</text>
          </g>
        </SvgTooltipGroup>

        {/* BOTTOM SECTION: WINGS TOP VIEW */}
        <SvgTooltipGroup
          transform="translate(0, 100)"
          description="Вид сверху: положения закрылков и предкрылков слева/справа."
          frameVariables={['FlapsPosition', 'SlatsPosition']}
        >
          {/* Left Wing */}
          <polygon points="360,300 60,420 360,420" fill="none" stroke="white" strokeWidth="2" />
          <polygon points="85,408 340,305 340,314 95,417" fill="#00FF00" fillOpacity="0.2" stroke="#00FF00" strokeWidth="3" />
          <polygon points="120,413 340,413 340,418 120,418" fill="#00FF00" fillOpacity="0.2" stroke="#00FF00" strokeWidth="3" transform="translate(0, -10)" />

          {/* Right Wing */}
          <polygon points="440,300 740,420 440,420" fill="none" stroke="white" strokeWidth="2" />
          <polygon points="715,408 460,305 460,314 705,417" fill="#00FF00" fillOpacity="0.2" stroke="#00FF00" strokeWidth="3" />
          <polygon points="680,413 460,413 460,418 680,418" fill="#00FF00" fillOpacity="0.2" stroke="#00FF00" strokeWidth="3" transform="translate(0, -10)" />

          {/* Texts Top View */}
          <g fontSize="22" fontFamily="monospace">
            <text x="40" y="340" fill="white">SLAT<tspan fontSize="18">L</tspan> : <tspan fill="#00FF00">{formatWithDot(s.slatL)}</tspan></text>
            <text x="170" y="470" fill="white">FLAP<tspan fontSize="18">L</tspan> : <tspan fill="#00FF00">{formatWithDot(s.flapL)}</tspan></text>

            <text x="610" y="340" fill="white">SLAT<tspan fontSize="18">R</tspan> : <tspan fill="#00FF00">{formatWithDot(s.slatR)}</tspan></text>
            <text x="480" y="470" fill="white">FLAP<tspan fontSize="18">R</tspan> : <tspan fill="#00FF00">{formatWithDot(s.flapR)}</tspan></text>
          </g>
        </SvgTooltipGroup>
      </svg>
    </div>
  );
};

registerPanelKitWidget({
  id: 'config-display',
  name: 'Config Display',
  iconName: 'Plane',
  Component: ConfigDisplayInstrument,
  tooltip: 'Config Display — конфигурация самолёта: закрылки, предкрылки, стабилизатор, интерцептор и рули высоты.',
  frameVariables: [
    'FlapsPosition',
    'SlatsPosition',
    'StabPosition',
    'Airbrake_Inner_Cmd',
    'Elev_Left_Inner',
    'Elev_Left_Outer',
    'Elev_Right_Inner',
    'Elev_Right_Outer',
  ],
});

export default ConfigDisplayInstrument;
