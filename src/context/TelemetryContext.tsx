import React, { createContext, useContext } from 'react';
import type { PFDFrame } from '../types';

interface TelemetryContextType {
  frame: PFDFrame | null;
}

const TelemetryContext = createContext<TelemetryContextType>({ frame: null });

export const TelemetryProvider: React.FC<{
  frame: PFDFrame | null;
  children: React.ReactNode;
}> = ({ frame, children }) => (
  <TelemetryContext.Provider value={{ frame }}>
    {children}
  </TelemetryContext.Provider>
);

export const useTelemetry = () => useContext(TelemetryContext);
