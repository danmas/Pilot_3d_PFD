import React from 'react';
import type { PFDFrame } from '../../types';
import { AttitudeIndicator } from '../PFD/AttitudeIndicator';
import { registerInstrument } from '../PanelBuilder/registry';

const AttitudeInstrument: React.FC<{ frame: PFDFrame }> = ({ frame }) => (
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
});

export default AttitudeInstrument;
