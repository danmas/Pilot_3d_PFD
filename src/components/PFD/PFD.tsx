import React from 'react';
import { TelemetryFrame } from '../../types';
import { AttitudeIndicator } from './AttitudeIndicator';
import { AirspeedTape } from './AirspeedTape';
import { AltitudeTape } from './AltitudeTape';
import { VerticalSpeed } from './VerticalSpeed';
import { AoATape } from './AoATape';

interface PFDProps {
  frame: TelemetryFrame;
}

export function PFD({ frame }: PFDProps) {
  return (
    <div className="w-full h-full relative bg-black font-sans overflow-hidden">
      <svg
        className="w-full h-full absolute inset-0"
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid meet"
      >
        <AttitudeIndicator frame={frame} />
        <AirspeedTape frame={frame} />
        <AoATape frame={frame} />
        <AltitudeTape frame={frame} />
        <VerticalSpeed frame={frame} />
      </svg>
    </div>
  );
}
