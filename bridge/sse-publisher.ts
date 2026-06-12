/**
 * SSE Publisher module.
 * Extracted from bridge-plugin.ts as part of monolith refactor (P0 #2).
 *
 * Manages SSE client sets for main, PFD, and raw streams.
 * Provides connection handlers and broadcast/send functions.
 */

import type http from "node:http";

const sseClients = new Set<http.ServerResponse>();
const pfdSseClients = new Set<http.ServerResponse>();
const rawSseClients = new Set<http.ServerResponse>();

export function handleSse(res: http.ServerResponse): void {
  res.writeHead(200, {
    "Cache-Control": "no-cache",
    "Content-Type": "text/event-stream; charset=utf-8",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.write("\n");
  sseClients.add(res);
  // Initial status will be sent by caller (getStatus)
  res.on("close", () => sseClients.delete(res));
}

export function handlePfdSse(res: http.ServerResponse): void {
  res.writeHead(200, {
    "Cache-Control": "no-cache",
    "Content-Type": "text/event-stream; charset=utf-8",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.write("\n");
  pfdSseClients.add(res);
  // Initial status + frame sent by caller
  res.on("close", () => pfdSseClients.delete(res));
}

export function handleRawSse(res: http.ServerResponse): void {
  res.writeHead(200, {
    "Cache-Control": "no-cache",
    "Content-Type": "text/event-stream; charset=utf-8",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.write("\n");
  rawSseClients.add(res);
  console.log(`[RAW-MONITOR] SSE client connected, total clients: ${rawSseClients.size}`);
  // Initial status sent by caller
  res.on("close", () => {
    rawSseClients.delete(res);
    console.log(`[RAW-MONITOR] SSE client disconnected, remaining clients: ${rawSseClients.size}`);
  });
}

export function sendSse(event: string, data: unknown): void {
  for (const c of sseClients) sendSseTo(c, event, data);
}

export function sendPfdSse(event: string, data: unknown): void {
  for (const c of pfdSseClients) sendSseTo(c, event, data);
}

export function sendRawSse(event: string, data: unknown): void {
  for (const c of rawSseClients) sendSseTo(c, event, data);
}

export function sendSseTo(res: http.ServerResponse, event: string, data: unknown): void {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

// Expose client sets for status reporting (size only ideally, but kept for compatibility)
export { sseClients, pfdSseClients, rawSseClients };
