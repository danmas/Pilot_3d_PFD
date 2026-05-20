import React from 'react';
import type { PFDFrame } from '../../types';
import { AltitudeTape } from '../PFD/AltitudeTape';
import { registerInstrument } from '../PanelBuilder/registry';

const AltitudeInstrument: React.FC<{ frame: PFDFrame }> = ({ frame }) => (
  <div className="w-full h-full bg-[#0a0a0f] flex items-center justify-center overflow-hidden">
    <svg viewBox="525 30 145 540" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <AltitudeTape frame={frame} />
    </svg>
  </div>
);

registerInstrument({
  id: 'altitude',
  name: 'Altitude',
  iconName: 'Mountain',
  Component: AltitudeInstrument,
});

export default AltitudeInstrument;
