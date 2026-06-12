const state = {
  mode: "live",
  eventSource: null,
  frames: [],
  frameIndex: 0,
  playing: false,
  playbackTimer: null,
  lastPlaybackAt: 0,
  playbackTimeMs: 0,
};

const PFD_KEYS = [
  "PitchAngle",
  "RollAngle",
  "MagneticHeading",
  "CAS",
  "AoA",
  "dec_BaroAltFt",
  "BaroAltitude",
  "dec_RadioAltFt",
  "Vy",
  "NormalG",
  "dec_G",
  "DME_Distance",
  "HeadingSelect",
  "SpeedSelect",
  "StandardAltitude",
  "VerticalSpeedSelect",
  "FlightDirectorOn",
  "FD_PitchCmd",
  "FD_RollCmd",
];

const els = {
  connectionDot: document.querySelector("#connection-dot"),
  connectionText: document.querySelector("#connection-text"),
  sourceConfig: document.querySelector("#source-config"),
  modeLabel: document.querySelector("#mode-label"),
  liveMode: document.querySelector("#live-mode"),
  replayMode: document.querySelector("#replay-mode"),
  statusJson: document.querySelector("#status-json"),
  frameJson: document.querySelector("#frame-json"),
  recordings: document.querySelector("#recordings"),
  refreshRecordings: document.querySelector("#refresh-recordings"),
  loadRecording: document.querySelector("#load-recording"),
  startCapture: document.querySelector("#start-capture"),
  stopCapture: document.querySelector("#stop-capture"),
  captureStatus: document.querySelector("#capture-status"),
  timeline: document.querySelector("#timeline"),
  playPause: document.querySelector("#play-pause"),
  jumpStart: document.querySelector("#jump-start"),
  jumpEnd: document.querySelector("#jump-end"),
  stepBack: document.querySelector("#step-back"),
  stepForward: document.querySelector("#step-forward"),
  speed: document.querySelector("#speed"),
  seekInput: document.querySelector("#seek-input"),
  seekButton: document.querySelector("#seek-button"),
  recordingMeta: document.querySelector("#recording-meta"),
  timeMs: document.querySelector("#timeMs"),
  pfdSchema: document.querySelector("#pfd-schema"),
  pfdAttitude: document.querySelector("#pfd-attitude"),
  pfdAttitudeValid: document.querySelector("#pfd-attitude-valid"),
  pfdAir: document.querySelector("#pfd-air"),
  pfdAirValid: document.querySelector("#pfd-air-valid"),
  pfdAltitude: document.querySelector("#pfd-altitude"),
  pfdAltitudeValid: document.querySelector("#pfd-altitude-valid"),
  pfdVspeed: document.querySelector("#pfd-vspeed"),
  pfdLoads: document.querySelector("#pfd-loads"),
  pfdNav: document.querySelector("#pfd-nav"),
  pfdAutopilot: document.querySelector("#pfd-autopilot"),
  pfdQuality: document.querySelector("#pfd-quality"),
  pfdQualityDetail: document.querySelector("#pfd-quality-detail"),
  pfdJson: document.querySelector("#pfd-json"),
};

for (const key of PFD_KEYS) {
  const el = document.querySelector(`#${key}`);
  if (el) els[key] = el;
}

els.liveMode.addEventListener("click", () => setMode("live"));
els.replayMode.addEventListener("click", () => setMode("replay"));
els.refreshRecordings.addEventListener("click", refreshRecordings);
els.loadRecording.addEventListener("click", loadSelectedRecording);
els.startCapture.addEventListener("click", startCapture);
els.stopCapture.addEventListener("click", stopCapture);
els.timeline.addEventListener("input", () => showFrameByIndex(Number(els.timeline.value)));
els.playPause.addEventListener("click", togglePlayback);
els.jumpStart.addEventListener("click", () => showFrameByIndex(0));
els.jumpEnd.addEventListener("click", () => showFrameByIndex(state.frames.length - 1));
els.stepBack.addEventListener("click", () => showFrameByIndex(state.frameIndex - 1));
els.stepForward.addEventListener("click", () => showFrameByIndex(state.frameIndex + 1));
els.seekButton.addEventListener("click", () => seekToTime(Number(els.seekInput.value)));

setMode("live");
refreshRecordings();
refreshCaptureStatus();

