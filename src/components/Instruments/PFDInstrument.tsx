import React from 'react';
import type { TelemetryFrame } from '../../types';
import { PFD } from '../PFD/PFD';
import { registerPanelKitWidget } from '../PanelKit';

const PFDInstrument: React.FC<{ frame: TelemetryFrame }> = ({ frame }) => (
  <div className="w-full h-full bg-[#0a0a0f] flex items-center justify-center overflow-hidden">
    <PFD frame={frame} />
  </div>
);

registerPanelKitWidget({
  id: 'pfd',
  name: 'Flight Display',
  iconName: 'Activity',
  Component: PFDInstrument,
  tooltip: 'Flight Display — основной пилотажный индикатор: авиагоризонт, скорость, высота, вариометр, AoA, G и команды Flight Director.',
  frameVariables: [
    'PitchAngle',
    'RollAngle',
    'RadioAltitude',
    'dec_RadioAltFt',
    'FD_PitchCmd',
    'FD_RollCmd',
    'CAS',
    'SpeedSelect',
    'AoA',
    'dec_G',
    'BaroAltitude',
    'dec_BaroAltFt',
    'StandardAltitude',
    'Vy',
  ],
});

export default PFDInstrument;
