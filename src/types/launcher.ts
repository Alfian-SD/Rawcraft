export type LoaderType = 'RAWCRAFT' | 'VANILLA' | 'FABRIC' | 'NEOFORGE' | 'QUILT' | 'FORGE';

export type ActiveView = 'HERO' | 'PROFILES' | 'CONFIGURE' | 'MODS' | 'STORE' | 'SETTINGS' | 'CONSOLE' | 'LOADER';

export type AuthMode = 'OFFLINE' | 'MICROSOFT';

export interface ModItem {
  fileName: string;
  enabled: boolean;
  size?: number;
}

export interface Profile {
  id: string;
  name: string;
  gameVersion: string;
  loader: LoaderType;
  loaderVersion?: string;
  maxRamMb: number;
  jvmFlags: string;
  gameDir: string;
  javaPath?: string;
  mods: ModItem[];
  lastPlayed?: number;
  rawcraftClient?: boolean;
}

export interface GlobalSettings {
  username: string;
  javaPath: string;
  authMode?: AuthMode;
  animationsEnabled?: boolean;
}

export interface ProgressData {
  type?: string;
  task?: string;
  total?: number;
  current?: number;
  percent: number;
}

export interface LauncherState {
  activeProfileId: string;
  globalSettings: GlobalSettings;
  profiles: Profile[];
}
