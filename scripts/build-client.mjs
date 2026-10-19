import fs from 'node:fs';
import path from 'node:path';
import cp from 'node:child_process';

const PROJECT_ROOT = process.cwd();
const CLIENT_DIR = path.join(PROJECT_ROOT, 'rawcraft-client');
const SRC_JAVA = path.join(CLIENT_DIR, 'src', 'main', 'java');
const SRC_RES = path.join(CLIENT_DIR, 'src', 'main', 'resources');
const BUILD_CLASSES = path.join(CLIENT_DIR, 'build', 'classes');
const BUILD_LIBS = path.join(CLIENT_DIR, 'build', 'libs');
const RAW_CLIENT_DIR = path.join(PROJECT_ROOT, 'raw-client');

const INSTANCE_LIB_DIR = path.join(PROJECT_ROOT, 'instances', 'prof-9021', 'libraries');
const MC_JAR = path.join(PROJECT_ROOT, 'instances', 'prof-9021', 'versions', 'rawcraft', 'rawcraft.jar');

function getAllJars(dir) {
  let jars = [];
  if (!fs.existsSync(dir)) return jars;
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      jars = jars.concat(getAllJars(full));
    } else if (item.name.endsWith('.jar')) {
      jars.push(full);
    }
  }
  return jars;
}

function getAllJava(dir) {
  let files = [];
  if (!fs.existsSync(dir)) return files;
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      files = files.concat(getAllJava(full));
    } else if (item.name.endsWith('.java')) {
      files.push(full);
    }
  }
  return files;
}

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const file of fs.readdirSync(src)) {
      copyRecursive(path.join(src, file), path.join(dest, file));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

export function buildRawCraftClient() {
  console.log('[RawCraft Build]: Compiling RawCraft Client mod...');

  if (!fs.existsSync(BUILD_CLASSES)) fs.mkdirSync(BUILD_CLASSES, { recursive: true });
  if (!fs.existsSync(BUILD_LIBS)) fs.mkdirSync(BUILD_LIBS, { recursive: true });
  if (!fs.existsSync(RAW_CLIENT_DIR)) fs.mkdirSync(RAW_CLIENT_DIR, { recursive: true });

  const cpJars = [MC_JAR, ...getAllJars(INSTANCE_LIB_DIR)].join(';');
  const javaFiles = getAllJava(SRC_JAVA);

  if (javaFiles.length === 0) {
    throw new Error('No Java files found in ' + SRC_JAVA);
  }

  // Find javac
  const possibleJavac = [
    'C:\\Program Files\\Java\\jdk-27\\bin\\javac.exe',
    'javac'
  ];
  let javacBin = possibleJavac.find(p => fs.existsSync(p)) || 'javac';

  // 1. Compile Java files
  const javacArgs = [
    '--release', '25',
    '-cp', cpJars,
    '-d', BUILD_CLASSES,
    ...javaFiles
  ];

  const compileRes = cp.spawnSync(javacBin, javacArgs, { encoding: 'utf8' });
  if (compileRes.status !== 0) {
    console.error('[RawCraft Build ERROR]: Compilation failed!');
    if (compileRes.stdout) console.log(compileRes.stdout);
    if (compileRes.stderr) console.error(compileRes.stderr);
    throw new Error('Javac compilation failed');
  }

  // 2. Copy resources (fabric.mod.json, rawcraft.mixins.json, assets, etc.)
  copyRecursive(SRC_RES, BUILD_CLASSES);

  // 3. Package into jar
  const possibleJar = [
    'C:\\Program Files\\Java\\jdk-27\\bin\\jar.exe',
    'jar'
  ];
  let jarBin = possibleJar.find(p => fs.existsSync(p)) || 'jar';

  const targetJarPath = path.join(BUILD_LIBS, 'rawcraft-client-1.0.0.jar');
  const jarArgs = [
    '--create',
    '--file', targetJarPath,
    '-C', BUILD_CLASSES,
    '.'
  ];

  const jarRes = cp.spawnSync(jarBin, jarArgs, { encoding: 'utf8' });
  if (jarRes.status !== 0) {
    console.error('[RawCraft Build ERROR]: Jar packaging failed!');
    if (jarRes.stderr) console.error(jarRes.stderr);
    throw new Error('Jar packaging failed');
  }

  // 4. Distribute to raw-client/ and active instances
  const rawClientJar = path.join(RAW_CLIENT_DIR, 'rawcraft-client.jar');
  fs.copyFileSync(targetJarPath, rawClientJar);

  const instanceMods = path.join(PROJECT_ROOT, 'instances', 'prof-9021', 'mods', 'rawcraft-client.jar');
  if (fs.existsSync(path.dirname(instanceMods))) {
    fs.copyFileSync(targetJarPath, instanceMods);
  }

  const stat = fs.statSync(targetJarPath);
  console.log(`[RawCraft Build SUCCESS]: Built rawcraft-client.jar (${stat.size} bytes).`);
  return targetJarPath;
}

if (process.argv[1] && process.argv[1].endsWith('build-client.mjs')) {
  try {
    buildRawCraftClient();
  } catch (e) {
    process.exit(1);
  }
}
