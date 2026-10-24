import * as instanceClient from '../api/instanceClient';
import { loadLauncherState, saveLauncherState } from '../utils/storage';
import { LauncherState, LoaderType } from '../types/launcher';

export interface LaunchConfig {
  instanceId: string;
  gameVersion: string;
  loader: LoaderType;
  loaderVersion?: string;
  username: string;
  maxRamMb: number;
  jvmFlags: string;
  javaPath?: string;
  rawcraftClient?: boolean;
}

export interface ILauncherService {
  // Process Lifecycle & Execution
  launchInstance(config: LaunchConfig): Promise<void>;
  terminateProcess(): Promise<boolean>;
  repairAssets(instanceId: string, config?: Record<string, unknown>): Promise<any>;

  // Files & Content Management
  fetchFiles(instanceId: string, subfolder: 'mods' | 'resourcepacks' | 'shaderpacks'): Promise<instanceClient.InstanceFile[]>;
  toggleFile(instanceId: string, subfolder: 'mods' | 'resourcepacks' | 'shaderpacks', fileName: string): Promise<any>;
  installModrinthPackage(instanceId: string, projectType: string, downloadUrl: string, fileName: string): Promise<any>;

  // System Environment & Meta
  detectJava(gameVersion?: string): Promise<{ requiredVersion: number; detectedPath: string | null; source: string | null }>;
  fetchMinecraftVersions(): Promise<instanceClient.GameVersionItem[]>;
  fetchFabricLoaderVersions(gameVersion?: string): Promise<instanceClient.FabricLoaderItem[]>;

  // Profile Persistence & Storage
  getLauncherState(): LauncherState;
  saveLauncherState(state: LauncherState): void;
}

/**
 * Standard Web / REST implementation of Launcher Service.
 * When migrating to Electron in the future, simply swap or extend this implementation
 * with an ElectronIPCAdapter (calling window.electronAPI.invoke(...)) without modifying
 * any React UI components.
 */
class WebLauncherService implements ILauncherService {
  async launchInstance(config: LaunchConfig): Promise<void> {
    return instanceClient.launchInstance(config as unknown as Record<string, unknown>);
  }

  async terminateProcess(): Promise<boolean> {
    return instanceClient.terminateProcess();
  }

  async repairAssets(instanceId: string, config: Record<string, unknown> = {}): Promise<any> {
    return instanceClient.repairAssets(instanceId, config);
  }

  async fetchFiles(
    instanceId: string,
    subfolder: 'mods' | 'resourcepacks' | 'shaderpacks'
  ): Promise<instanceClient.InstanceFile[]> {
    return instanceClient.fetchInstanceFiles(instanceId, subfolder);
  }

  async toggleFile(
    instanceId: string,
    subfolder: 'mods' | 'resourcepacks' | 'shaderpacks',
    fileName: string
  ): Promise<any> {
    return instanceClient.toggleInstanceFile(instanceId, subfolder, fileName);
  }

  async installModrinthPackage(
    instanceId: string,
    projectType: string,
    downloadUrl: string,
    fileName: string
  ): Promise<any> {
    return instanceClient.installModrinthFile(instanceId, projectType, downloadUrl, fileName);
  }

  async detectJava(gameVersion = '1.21.4'): Promise<{
    requiredVersion: number;
    detectedPath: string | null;
    source: string | null;
  }> {
    return instanceClient.detectJava(gameVersion);
  }

  async fetchMinecraftVersions(): Promise<instanceClient.GameVersionItem[]> {
    return instanceClient.fetchMinecraftVersions();
  }

  async fetchFabricLoaderVersions(gameVersion?: string): Promise<instanceClient.FabricLoaderItem[]> {
    return instanceClient.fetchFabricLoaderVersions(gameVersion);
  }

  getLauncherState(): LauncherState {
    return loadLauncherState();
  }

  saveLauncherState(state: LauncherState): void {
    saveLauncherState(state);
  }
}

// Singleton export
export const launcherApi: ILauncherService = new WebLauncherService();
