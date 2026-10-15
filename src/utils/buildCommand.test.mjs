import assert from 'node:assert';

function validateRam(ramMb) {
  return Number.isInteger(ramMb) && ramMb >= 1024 && ramMb <= 32768;
}

function buildCommand(profile, settings) {
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

// Check validateRam
assert.strictEqual(validateRam(1024), true, '1024 should be valid');
assert.strictEqual(validateRam(4096), true, '4096 should be valid');
assert.strictEqual(validateRam(32768), true, '32768 should be valid');
assert.strictEqual(validateRam(512), false, '512 should be invalid');
assert.strictEqual(validateRam(40000), false, '40000 should be invalid');
assert.strictEqual(validateRam(4096.5), false, 'fractional RAM should be invalid');

// Check buildCommand
const dummyProfile = {
  id: 'test-1',
  name: 'TEST',
  gameVersion: '1.21.4',
  loader: 'FABRIC',
  maxRamMb: 4096,
  jvmFlags: '-XX:+UseG1GC',
  gameDir: '/instances/test',
  mods: []
};

const dummySettings = {
  username: 'Alex',
  javaPath: 'C:/bin/java.exe'
};

const cmd = buildCommand(dummyProfile, dummySettings);
assert(cmd.includes('C:/bin/java.exe'), 'command must include java path');
assert(cmd.includes('-Xmx4096M'), 'command must include ram');
assert(cmd.includes('net.fabricmc.loader.impl.launch.knot.KnotClient'), 'command must include fabric main class');
assert(cmd.includes('--username Alex'), 'command must include username');
assert(cmd.includes('--gameDir /instances/test'), 'command must include gameDir');

console.log('buildCommand self-check: PASS');
