// Barrel file — importing each instrument triggers self-registration
import './PFDInstrument';
import './AttitudeInstrument';
import './AirspeedInstrument';
import './AltitudeInstrument';
import './VerticalSpeedInstrument';
import './AoAInstrument';
import './NavDisplayInstrument';
import './AuxPanelInstrument';
import './EngineDisplayInstrument';
import './ConfigDisplayInstrument';
import './PFD2Instrument';

// Re-export registry helpers for convenience
export {
  registerInstrument,
  getRegisteredInstrument,
  getAllInstruments,
} from '../PanelBuilder/registry';
export type { RegisteredInstrument, InstrumentComponent } from '../PanelBuilder/registry';
