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
import './Aircraft3DInstrument';

// Re-export registry helpers for convenience
export {
  registerPanelKitWidget,
  getRegisteredPanelKitWidget,
  getAllRegisteredPanelKitWidgets,
} from '../PanelKit';
export type { RegisteredPanelKitWidget, PanelKitWidgetComponent } from '../PanelKit';
