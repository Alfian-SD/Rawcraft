export type LoaderType = 'VANILLA' | 'FABRIC' | 'NEOFORGE';

export interface ModItem {
  fileName: string;
  enabled: boolean;
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
  mods: ModItem[];
}

export interface GlobalSettings {
  username: string;
  javaPath: string;
}

export interface LauncherState {
  activeProfileId: string;
  globalSettings: GlobalSettings;
  profiles: Profile[];
}
