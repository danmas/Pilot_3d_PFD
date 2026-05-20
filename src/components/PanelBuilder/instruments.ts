/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Gauge,
  Compass,
  Clock,
  Activity,
  Thermometer,
  Wind,
  Navigation,
  Crosshair,
  Zap,
  Mountain,
  TrendingUp,
  Cog,
  Plane,
} from 'lucide-react';
import type React from 'react';
import type { InstrumentDef } from './types';

/**
 * Mapping from `iconName` (string identifier stored in InstrumentDef and
 * persisted JSON layouts) to the actual lucide-react icon component.
 *
 * Keeping the icon component out of the InstrumentDef keeps the type cleanly
 * serializable while still letting us render rich icons in the UI.
 */
export const INSTRUMENT_ICONS: Record<string, React.ElementType> = {
  Gauge,
  Activity,
  Navigation,
  Compass,
  Zap,
  Crosshair,
  Thermometer,
  Wind,
  Clock,
  Mountain,
  TrendingUp,
  Cog,
  Plane,
};

export const getInstrumentIcon = (iconName: string): React.ElementType => {
  return INSTRUMENT_ICONS[iconName] ?? Gauge;
};

export const INSTRUMENTS: InstrumentDef[] = [
  { id: 'airspeed', name: 'Airspeed', iconName: 'Gauge' },
  { id: 'altimeter', name: 'Altimeter', iconName: 'Activity' },
  { id: 'attitude', name: 'Attitude', iconName: 'Navigation' },
  { id: 'heading', name: 'Heading', iconName: 'Compass' },
  { id: 'turn', name: 'Turn Coordinator', iconName: 'Zap' },
  { id: 'rpm', name: 'Tachometer', iconName: 'Crosshair' },
  { id: 'temp', name: 'Temperature', iconName: 'Thermometer' },
  { id: 'wind', name: 'Wind Vector', iconName: 'Wind' },
  { id: 'clock', name: 'Clock', iconName: 'Clock' },
];
