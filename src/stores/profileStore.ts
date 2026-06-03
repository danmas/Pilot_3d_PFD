/**
 * Profile store — user-defined simulation profiles.
 *
 * A profile links a human-readable name to a panel configuration:
 * { name: "ILS Approach", panelConfigName: "pan_cfg_1" }
 *
 * Stored as JSON files in data/profiles/ on the server.
 * Managed via REST API (/api/profiles/).
 */

const PROFILES_API = '/api/profiles';

export interface PanelProfile {
  id: string;
  name: string;
  panelConfigName: string | null;
  updatedAt?: string;
}

/** Fetch all profiles from server. */
export async function getProfiles(): Promise<PanelProfile[]> {
  try {
    const res = await fetch(PROFILES_API, { cache: 'no-store' });
    if (!res.ok) return [];
    const list: PanelProfile[] = await res.json();
    return list;
  } catch {
    return [];
  }
}

/** Load a single profile by id. Returns null if not found. */
export async function loadProfile(id: string): Promise<PanelProfile | null> {
  try {
    const res = await fetch(`${PROFILES_API}/${encodeURIComponent(id)}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Save a profile.
 * If panelConfigName is omitted, it's set to null (no panel linked).
 */
export async function saveProfile(
  id: string,
  name: string,
  panelConfigName?: string | null,
): Promise<boolean> {
  try {
    const body: Record<string, unknown> = { name };
    if (panelConfigName !== undefined) {
      body.panelConfigName = panelConfigName;
    }
    const res = await fetch(`${PROFILES_API}/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Delete a profile. Returns true on success. */
export async function deleteProfile(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${PROFILES_API}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch {
    return false;
  }
}
