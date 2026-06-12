/**
 * Panel profile store — profile management for PanelBuilder layouts.
 *
 * Profiles are stored as JSON files on the server under data/panels/.
 * Managed via REST API (/api/panels/).
 *
 * Default profile "Current" always exists as panel-config-current.json
 * and is auto-saved by the server.
 */

const CURRENT_PROFILE_ID = 'current';
const PANELS_API = '/api/panels';
const CURRENT_CONFIG_API = '/api/panel/config/current';

export interface PanelProfile {
  name: string;
  /** For the "Current" profile, this is always "current". For others, the filename without .json */
  id: string;
  updatedAt?: string;
  treeJson?: string;
}

/** Fetch the list of all panel profiles from the server. */
export async function getProfiles(): Promise<PanelProfile[]> {
  try {
    const [panelsRes, currentRes] = await Promise.all([
      fetch(PANELS_API, { cache: 'no-store' }),
      fetch(CURRENT_CONFIG_API, { cache: 'no-store' }),
    ]);

    const profiles: PanelProfile[] = [];

    // Current profile
    if (currentRes.ok) {
      profiles.push({ id: CURRENT_PROFILE_ID, name: 'Current' });
    }

    // Named profiles
    if (panelsRes.ok) {
      const list: Array<{ name: string; updatedAt: string }> = await panelsRes.json();
      for (const p of list) {
        profiles.push({ id: p.name, name: p.name, updatedAt: p.updatedAt });
      }
    }

    return profiles;
  } catch {
    return [{ id: CURRENT_PROFILE_ID, name: 'Current' }];
  }
}

/** Save current config to the server as a named profile. */
export async function saveProfile(
  name: string,
  treeJson: string,
): Promise<boolean> {
  try {
    const data = JSON.parse(treeJson);
    const res = await fetch(`${PANELS_API}/${encodeURIComponent(name)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Save current config as "Current" profile (panel-config-current.json). */
export async function saveCurrentProfile(treeJson: string): Promise<boolean> {
  try {
    const data = JSON.parse(treeJson);
    const res = await fetch(CURRENT_CONFIG_API, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Load a named profile from the server. Returns treeJson string or null. */
export async function loadProfile(name: string): Promise<string | null> {
  try {
    if (name === CURRENT_PROFILE_ID) {
      const res = await fetch(CURRENT_CONFIG_API, { cache: 'no-store' });
      if (!res.ok) return null;
      const data = await res.json();
      return JSON.stringify(data);
    }

    const res = await fetch(`${PANELS_API}/${encodeURIComponent(name)}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return JSON.stringify(json.data);
  } catch {
    return null;
  }
}

/** Delete a named profile. Returns true on success. Cannot delete Current. */
export async function deleteProfile(name: string): Promise<boolean> {
  if (name === CURRENT_PROFILE_ID) return false;
  try {
    const res = await fetch(`${PANELS_API}/${encodeURIComponent(name)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch {
    return false;
  }
}

export { CURRENT_PROFILE_ID };
