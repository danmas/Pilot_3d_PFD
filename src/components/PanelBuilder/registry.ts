import type React from 'react';
import type { TelemetryFrame } from '../../types';

/** Every instrument component must accept this prop shape */
export type InstrumentComponent = React.FC<{ frame: TelemetryFrame }>;

export interface RegisteredInstrument {
  id: string;
  name: string;
  iconName: string;
  Component: InstrumentComponent;
  tooltip?: string;
  frameVariables?: string[];
}

/** Central registry map */
const registry = new Map<string, RegisteredInstrument>();

export const registerInstrument = (inst: RegisteredInstrument) => {
  registry.set(inst.id, inst);
};

export const getRegisteredInstrument = (id: string) => registry.get(id);

export const getAllInstruments = (): RegisteredInstrument[] =>
  Array.from(registry.values());
