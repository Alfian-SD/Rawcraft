import { Profile, GlobalSettings } from '../types/launcher';

export function validateRam(ramMb: number): boolean {
  return Number.isInteger(ramMb) && ramMb >= 1024 && ramMb <= 32768;
}

export function buildCommand(profile: Profile, settings: GlobalSettings): string {
  const java = settings.javaPath?.trim() || 'java';
  const ramFlag = `-Xmx${profile.maxRamMb}M`;
  const jvmFlags = profile.jvmFlags?.trim() ? profile.jvmFlags.trim() : '';

  let mainClass = 'net.minecraft.client.main.Main';
  if (profile.loader === 'FABRIC') {
    mainClass = 'net.fabricmc.loader.impl.launch.knot.KnotClient';
  } else if (profile.loader === 'NEOFORGE') {
    mainClass = 'cpw.mods.bootstraplauncher.BootstrapLauncher';
  }

  const baseArgs = [
    java,
    ramFlag,
    jvmFlags,
    `-Dminecraft.launcher.brand=rawcraft`,
    `-Dminecraft.launcher.version=1.0.0`,
    `-cp "client.jar;libraries/*"`,
    mainClass,
    `--username ${settings.username?.trim() || 'PlayerOne'}`,
    `--version ${profile.gameVersion}`,
    `--gameDir ${profile.gameDir}`,
    `--assetsDir ./assets`,
    `--assetIndex ${profile.gameVersion}`,
  ].filter(Boolean);

  return baseArgs.join(' ');
}
