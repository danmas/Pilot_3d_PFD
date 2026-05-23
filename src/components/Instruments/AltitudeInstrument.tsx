import React from 'react';
import type { TelemetryFrame } from '../../types';
import { AltitudeTape } from '../PFD/AltitudeTape';
import { registerPanelKitWidget } from '../PanelKit';

const AltitudeInstrument: React.FC<{ frame: TelemetryFrame }> = ({ frame }) => (
  <div className="w-full h-full bg-[#0a0a0f] flex items-center justify-center overflow-hidden">
    <svg viewBox="525 30 145 540" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <AltitudeTape frame={frame} />
    </svg>
  </div>
);

registerPanelKitWidget({
  id: 'altitude',
  name: 'Altitude',
  iconName: 'Mountain',
  Component: AltitudeInstrument,
  tooltip: 'Altitude — лента высоты: барометрическая высота, fallback на радиовысоту, метрическая индикация и заданная высота.',
  frameVariables: [
    'BaroAltitude',
    'dec_BaroAltFt',
    'RadioAltitude',
    'dec_RadioAltFt',
    'StandardAltitude',
  ],
});

export default AltitudeInstrument;
