import React from 'react';
import type { TelemetryFrame } from '../../types';
import { AoATape } from '../PFD/AoATape';
import { registerInstrument } from '../PanelBuilder/registry';

const AoAInstrument: React.FC<{ frame: TelemetryFrame }> = ({ frame }) => (
  <div className="w-full h-full bg-[#0a0a0f] flex items-center justify-center overflow-hidden">
    <svg viewBox="45 125 95 385" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <AoATape frame={frame} />
    </svg>
  </div>
);

registerInstrument({
  id: 'aoa',
  name: 'Angle of Attack',
  iconName: 'Wind',
  Component: AoAInstrument,
  tooltip: 'Angle of Attack — угол атаки и текущая вертикальная перегрузка G.',
  frameVariables: [
    'AoA',
    'dec_G',
  ],
});

export default AoAInstrument;
