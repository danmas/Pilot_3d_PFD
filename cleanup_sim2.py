#!/usr/bin/env python3
"""Remove ALL simulator/blackbox code from bridge-plugin.ts"""
import re

with open('bridge-plugin.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# ── Step 1: Remove simulator imports ──
content = re.sub(
    r'import \{\n(?:.*\n)*?\} from "\./simulator";\n?',
    '',
    content
)

# ── Step 2: Remove simulator types (SimulatorProfile, SimulatorInitialPreset, SimulatorProfileRunResult) ──
content = re.sub(
    r'\ntype SimulatorProfile = \{.*?\n\};\n',
    '',
    content,
    flags=re.DOTALL
)
content = re.sub(
    r'\ntype SimulatorInitialPreset = \{.*?\n\};\n',
    '',
    content,
    flags=re.DOTALL
)
content = re.sub(
    r'\ntype SimulatorProfileRunResult =\n  \| \{.*?\n    \}\n  \| \{.*?\n    \};\n',
    '',
    content,
    flags=re.DOTALL
)

# ── Step 3: Remove SIMULATOR_CONFIG_PATH ──
content = re.sub(
    r'const SIMULATOR_CONFIG_PATH = .*?;\n',
    '',
    content
)

# ── Step 4: Remove simulator state block (from "// ── simulator state" to "];\n\n") ──
content = re.sub(
    r'// ── simulator state.*?\nlet bridgeMode.*?\nconst simulator.*?\nlet simulatorInterval.*?\nlet simulatorPilotSnapshot.*?\nlet blackboxStream.*?\nlet blackboxPath.*?\nlet blackboxFrames.*?\n\nconst SIMULATOR_PROFILES.*?\];\n\nconst SIMULATOR_INITIAL_PRESETS.*?\];\n\n',
    '',
    content,
    flags=re.DOTALL
)

# ── Step 5: Remove simulator.reset(readSimulatorConfig()) ──
content = content.replace('  simulator.reset(readSimulatorConfig());\n', '')

# ── Step 6: Remove bridgeMode check ──
content = content.replace('      if (bridgeMode === "simulator") return;\n', '')

# ── Step 7: Remove simulator API endpoints block ──
# From "// API: simulator" to just before "// API: live current"
content = re.sub(
    r'          // API: simulator\n.*?(?=          // API: live current)',
    '',
    content,
    flags=re.DOTALL
)

# ── Step 8: Remove simulator fields from getStatus and getPfdStatus ──
content = content.replace('    simulatorMode: bridgeMode,\n', '')
content = content.replace('    simulatorActive: Boolean(simulatorInterval),\n', '')

# ── Step 9: Remove stopSimulator/closeBlackbox from closeBundle ──
content = content.replace('      stopSimulator();\n', '')
content = content.replace('      closeBlackbox();\n', '')

# ── Step 10: Remove blackbox from getCaptureStatus ──
content = content.replace('    blackbox: getBlackboxStatus(_dir),\n', '')

# ── Step 11: Remove normalizeSimulatorConfig, normalizePilotSnapshot ──
content = re.sub(
    r'function normalizeSimulatorConfig.*?\n  \}\n\}\n\n',
    '',
    content,
    flags=re.DOTALL
)
content = re.sub(
    r'function normalizePilotSnapshot.*?\n  \}\n\}\n\n',
    '',
    content,
    flags=re.DOTALL
)

# ── Step 12: Remove readSimulatorConfig, writeSimulatorConfig ──
content = re.sub(
    r'function readSimulatorConfig.*?\n  \}\n\}\n\n',
    '',
    content,
    flags=re.DOTALL
)
content = re.sub(
    r'function writeSimulatorConfig.*?\n  fs\.writeFileSync.*?\n\}\n\n',
    '',
    content,
    flags=re.DOTALL
)

# ── Step 13: Remove getBlackboxStatus ──
content = re.sub(
    r'function getBlackboxStatus.*?\n  \};\n\}\n\n',
    '',
    content,
    flags=re.DOTALL
)

# ── Step 14: Remove stopCapture blackbox references ──
content = content.replace('  const bp = blackboxPath; const bn = blackboxFrames;\n', '')
content = re.sub(r'  stoppedBlackboxPath: bp, stoppedBlackboxFrames: bn,? ?\n', '', content)
# Also fix the return statement
content = content.replace('return { ...getCaptureStatus(""), stoppedPath: p, stoppedFrames: n,  };\n',
                          'return { ...getCaptureStatus(""), stoppedPath: p, stoppedFrames: n };\n')

# ── Step 15: Remove ensureBlackboxStream, writeSimulatorBlackboxFrame, closeBlackbox ──
content = re.sub(
    r'function ensureBlackboxStream.*?\n  console\.log\(.*?\);\n\}\n\n',
    '',
    content,
    flags=re.DOTALL
)
content = re.sub(
    r'function writeSimulatorBlackboxFrame.*?\n  blackboxFrames \+= 1;\n\}\n\n',
    '',
    content,
    flags=re.DOTALL
)
content = re.sub(
    r'function closeBlackbox.*?\n  blackboxStream = undefined;\n\}\n\n',
    '',
    content,
    flags=re.DOTALL
)

# ── Step 16: Remove createBlackboxPath ──
content = re.sub(
    r'function createBlackboxPath.*?\n  return createCapturePath.*?\n\}\n\n',
    '',
    content,
    flags=re.DOTALL
)

# ── Step 17: Remove startSimulator, stopSimulator ──
content = re.sub(
    r'// ── simulator loops.*?\nfunction startSimulator.*?\n  sendPfdSse\("status", getPfdStatus\(\)\);\n\}\n\n',
    '',
    content,
    flags=re.DOTALL
)
content = re.sub(
    r'function stopSimulator.*?\n  sendPfdSse\("status", getPfdStatus\(\)\);\n\}\n\n',
    '',
    content,
    flags=re.DOTALL
)

# ── Step 18: Remove runSimulatorProfile, controlsForProfile ──
content = re.sub(
    r'// ── simulator profiles.*?\nfunction runSimulatorProfile.*?\n  \}\n\}\n\n',
    '',
    content,
    flags=re.DOTALL
)
content = re.sub(
    r'function controlsForProfile.*?\n  \}\n\}\n\n',
    '',
    content,
    flags=re.DOTALL
)

# ── Clean up extra blank lines ──
content = re.sub(r'\n{4,}', '\n\n\n', content)

with open('bridge-plugin.ts', 'w', encoding='utf-8') as f:
    f.write(content)

# Verify
with open('bridge-plugin.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

sim_count = sum(1 for l in lines if any(w in l.lower() for w in 
    ['simulator', 'blackbox', 'bridgemode', 'simulatorinterval', 'simulatorpilot',
     'normalizesimulator', 'readsimulator', 'writesimulator', 'getblackbox',
     'closeblackbox', 'startsimulator', 'stopsimulator', 'ensureblackbox',
     'writesimulatorblackbox', 'controlsforprofile', 'runsimulatorprofile',
     'simulatorconfig', 'simulator_profile', 'simulator_initial',
     'flightsimulator', 'simulatorprofilerun']))

print(f"Lines: {len(lines)}, Simulator references remaining: {sim_count}")
