import React from 'react';
import type { TelemetryFrame } from '../../types';
import { VerticalSpeed } from '../PFD/VerticalSpeed';
import { registerPanelKitWidget } from '../PanelKit';

const VerticalSpeedInstrument: React.FC<{ frame: TelemetryFrame }> = ({ frame }) => (
  <div className="w-full h-full bg-[#0a0a0f] flex items-center justify-center overflow-hidden">
    <svg viewBox="630 145 115 320" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <VerticalSpeed frame={frame} />
    </svg>
  </div>
);

registerPanelKitWidget({
  id: 'vertical-speed',
  name: 'Vertical Speed',
  iconName: 'TrendingUp',
  Component: VerticalSpeedInstrument,
  tooltip: 'Vertical Speed — вариометр, показывает вертикальную скорость набора или снижения.',
  frameVariables: [
    'Vy',
  ],
});

export default VerticalSpeedInstrument;
