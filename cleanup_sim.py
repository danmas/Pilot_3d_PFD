#!/usr/bin/env python3
"""Remove all simulator/blackbox code from bridge-plugin.ts"""
import re

with open('bridge-plugin.ts', 'r') as f:
    lines = f.readlines()

# ---- Phase 1: mark lines to remove ----
remove = set()

for i, line in enumerate(lines):
    stripped = line.strip()

    # Individual removable lines
    if any(x in stripped for x in [
        'DEFAULT_SIMULATOR_INITIAL_CONFIG,',
        'FlightSimulator,',
        'type SimulatorBlackboxFrame,',
        'type SimulatorControls,',
        'type SimulatorInitialConfig,',
        'type SimulatorPilotSnapshot,',
        '} from "./simulator";',
    ]):
        remove.add(i)

    # SIMULATOR_CONFIG_PATH
    if 'const SIMULATOR_CONFIG_PATH' in stripped:
        remove.add(i)

    # Simulator state block + profiles
    if any(x in stripped for x in [
        '// ── simulator state',
        'let bridgeMode:',
        'const simulator = new FlightSimulator',
        'let simulatorInterval:',
        'let simulatorPilotSnapshot:',
        'let blackboxStream:',
        'let blackboxPath:',
        'let blackboxFrames',
        'const SIMULATOR_PROFILES:',
        'const SIMULATOR_INITIAL_PRESETS:',
    ]):
        remove.add(i)

    # SIMULATOR_PROFILES array entries
    if stripped.startswith('id: "') and any(x in stripped for x in [
        'trim_hold_60s', 'pitch_step_up', 'pitch_step_down',
        'roll_command_step', 'throttle_step', 'combined_maneuver'
    ]):
        for j in range(i-1, i+5):
            if 0 <= j < len(lines):
                remove.add(j)

    # SIMULATOR_INITIAL_PRESETS entries
    if stripped.startswith('id: "') and any(x in stripped for x in [
        'cruise_10000_250', 'low_speed_3000_160',
        'high_altitude_25000_250', 'approach_1500_140'
    ]):
        for j in range(i-1, i+5):
            if 0 <= j < len(lines):
                remove.add(j)

    # simulator.reset call
    if 'simulator.reset(readSimulatorConfig())' in stripped:
        remove.add(i)

    # bridgeMode check
    if 'if (bridgeMode === "simulator") return;' in stripped:
        remove.add(i)

# ---- Phase 2: mark large blocks ----

# Simulator API endpoints: from "// API: simulator" to "// API: live current"
in_block = False
for i, line in enumerate(lines):
    if '// API: simulator' in line:
        in_block = True
        remove.add(i)
        continue
    if in_block:
        remove.add(i)
        if '// API: live current' in line:
            in_block = False
            remove.discard(i)  # keep this line
            break

# Simulator profile entries within [] arrays
in_profiles = False
for i, line in enumerate(lines):
    stripped = line.strip()
    if stripped == 'const SIMULATOR_PROFILES: SimulatorProfile[] = [' or stripped == 'const SIMULATOR_INITIAL_PRESETS: SimulatorInitialPreset[] = [':
        in_profiles = True
        remove.add(i)
        continue
    if in_profiles:
        remove.add(i)
        if stripped == '];':
            in_profiles = False
            continue

# Functions to remove (find from function header to matching closing brace)
func_headers = [
    'function normalizeSimulatorConfig',
    'function normalizePilotSnapshot',
    'function readSimulatorConfig',
    'function writeSimulatorConfig',
    'function getBlackboxStatus',
    'function closeBlackbox',
    'function ensureBlackboxStream',
    'function writeSimulatorBlackboxFrame',
    'function createBlackboxPath',
    'function startSimulator',
    'function stopSimulator',
    'function runSimulatorProfile',
    'function controlsForProfile',
    '// ── simulator loops',
    '// ── simulator profiles',
]

for i, line in enumerate(lines):
    stripped = line.strip()
    if any(h in stripped for h in func_headers):
        # Already marked? skip
        # Find function end
        j = i
        depth = 0
        started = False
        for j in range(i, len(lines)):
            for ch in lines[j]:
                if ch == '{':
                    depth += 1
                    started = True
                elif ch == '}':
                    depth -= 1
            if started and depth == 0:
                for k in range(i, j + 1):
                    remove.add(k)
                break

# Individual removable lines (after function blocks are handled)
for i, line in enumerate(lines):
    stripped = line.strip()
    if any(x in stripped for x in [
        'simulatorMode: bridgeMode,',
        'simulatorActive: Boolean(simulatorInterval),',
        'const bp = blackboxPath; const bn = blackboxFrames;',
        'closeBlackbox();',
        'stopSimulator();',
        'blackbox: getBlackboxStatus(captureDir),',
        'blackbox: getBlackboxStatus(_dir),',
    ]):
        remove.add(i)

# ---- Phase 3: build output ----
new_lines = []
for i, line in enumerate(lines):
    if i not in remove:
        new_lines.append(line)

with open('bridge-plugin.ts', 'w') as f:
    f.writelines(new_lines)

print(f"Removed {len(remove)} lines. {len(lines)} -> {len(new_lines)}")