// ── Tab switching ──────────────────────────────────────────
const tabButtons = document.querySelectorAll(".tab-bar .tab");
const tabPanels = document.querySelectorAll(".tab-panel");

tabButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const tab = btn.dataset.tab;
    tabButtons.forEach(b => b.classList.toggle("active", b === btn));
    tabPanels.forEach(p => p.classList.toggle("active", p.dataset.panel === tab));
  });
});

function setMode(mode) {
  state.mode = mode;
  els.modeLabel.textContent = mode;
  els.liveMode.classList.toggle("primary", mode === "live");
  els.replayMode.classList.toggle("primary", mode === "replay");

  if (mode === "live") {
    stopPlayback();
    connectLive();
  } else {
    disconnectLive();
  }
}

function connectLive() {
  if (state.eventSource) {
    return;
  }

  state.eventSource = new EventSource("/events");
  setConnection(false, "connecting");

  state.eventSource.addEventListener("open", () => {
    setConnection(true, "live connected");
  });

  state.eventSource.addEventListener("frame", (event) => {
    if (state.mode !== "live") {
      return;
    }
    showFrame(JSON.parse(event.data));
  });

  state.eventSource.addEventListener("status", (event) => {
    const status = JSON.parse(event.data);
    els.statusJson.textContent = stringify(status);
    updateCaptureStatus(status.capture);
    updateSourceConfig(status.source);
    if (state.mode === "live") {
      const fresh = status.lastPacketAgeMs !== null && status.lastPacketAgeMs < 3000;
      setConnection(fresh, fresh ? "receiving UDP" : "waiting UDP");
    }
  });

  state.eventSource.addEventListener("error", () => {
    setConnection(false, "live disconnected");
  });
}

function disconnectLive() {
  if (!state.eventSource) {
    return;
  }

  state.eventSource.close();
  state.eventSource = null;
}

function setConnection(ok, text) {
  els.connectionDot.classList.toggle("ok", ok);
  els.connectionText.textContent = text;
}

function updateSourceConfig(source) {
  if (!els.sourceConfig) return;
  if (!source) {
    els.sourceConfig.textContent = "Live/replay диагностика decoder source";
    return;
  }
  els.sourceConfig.textContent = `Live/replay диагностика потока tnparserrt udp://${source.udpHost}:${source.udpPort}`;
}

async function refreshRecordings() {
  const recordings = await fetchJson("/api/recordings");
  els.recordings.replaceChildren();

  for (const recording of recordings) {
    const option = document.createElement("option");
    option.value = recording.id;
    option.textContent = `${recording.fileName} (${formatBytes(recording.bytes)})`;
    els.recordings.append(option);
  }

  if (recordings.length === 0) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "no recordings yet";
    els.recordings.append(option);
  }
}

async function refreshCaptureStatus() {
  updateCaptureStatus(await fetchJson("/api/capture/status"));
}

async function startCapture() {
  const status = await postJson("/api/capture/start");
  updateCaptureStatus(status);
  await refreshRecordings();
}

async function stopCapture() {
  const status = await postJson("/api/capture/stop");
  updateCaptureStatus(status);
  await refreshRecordings();
}

function updateCaptureStatus(capture) {
  if (!capture) {
    els.captureStatus.textContent = "capture status unknown";
    return;
  }

  const stateText = capture.active ? "recording" : capture.enabled ? "armed" : "stopped";
  const fileName = capture.path ? capture.path.split(/[\\/]/).pop() : "no file";
  els.captureStatus.textContent = `${stateText}; frames=${capture.frames ?? 0}; file=${fileName}`;
  els.startCapture.disabled = Boolean(capture.active);
  els.stopCapture.disabled = !capture.active && !capture.enabled;
}

async function loadSelectedRecording() {
  const id = els.recordings.value;
  if (!id) {
    return;
  }

  setMode("replay");
  stopPlayback();

  const [meta, frames] = await Promise.all([
    fetchJson(`/api/recordings/${encodeURIComponent(id)}/meta`),
    fetchJson(`/api/recordings/${encodeURIComponent(id)}/range?limit=50000`),
  ]);

  state.frames = prepareReplayFrames(frames);
  state.frameIndex = 0;
  state.playbackTimeMs = getFrameTime(state.frames[0]);
  els.timeline.min = "0";
  els.timeline.max = String(Math.max(0, frames.length - 1));
  els.timeline.value = "0";
  els.recordingMeta.textContent = `frames=${meta.frames}, duration=${formatNumber(getRecordingDurationMs(state.frames))} ms, file=${meta.fileName}`;

  showFrameByIndex(0);
  setConnection(true, "replay loaded");
}

