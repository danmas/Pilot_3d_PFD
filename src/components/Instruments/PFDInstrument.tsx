import React from 'react';
import type { TelemetryFrame } from '../../types';
import { PFD } from '../PFD/PFD';
import { registerInstrument } from '../PanelBuilder/registry';

const PFDInstrument: React.FC<{ frame: TelemetryFrame }> = ({ frame }) => (
  <div className="w-full h-full bg-[#0a0a0f] flex items-center justify-center overflow-hidden">
    <PFD frame={frame} />
  </div>
);

registerInstrument({
  id: 'pfd',
  name: 'Primary Flight Display',
  iconName: 'Activity',
  Component: PFDInstrument,
});

export default PFDInstrument;
