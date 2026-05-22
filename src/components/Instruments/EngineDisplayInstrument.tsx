import React from 'react';
import type { TelemetryFrame } from '../../types';
import { SvgTooltipGroup } from '../PanelBuilder/InstrumentTooltip';
import { registerInstrument } from '../PanelBuilder/registry';

const finiteNumber = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

function EngineDial({ cx, cy, label, value, frameVariable, maxVal = 100, tickInterval = 20 }: { cx: number; cy: number; label: string; value: number; frameVariable: string; maxVal?: number; tickInterval?: number }) {
  const angleRange = 300;
  const startAngle = -150;
  const endAngle = 150;
  const radiusOuter = 95;
  const radiusInner = 80;

  const ticks = [];
  for (let i = 0; i <= maxVal; i += (tickInterval / 2)) {
    const isMajor = (i % tickInterval) === 0;
    const a = startAngle + (i / maxVal) * angleRange;

    const p1 = polarToCartesian(cx, cy, radiusOuter, a);
    const p2 = polarToCartesian(cx, cy, isMajor ? radiusInner - 5 : radiusInner + 5, a);

    ticks.push(
      <line key={`tick-${label}-${i}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="white" strokeWidth={isMajor ? 3 : 1.5} />
    );

    if (isMajor) {
      const pText = polarToCartesian(cx, cy, radiusInner - 20, a);
      ticks.push(
        <text key={`text-${label}-${i}`} x={pText.x} y={pText.y + 6} fill="white" fontSize="18" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
          {i / 10}
        </text>
      );
    }
  }

  const safeValue = value !== null ? Math.max(0, Math.min(value, 110)) : 0;
  const needleAngle = startAngle + (safeValue / maxVal) * angleRange;
  const pNeedleOuter = polarToCartesian(cx, cy, radiusInner - 5, needleAngle);
  const pNeedleInner = polarToCartesian(cx, cy, -15, needleAngle);

  return (
    <SvgTooltipGroup
      description={`${label.toUpperCase()} — обороты двигателя, проценты.`}
      frameVariables={[frameVariable]}
    >
      {/* Outer rim arc */}
      <path
        d={`M ${polarToCartesian(cx, cy, radiusOuter, startAngle).x} ${polarToCartesian(cx, cy, radiusOuter, startAngle).y} A ${radiusOuter} ${radiusOuter} 0 1 1 ${polarToCartesian(cx, cy, radiusOuter, endAngle).x} ${polarToCartesian(cx, cy, radiusOuter, endAngle).y}`}
        fill="none" stroke="white" strokeWidth="2"
      />

      {/* Red zone beyond 100% */}
      <path
        d={`M ${polarToCartesian(cx, cy, radiusOuter, endAngle).x} ${polarToCartesian(cx, cy, radiusOuter, endAngle).y} A ${radiusOuter} ${radiusOuter} 0 0 1 ${polarToCartesian(cx, cy, radiusOuter, endAngle + 15).x} ${polarToCartesian(cx, cy, radiusOuter, endAngle + 15).y}`}
        fill="none" stroke="#FF0000" strokeWidth="4"
      />
      <line
        x1={polarToCartesian(cx, cy, radiusOuter, endAngle + 15).x}
        y1={polarToCartesian(cx, cy, radiusOuter, endAngle + 15).y}
        x2={polarToCartesian(cx, cy, radiusInner, endAngle + 15).x}
        y2={polarToCartesian(cx, cy, radiusInner, endAngle + 15).y}
        stroke="#FF0000" strokeWidth="4"
      />

      {ticks}

      {/* Label n1 / n2 */}
      <text x={cx} y={cy - 20} fill="white" fontSize="24" fontFamily="sans-serif" textAnchor="middle">
        n<tspan fontSize="18" dy="4">{label.replace('n', '')}</tspan>
      </text>
      <text x={cx} y={cy + 10} fill="white" fontSize="18" fontFamily="sans-serif" textAnchor="middle">
        %
      </text>

      {/* Needle */}
      {value !== null && (
        <>
          <line x1={pNeedleInner.x} y1={pNeedleInner.y} x2={pNeedleOuter.x} y2={pNeedleOuter.y} stroke="#00FF00" strokeWidth="3" />
          <circle cx={cx} cy={cy} r="6" fill="#00FF00" />
        </>
      )}
      <circle cx={cx} cy={cy} r="3" fill="black" />

      {/* Digital Box */}
      <g transform={`translate(${cx - 35}, ${cy + radiusOuter - 15})`}>
        <rect x="0" y="0" width="70" height="35" rx="5" ry="5" fill="black" stroke="#666" strokeWidth="2" />
        <text x="35" y="24" fill="white" fontSize="20" fontFamily="monospace" textAnchor="middle">
          {value !== null ? value.toFixed(1) : '---'}
        </text>
      </g>
    </SvgTooltipGroup>
  );
}

const EngineDisplayInstrument: React.FC<{ frame: TelemetryFrame }> = ({ frame }) => {
  const engine = {
    n1: finiteNumber(frame.Engine_N1_Left),
    n2: finiteNumber(frame.Engine_N1_Right),
    fuelFlow: finiteNumber(frame.TotalFuel),
    egt: finiteNumber(frame.APU_EGT),
    oilPress: finiteNumber(frame.APU_OilPressure),
    oilTemp: finiteNumber(frame.APU_OilTemp),
    vibration: null,
  };

  const rows = [
    { label: 'FF', labelSub: '', value: engine.fuelFlow, unit: 'T/h', fixed: 2 },
    { label: 't', labelSub: 'г', value: engine.egt, unit: 'x 100 °C', fixed: 1 },
    { label: 'P', labelSub: 'м', value: engine.oilPress, unit: 'КГ/СМ²', fixed: 1 },
    { label: 'T', labelSub: 'м', value: engine.oilTemp, unit: '°C', fixed: 0 },
    { label: 'Вибр', labelSub: '', value: engine.vibration, unit: '%', fixed: 1 },
  ];

  return (
    <div className="w-full h-full relative bg-[#050505] font-sans flex flex-col items-center justify-center select-none overflow-hidden">
      <svg viewBox="0 0 600 460" className="w-full h-full" preserveAspectRatio="xMidYMid meet">

        {/* Dials */}
        <EngineDial cx={180} cy={130} label="n1" value={engine.n1 ?? 0} frameVariable="Engine_N1_Left" />
        <EngineDial cx={420} cy={130} label="n2" value={engine.n2 ?? 0} frameVariable="Engine_N1_Right" />

        {/* Data rows */}
        <g transform="translate(0, 20)">
          {rows.map((r, i) => {
            const y = 260 + i * 36;
            const frameVariables = [
              ['TotalFuel'],
              ['APU_EGT'],
              ['APU_OilPressure'],
              ['APU_OilTemp'],
              [],
            ][i];
            return (
              <SvgTooltipGroup
                key={i}
                description={`${r.label}${r.labelSub} — ${r.unit}`}
                frameVariables={frameVariables}
              >
                {/* Label */}
                <text x="270" y={y} fill="white" fontSize="20" fontFamily="sans-serif" textAnchor="end">
                  {r.label}<tspan fontSize="15" dy="5">{r.labelSub}</tspan>
                </text>

                {/* Value Box */}
                <g transform={`translate(285, ${y - 20})`}>
                  <rect width="60" height="26" rx="4" fill="black" stroke="#666" strokeWidth="2" />
                  <text x="30" y="19" fill="white" fontSize="18" fontFamily="monospace" textAnchor="middle">
                    {r.value !== null && r.value !== undefined ? r.value.toFixed(r.fixed) : '---'}
                  </text>
                </g>

                {/* Unit */}
                <text x="355" y={y} fill="white" fontSize="16" fontFamily="sans-serif" textAnchor="start">
                  <tspan dy={r.labelSub ? "-5" : "0"}>{r.unit}</tspan>
                </text>
              </SvgTooltipGroup>
            );
          })}
        </g>
      </svg>
    </div>
  );
};

registerInstrument({
  id: 'engine-display',
  name: 'Engine Display',
  iconName: 'Cog',
  Component: EngineDisplayInstrument,
  tooltip: 'Engine Display — параметры двигателей и APU: N1/N2, топливо, EGT, давление и температура масла.',
  frameVariables: [
    'Engine_N1_Left',
    'Engine_N1_Right',
    'TotalFuel',
    'APU_EGT',
    'APU_OilPressure',
    'APU_OilTemp',
  ],
});

export default EngineDisplayInstrument;
