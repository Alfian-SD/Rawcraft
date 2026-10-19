import { launchInstance } from '../server/engine.mjs';

console.log('[Test Launcher] Launching prof-9021 for Phase 6 QA verification...');

try {
  await launchInstance({
    instanceId: 'prof-9021',
    gameVersion: '26.2',
    loader: 'RAWCRAFT',
    loaderVersion: '0.20.0',
    username: 'RawCraftDev',
    maxRamMb: 4096,
    rawcraftClient: true,
    customLaunchArgs: ['--quickPlaySingleplayer', 'New World']
  });
} catch (err) {
  console.error('[Test Launcher ERROR]:', err);
  process.exit(1);
}
