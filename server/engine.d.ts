import type { Connect } from 'vite';

export function createEngineMiddleware(): Connect.NextHandleFunction;
export function broadcastEvent(event: string, data: unknown): void;
export function listInstanceFiles(instanceId: string, subfolder: string): Array<{
  fileName: string;
  enabled: boolean;
  size: number;
  updatedAt: number;
}>;
export function toggleInstanceFile(instanceId: string, subfolder: string, fileName: string): {
  oldName: string;
  newName: string;
  enabled: boolean;
};
export function installModrinthFile(
  instanceId: string,
  projectType: string,
  downloadUrl: string,
  fileName: string
): Promise<{ success: boolean; target?: string; count?: number }>;
export function launchInstance(config: Record<string, unknown>): Promise<void>;
export function terminateProcess(): boolean;
