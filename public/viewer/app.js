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

const fields = [
  "RAltitude",
  "DME_DIST",
  "Heading1",
  "RollAngle",
  "PitchAngle",
  "Ny",
  "CAS",
  "Vy",
];

const els = {
  connectionDot: document.querySelector("#connection-dot"),
  connectionText: document.querySelector("#connection-text"),
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

for (const field of fields) {
  els[field] = document.querySelector(`#${field}`);
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
  const pfdFrame = buildPfdFrame(frame);

  els.timeMs.textContent = formatNumber(frameTime);
  els.seekInput.value = Math.round(frameTime);

  for (const field of fields) {
    els[field].textContent = formatNumber(frame?.raw?.[field]);
  }

  showPfdFrame(pfdFrame);
  els.frameJson.textContent = stringify(frame ?? {});
  els.pfdJson.textContent = stringify(pfdFrame ?? {});
}

function showPfdFrame(frame) {
  if (!frame) {
    els.pfdSchema.textContent = "pfd-frame.v1";
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

  els.pfdSchema.textContent = `${frame.schema} #${frame.seq}`;
  els.pfdAttitude.textContent = `P ${formatNumber(frame.attitude.pitchDeg)} / R ${formatNumber(frame.attitude.rollDeg)} / H ${formatNumber(frame.attitude.headingDeg)}`;
  els.pfdAttitudeValid.textContent = `valid: ${frame.attitude.valid}`;
  els.pfdAir.textContent = `CAS ${formatNumber(frame.air.cas)} / AoA ${formatNumber(frame.air.aoaDeg)}`;
  els.pfdAirValid.textContent = `valid: ${frame.air.valid}`;
  els.pfdAltitude.textContent = `RA ${formatNumber(frame.altitude.radioAlt)} / BARO ${formatNumber(frame.altitude.baroAltFt)} ft`;
  els.pfdAltitudeValid.textContent = `valid: ${frame.altitude.valid}; metric ${formatNumber(frame.altitude.baroAltM)} m`;
  els.pfdVspeed.textContent = formatNumber(frame.altitude.verticalSpeed);
  els.pfdLoads.textContent = `Ny ${formatNumber(frame.loads.ny)} / G ${formatNumber(frame.loads.g)}`;
  els.pfdNav.textContent = `DME ${formatNumber(frame.nav.dmeDistance)} / HDG bug ${formatNumber(frame.nav.selectedHeadingDeg)}`;
  els.pfdAutopilot.textContent = `SPD ${formatNumber(frame.autopilot.selectedSpeed)} / ALT ${formatNumber(frame.autopilot.selectedAltitudeFt)} / FD ${formatBoolean(frame.autopilot.fdActive)}`;
  els.pfdQuality.textContent = `missing ${frame.quality.missing.length}; unconfirmed ${frame.quality.unconfirmed.length}`;
  els.pfdQualityDetail.textContent = [...frame.quality.missing, ...frame.quality.unconfirmed].join("; ");
}

function buildPfdFrame(frame) {
  if (!frame) {
    return null;
  }

  const baroAltFt = null;

  return {
    schema: "pfd-frame.v1",
    seq: frame.seq ?? 0,
    timeMs: frame.timeMs ?? 0,
    replayTimeMs: frame.replayTimeMs,
    receivedAt: frame.receivedAt ?? null,
    source: frame.source ?? "tnparser-udp-14444",
    attitude: {
      pitchDeg: finiteOrNull(frame.attitude?.pitchDeg),
      rollDeg: finiteOrNull(frame.attitude?.rollDeg),
      headingDeg: finiteOrNull(frame.attitude?.headingDeg),
      valid: Number.isFinite(frame.attitude?.pitchDeg) && Number.isFinite(frame.attitude?.rollDeg),
    },
    air: {
      cas: finiteOrNull(frame.motion?.cas),
      aoaDeg: null,
      valid: Number.isFinite(frame.motion?.cas),
    },
    altitude: {
      radioAlt: finiteOrNull(frame.position?.altitude),
      baroAltFt,
      baroAltM: feetToMeters(baroAltFt),
      verticalSpeed: finiteOrNull(frame.motion?.vy),
      valid: Number.isFinite(frame.position?.altitude) || Number.isFinite(frame.motion?.vy),
    },
    loads: {
      ny: finiteOrNull(frame.motion?.ny),
      g: null,
    },
    nav: {
      dmeDistance: finiteOrNull(frame.position?.distance),
      selectedHeadingDeg: null,
    },
    autopilot: {
      selectedSpeed: null,
      selectedAltitudeFt: null,
      selectedVerticalSpeed: null,
      fdActive: null,
      fdPitchCmdDeg: null,
      fdRollCmdDeg: null,
    },
    quality: {
      missing: [
        "baroAltFt",
        "aoaDeg",
        "selectedSpeed",
        "selectedAltitudeFt",
        "selectedHeadingDeg",
        "selectedVerticalSpeed",
        "fdActive",
        "fdPitchCmdDeg",
        "fdRollCmdDeg",
      ],
      unconfirmed: ["Vy units/sign", "Ny scale/origin", "RAltitude semantic meaning"],
    },
    raw: frame.raw ?? {},
  };
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

function feetToMeters(value) {
  return value === null ? null : Math.round(value * 0.3048);
}

function formatBoolean(value) {
  return typeof value === "boolean" ? String(value) : "-";
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