function togglePlayback() {
  if (state.playing) {
    stopPlayback();
  } else {
    startPlayback();
  }
}

function startPlayback() {
  if (state.frames.length === 0) {
    return;
  }

  state.playing = true;
  state.lastPlaybackAt = performance.now();
  state.playbackTimeMs = getFrameTime(state.frames[state.frameIndex]);
  els.playPause.textContent = "Pause";

  state.playbackTimer = window.setInterval(() => {
    const now = performance.now();
    const elapsedMs = (now - state.lastPlaybackAt) * Number(els.speed.value);
    state.lastPlaybackAt = now;

    state.playbackTimeMs += elapsedMs;
    const nextIndex = findFrameIndexAtOrAfter(state.playbackTimeMs);

    if (nextIndex >= state.frames.length - 1) {
      showFrameByIndex(state.frames.length - 1);
      stopPlayback();
      return;
    }

    showFrameByIndex(nextIndex);
  }, 40);
}

function stopPlayback() {
  state.playing = false;
  els.playPause.textContent = "Play";

  if (state.playbackTimer) {
    window.clearInterval(state.playbackTimer);
    state.playbackTimer = null;
  }
}

function seekToTime(timeMs) {
  if (state.frames.length === 0 || !Number.isFinite(timeMs)) {
    return;
  }

  showFrameByIndex(findClosestFrameIndex(timeMs));
}

function showFrameByIndex(index) {
  if (state.frames.length === 0) {
    return;
  }

  const clamped = Math.max(0, Math.min(index, state.frames.length - 1));
  state.frameIndex = clamped;
  state.playbackTimeMs = getFrameTime(state.frames[clamped]);
  els.timeline.value = String(clamped);
  showFrame(state.frames[clamped]);
}

function showFrame(frame) {
  const frameTime = getFrameTime(frame);
  els.timeMs.textContent = formatNumber(frameTime);
  els.seekInput.value = Math.round(frameTime);

  // Show PFD subset in the PFD tab (flat keys)
  for (const key of PFD_KEYS) {
    if (els[key]) {
      els[key].textContent = formatNumber(frame?.[key]);
    }
  }

  showPfdFrame(frame);
  els.frameJson.textContent = stringify(frame ?? {});
  els.pfdJson.textContent = stringify(frame ?? {});
}

