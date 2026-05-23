import {
  Activity,
  CircleDot,
  Clock,
  Cog,
  Compass,
  Crosshair,
  Gauge,
  Mountain,
  Navigation,
  Plane,
  Thermometer,
  TrendingUp,
  Wind,
  Zap,
} from 'lucide-react';
import type React from 'react';

export const PANELKIT_ICONS: Record<string, React.ElementType> = {
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
  CircleDot,
};

export const getPanelKitIcon = (iconName: string): React.ElementType => {
  return PANELKIT_ICONS[iconName] ?? Gauge;
};
