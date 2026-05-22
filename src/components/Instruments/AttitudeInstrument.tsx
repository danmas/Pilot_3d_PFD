import React from 'react';
import type { TelemetryFrame } from '../../types';
import { AttitudeIndicator } from '../PFD/AttitudeIndicator';
import { registerInstrument } from '../PanelBuilder/registry';

const AttitudeInstrument: React.FC<{ frame: TelemetryFrame }> = ({ frame }) => (
  <div className="w-full h-full bg-[#0a0a0f] flex items-center justify-center overflow-hidden">
    <svg viewBox="200 100 400 420" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <AttitudeIndicator frame={frame} />
    </svg>
  </div>
);

registerInstrument({
  id: 'attitude',
  name: 'Attitude Indicator',
  iconName: 'Crosshair',
  Component: AttitudeInstrument,
  tooltip: 'Attitude Indicator — положение самолёта относительно горизонта: тангаж, крен, радиовысота и команды Flight Director.',
  frameVariables: [
    'PitchAngle',
    'RollAngle',
    'RadioAltitude',
    'dec_RadioAltFt',
    'FD_PitchCmd',
    'FD_RollCmd',
  ],
});

export default AttitudeInstrument;
