/**
 * ChartLatency — замер display latency для страницы графиков.
 *
 * Измеряет путь: bridge T₀ (_t0_ms) → ChartsPanel rAF canvas pixel (T₁).
 * Легковесный ring buffer (1000 samples), только display_ms.
 */

/* ─── Кольцевой буфер (1000 сэмплов) ─── */
const MAX_SAMPLES = 1000;

const displaySamples: number[] = [];
let sampleHead = 0;
let sampleCount = 0;

/** Добавить замер display_ms */
export function addChartSample(displayMs: number): void {
  if (displaySamples.length < MAX_SAMPLES) {
    displaySamples.push(displayMs);
  } else {
    displaySamples[sampleHead % MAX_SAMPLES] = displayMs;
  }
  sampleHead++;
  sampleCount++;
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(idx, sorted.length - 1))];
}

export function getChartStats() {
  if (displaySamples.length === 0) {
    return { count: 0, p50: 0, p95: 0, p99: 0, max: 0 };
  }
  const sorted = [...displaySamples].sort((a, b) => a - b);
  return {
    count: displaySamples.length,
    p50: percentile(sorted, 50),
    p95: percentile(sorted, 95),
    p99: percentile(sorted, 99),
    max: sorted[sorted.length - 1],
  };
}

export function resetChartLatency(): void {
  displaySamples.length = 0;
  sampleHead = 0;
  sampleCount = 0;
}
