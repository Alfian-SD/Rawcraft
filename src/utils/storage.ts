import { LauncherState } from '../types/launcher';

export const STORAGE_KEY = 'rawcraft_profiles_v1';

export const DEFAULT_LAUNCHER_STATE: LauncherState = {
  activeProfileId: 'prof-01',
  globalSettings: {
    username: 'PlayerOne',
    javaPath: 'java',
  },
  profiles: [
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
  ],
};

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
    return parsed as LauncherState;
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
