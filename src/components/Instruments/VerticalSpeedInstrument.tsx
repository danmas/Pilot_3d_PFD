import React from 'react';
import type { TelemetryFrame } from '../../types';
import { VerticalSpeed } from '../PFD/VerticalSpeed';
import { registerInstrument } from '../PanelBuilder/registry';

const VerticalSpeedInstrument: React.FC<{ frame: TelemetryFrame }> = ({ frame }) => (
  <div className="w-full h-full bg-[#0a0a0f] flex items-center justify-center overflow-hidden">
    <svg viewBox="630 145 115 320" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <VerticalSpeed frame={frame} />
    </svg>
  </div>
);

registerInstrument({
  id: 'vertical-speed',
  name: 'Vertical Speed',
  iconName: 'TrendingUp',
  Component: VerticalSpeedInstrument,
});

export default VerticalSpeedInstrument;
