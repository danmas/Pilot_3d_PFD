// ─── @pilot-3d-pfd/realtime-charts ───

// Core (pure functions, framework-agnostic)
export * from './core/index.js';

// Data adapters
export { PFDTelemetryHub, paramsFromCatalog, frameToValuesFromCatalog } from './core/pfd-adapter.js';
export { createRawSlotHub, ingestRawFrame } from './core/raw-slot-adapter.js';

// Renderers (Canvas 2D) — all functions exported individually via core/index

// React components
export { ChartsPanel } from './components/charts-panel.jsx';
export type { ChartMode, ChartsPanelProps } from './components/charts-panel.jsx';
export { ChartsView, initCharts } from './views/charts-view.jsx';
export type { ChartsViewProps } from './views/charts-view.jsx';
