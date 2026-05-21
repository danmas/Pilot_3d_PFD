import React from 'react';
import type { TelemetryFrame } from '../../types';
import { AirspeedTape } from '../PFD/AirspeedTape';
import { registerInstrument } from '../PanelBuilder/registry';

const AirspeedInstrument: React.FC<{ frame: TelemetryFrame }> = ({ frame }) => (
  <div className="w-full h-full bg-[#0a0a0f] flex items-center justify-center overflow-hidden">
    <svg viewBox="60 30 180 540" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <AirspeedTape frame={frame} />
    </svg>
  </div>
);

registerInstrument({
  id: 'airspeed',
  name: 'Airspeed',
  iconName: 'Gauge',
  Component: AirspeedInstrument,
});

export default AirspeedInstrument;
