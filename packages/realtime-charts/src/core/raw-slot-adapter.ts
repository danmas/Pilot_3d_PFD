// ─── Raw Slot Data Adapter ───
// Provides data for raw UDP slots (pre-decode mode).
// Maps slot indices 0..N to keys "slot_0", "slot_1", etc.

import type { ParamInfo, ChartStripSnapshot } from './types.js';
import { DataHub } from './data-hub.js';

/**
 * Create a DataHub configured from raw slot indices.
 * @param slotCount - number of slots to track (default 50, max 50)
 */
export function createRawSlotHub(slotCount: number = 50): DataHub {
  const count = Math.min(slotCount, 50);
  const params: ParamInfo[] = [];

  for (let i = 0; i < count; i++) {
    params.push({
      key: `slot_${i}`,
      displayName: `raw slot ${i}`,
      index: i,
    });
  }

  const hub = new DataHub(50);
  hub.configure(params);
  return hub;
}

/**
 * Ingest a raw UDP frame into a raw-slot DataHub.
 * @param hub - DataHub configured for raw slots
 * @param values - raw frame values
 * @param epochMs - receive timestamp
 */
export function ingestRawFrame(hub: DataHub, values: number[], epochMs: number): void {
  hub.ingestFrame(values, epochMs);
}
