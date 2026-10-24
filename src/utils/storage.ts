import { LauncherState, Profile, LoaderType } from '../types/launcher';

export const STORAGE_KEY = 'rawcraft_profiles_v1';

export const DEFAULT_LAUNCHER_STATE: LauncherState = {
  activeProfileId: 'prof-rawcraft-262',
  globalSettings: {
    username: 'PlayerOne',
    javaPath: 'java',
    authMode: 'OFFLINE',
    animationsEnabled: true,
  },
  profiles: [
    {
      id: 'prof-rawcraft-262',
      name: 'RAWCRAFT CLIENT // 26.2',
      gameVersion: '26.2',
      loader: 'RAWCRAFT',
      loaderVersion: '1.0.0',
      maxRamMb: 4096,
      jvmFlags: '-XX:+UseG1GC -XX:+ParallelRefProcEnabled',
      gameDir: '/instances/prof-2665',
      mods: [
        { fileName: 'rawcraft-client.jar', enabled: true },
        { fileName: 'sodium-fabric-0.9.2+mc26.2.jar', enabled: true },
        { fileName: 'lithium-fabric-0.25.3+mc26.2.jar', enabled: true },
        { fileName: 'ferritecore-9.0.0-fabric.jar', enabled: true },
      ],
      rawcraftClient: true,
    },
    {
      id: 'prof-01',
      name: 'FABRIC // TECH-01',
      gameVersion: '1.21.4',
      loader: 'FABRIC',
      loaderVersion: '0.16.9',
      maxRamMb: 4096,
      jvmFlags: '-XX:+UseG1GC -XX:+ParallelRefProcEnabled',
      gameDir: '/instances/fabric-tech-01',
      mods: [
        { fileName: 'sodium-fabric-0.6.0.jar', enabled: true },
        { fileName: 'lithium-fabric-0.14.0.jar', enabled: true },
        { fileName: 'iris-shaders-1.8.0.jar', enabled: false },
      ],
    },
    {
      id: 'prof-02',
      name: 'VANILLA // SURVIVAL',
      gameVersion: '1.21.4',
      loader: 'VANILLA',
      maxRamMb: 2048,
      jvmFlags: '-XX:+UseG1GC',
      gameDir: '/instances/vanilla-survival',
      mods: [],
    },
    {
      id: 'prof-03',
      name: 'NEOFORGE // MODDED',
      gameVersion: '1.20.1',
      loader: 'NEOFORGE',
      loaderVersion: '20.1.100',
      maxRamMb: 6144,
      jvmFlags: '-XX:+UseG1GC -XX:+UnlockExperimentalVMOptions',
      gameDir: '/instances/neoforge-modded',
      mods: [
        { fileName: 'jei-1.20.1-15.3.0.4.jar', enabled: true },
        { fileName: 'appleskin-neoforge-mc1.20.1-2.5.1.jar', enabled: true },
      ],
    },
    {
      id: 'prof-04',
      name: 'FORGE // CLASSIC',
      gameVersion: '1.20.1',
      loader: 'FORGE',
      loaderVersion: '47.3.0',
      maxRamMb: 4096,
      jvmFlags: '-XX:+UseG1GC',
      gameDir: '/instances/forge-classic',
      mods: [
        { fileName: 'curios-forge-5.9.1+1.20.1.jar', enabled: true },
      ],
    },
  ],
};

/**
 * Sanitizes and migrates a profile object.
 * If legacy data is missing the `loader` property or has an unrecognized value,
 * it safely falls back to a detected or default loader ('FABRIC') without corrupting the profile.
 */