function showPfdFrame(frame) {
  if (!frame) {
    els.pfdSchema.textContent = "telemetry-frame.v1";
    els.pfdAttitude.textContent = "-";
    els.pfdAttitudeValid.textContent = "valid: -";
    els.pfdAir.textContent = "-";
    els.pfdAirValid.textContent = "valid: -";
    els.pfdAltitude.textContent = "-";
    els.pfdAltitudeValid.textContent = "valid: -";
    els.pfdVspeed.textContent = "-";
    els.pfdLoads.textContent = "-";
    els.pfdNav.textContent = "-";
    els.pfdAutopilot.textContent = "-";
    els.pfdQuality.textContent = "-";
    els.pfdQualityDetail.textContent = "-";
    return;
  }

  const pitch = finiteOrNull(frame.PitchAngle);
  const roll = finiteOrNull(frame.RollAngle);
  const heading = finiteOrNull(frame.MagneticHeading);
  const cas = finiteOrNull(frame.CAS);
  const aoa = finiteOrNull(frame.AoA);
  const baroAltFt = finiteOrNull(frame.dec_BaroAltFt);
  const radioAltFt = finiteOrNull(frame.dec_RadioAltFt);
  const baroAltM = finiteOrNull(frame.BaroAltitude);
  const vs = finiteOrNull(frame.Vy);
  const ny = finiteOrNull(frame.NormalG);
  const g = finiteOrNull(frame.dec_G);
  const dme = finiteOrNull(frame.DME_Distance);
  const hdgSel = finiteOrNull(frame.HeadingSelect);
  const spdSel = finiteOrNull(frame.SpeedSelect);
  const altSel = finiteOrNull(frame.StandardAltitude);
  const vsSel = finiteOrNull(frame.VerticalSpeedSelect);
  const fdOn = frame.FlightDirectorOn;
  const fdPitch = finiteOrNull(frame.FD_PitchCmd);
  const fdRoll = finiteOrNull(frame.FD_RollCmd);

  const attValid = pitch !== null && roll !== null;

  els.pfdSchema.textContent = `${frame.schema ?? "telemetry-frame.v1"} #${frame.seq ?? 0}`;
  els.pfdAttitude.textContent = `P ${formatNumber(pitch)} / R ${formatNumber(roll)} / H ${formatNumber(heading)}`;
  els.pfdAttitudeValid.textContent = `valid: ${attValid}`;
  els.pfdAir.textContent = `CAS ${formatNumber(cas)} / AoA ${formatNumber(aoa)}`;
  els.pfdAirValid.textContent = `valid: ${cas !== null}`;
  els.pfdAltitude.textContent = `RA ${formatNumber(radioAltFt)} ft / BARO ${formatNumber(baroAltFt)} ft`;
  els.pfdAltitudeValid.textContent = `valid: ${baroAltFt !== null || radioAltFt !== null}; metric ${formatNumber(baroAltM)} m`;
  els.pfdVspeed.textContent = formatNumber(vs);
  els.pfdLoads.textContent = `Ny ${formatNumber(ny)} / G ${formatNumber(g)}`;
  els.pfdNav.textContent = `DME ${formatNumber(dme)} / HDG bug ${formatNumber(hdgSel)}`;
  els.pfdAutopilot.textContent = `SPD ${formatNumber(spdSel)} / ALT ${formatNumber(altSel)} / VS ${formatNumber(vsSel)} / FD ${formatBoolean(fdOn)}`;
  els.pfdQuality.textContent = "flat telemetry-frame.v1";
  els.pfdQualityDetail.textContent = `${PFD_KEYS.filter(k => frame[k] !== undefined && frame[k] !== null).length}/${PFD_KEYS.length} PFD keys present`;
}

function findFrameIndexAtOrAfter(timeMs) {
  for (let i = state.frameIndex; i < state.frames.length; i += 1) {
    if (getFrameTime(state.frames[i]) >= timeMs) {
      return i;
    }
  }

  return state.frames.length - 1;
}

function findClosestFrameIndex(timeMs) {
  let bestIndex = 0;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (let i = 0; i < state.frames.length; i += 1) {
    const distance = Math.abs(getFrameTime(state.frames[i]) - timeMs);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = i;
    }
  }

  return bestIndex;
}

function prepareReplayFrames(frames) {
  const firstReceivedAt = Date.parse(frames[0]?.receivedAt ?? "");
  const canUseReceivedAt = Number.isFinite(firstReceivedAt);

  return frames.map((frame, index) => {
    if (canUseReceivedAt) {
      const receivedAt = Date.parse(frame.receivedAt ?? "");
      if (Number.isFinite(receivedAt)) {
        return { ...frame, replayTimeMs: Math.max(0, receivedAt - firstReceivedAt) };
      }
    }

    return { ...frame, replayTimeMs: Number.isFinite(frame.timeMs) ? frame.timeMs : index * 40 };
  });
}

function getFrameTime(frame) {
  if (!frame) {
    return 0;
  }

  return Number.isFinite(frame.replayTimeMs) ? frame.replayTimeMs : frame.timeMs;
}

function getRecordingDurationMs(frames) {
  if (frames.length === 0) {
    return 0;
  }

  return getFrameTime(frames[frames.length - 1]) - getFrameTime(frames[0]);
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${url}: ${response.status}`);
  }
  return response.json();
}

async function postJson(url) {
  const response = await fetch(url, { method: "POST" });
  if (!response.ok) {
    throw new Error(`${url}: ${response.status}`);
  }
  return response.json();
}

function stringify(value) {
  return JSON.stringify(value, null, 2);
}

function finiteOrNull(value) {
  return Number.isFinite(value) ? value : null;
}

function formatBoolean(value) {
  return typeof value === "boolean" ? String(value) : value !== null && value !== undefined ? String(value) : "-";
}

function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return "-";
  }

  if (Math.abs(value) >= 1000) {
    return value.toFixed(0);
  }

  return value.toFixed(3);
}

function formatBytes(value) {
  if (value < 1024) {
    return `${value} B`;
  }
  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} KB`;
  }
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}
