import React, { createContext, useContext } from 'react';
import type { TelemetryFrame } from '../types';

interface TelemetryContextType {
  frame: TelemetryFrame | null;
}

const TelemetryContext = createContext<TelemetryContextType>({ frame: null });

export const TelemetryProvider: React.FC<{
  frame: TelemetryFrame | null;
  children: React.ReactNode;
}> = ({ frame, children }) => (
  <TelemetryContext.Provider value={{ frame }}>
    {children}
  </TelemetryContext.Provider>
);

export const useTelemetry = () => useContext(TelemetryContext);