export function sanitizeProfile(raw: any, fallbackId = 'prof-fallback'): Profile {
  if (!raw || typeof raw !== 'object') {
    return {
      id: fallbackId,
      name: 'DEFAULT // INSTANCE',
      gameVersion: '1.21.4',
      loader: 'FABRIC',
      maxRamMb: 4096,
      jvmFlags: '-XX:+UseG1GC',
      gameDir: `/instances/${fallbackId}`,
      mods: [],
    };
  }

  let loader: LoaderType = 'FABRIC';
  if (typeof raw.loader === 'string') {
    const upper = raw.loader.trim().toUpperCase();
    if (upper === 'RAWCRAFT' || upper === 'FORGE' || upper === 'NEOFORGE' || upper === 'FABRIC' || upper === 'QUILT' || upper === 'VANILLA') {
      loader = upper as LoaderType;
    }
  } else if (typeof raw.name === 'string') {
    const nameUpper = raw.name.toUpperCase();
    if (nameUpper.includes('RAWCRAFT')) loader = 'RAWCRAFT';
    else if (nameUpper.includes('NEOFORGE')) loader = 'NEOFORGE';
    else if (nameUpper.includes('FORGE')) loader = 'FORGE';
    else if (nameUpper.includes('QUILT')) loader = 'QUILT';
    else if (nameUpper.includes('VANILLA')) loader = 'VANILLA';
    else if (nameUpper.includes('FABRIC')) loader = 'FABRIC';
  }

  return {
    id: typeof raw.id === 'string' && raw.id ? raw.id : fallbackId,
    name: typeof raw.name === 'string' && raw.name ? raw.name : 'CLASSIC // INSTANCE',
    gameVersion: typeof raw.gameVersion === 'string' && raw.gameVersion ? raw.gameVersion : '1.21.4',
    loader,
    maxRamMb:
      typeof raw.maxRamMb === 'number' && Number.isInteger(raw.maxRamMb) && raw.maxRamMb >= 1024 && raw.maxRamMb <= 32768
        ? raw.maxRamMb
        : typeof raw.maxRamMb === 'string' && !isNaN(parseInt(raw.maxRamMb, 10)) && parseInt(raw.maxRamMb, 10) >= 1024
        ? parseInt(raw.maxRamMb, 10)
        : 4096,
    jvmFlags: typeof raw.jvmFlags === 'string' ? raw.jvmFlags : '-XX:+UseG1GC',
    gameDir: typeof raw.gameDir === 'string' && raw.gameDir ? raw.gameDir : `/instances/${raw.id || fallbackId}`,
    javaPath: typeof raw.javaPath === 'string' ? raw.javaPath : undefined,
    mods: Array.isArray(raw.mods) ? raw.mods : [],
    lastPlayed: typeof raw.lastPlayed === 'number' ? raw.lastPlayed : undefined,
  };
}

export function loadLauncherState(): LauncherState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveLauncherState(DEFAULT_LAUNCHER_STATE);
      return DEFAULT_LAUNCHER_STATE;
    }
    const parsed = JSON.parse(raw);
    if (!parsed.profiles || !Array.isArray(parsed.profiles) || parsed.profiles.length === 0) {
      saveLauncherState(DEFAULT_LAUNCHER_STATE);
      return DEFAULT_LAUNCHER_STATE;
    }

    // Migrate and sanitize all profiles to ensure every profile has a valid `loader` and `maxRamMb`
    let hasChanges = false;
    const sanitizedProfiles: Profile[] = parsed.profiles.map((p: any, idx: number) => {
      const sanitized = sanitizeProfile(p, `prof-${idx + 1}`);
      if (!p.loader || p.loader !== sanitized.loader || p.maxRamMb !== sanitized.maxRamMb) {
        hasChanges = true;
      }
      return sanitized;
    });

    if (parsed.globalSettings && parsed.globalSettings.animationsEnabled === undefined) {
      parsed.globalSettings.animationsEnabled = true;
      hasChanges = true;
    }

    const state: LauncherState = {
      activeProfileId: parsed.activeProfileId || sanitizedProfiles[0].id,
      globalSettings: parsed.globalSettings || DEFAULT_LAUNCHER_STATE.globalSettings,
      profiles: sanitizedProfiles,
    };

    // If active profile not found in sanitized list, point to first
    if (!state.profiles.some((p) => p.id === state.activeProfileId)) {
      state.activeProfileId = state.profiles[0].id;
      hasChanges = true;
    }

    // Persist migration if legacy profiles were upgraded
    if (hasChanges) {
      saveLauncherState(state);
    }

    return state;
  } catch {
    saveLauncherState(DEFAULT_LAUNCHER_STATE);
    return DEFAULT_LAUNCHER_STATE;
  }
}

export function saveLauncherState(state: LauncherState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state, null, 2));
  } catch (err) {
    console.error('Failed to save state to localStorage:', err);
  }
}
