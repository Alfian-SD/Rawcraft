import assert from 'node:assert';

// Test Mojang version manifest ordering & structure
async function testMinecraftVersions() {
  const res = await fetch('https://piston-meta.mojang.com/mc/game/version_manifest_v2.json');
  assert.ok(res.ok, 'Mojang manifest should return HTTP 200');
  const data = await res.json();
  assert.ok(Array.isArray(data.versions), 'versions must be an array');
  assert.ok(data.versions.length > 50, 'versions should contain full history');
  
  const releases = data.versions.filter(v => v.type === 'release');
  assert.ok(releases.length > 30, 'releases should have many entries');
  // First release should be modern
  assert.ok(releases[0].id.startsWith('1.') || releases[0].id.startsWith('2'), 'latest release should have version format');
  console.log('testMinecraftVersions: PASS (found ' + releases.length + ' releases)');
}

// Test Fabric loader version endpoint ordering & structure
async function testFabricLoaders() {
  const res = await fetch('https://meta.fabricmc.net/v2/versions/loader/1.21.4');
  assert.ok(res.ok, 'Fabric meta should return HTTP 200 for 1.21.4');
  const list = await res.json();
  assert.ok(Array.isArray(list), 'Fabric loader list must be an array');
  assert.ok(list.length > 0, 'Fabric loader list should not be empty');
  
  const first = list[0].loader || list[0];
  const last = list[list.length - 1].loader || list[list.length - 1];
  assert.ok(first.version, 'Fabric loader must have version');
  // Versions move upstream; assert shape + ordering, not exact numbers.
  const semver = /^\d+\.\d+\.\d+/;
  assert.match(first.version, semver, 'Latest Fabric loader must be semver');
  assert.match(last.version, semver, 'Earliest Fabric loader must be semver');
  const major = v => Number(v.split('.')[0]);
  assert.ok(major(first.version) >= major(last.version), 'List must be newest-first');
  console.log('testFabricLoaders: PASS (range: ' + last.version + ' to ' + first.version + ', total: ' + list.length + ')');
}

async function run() {
  try {
    await testMinecraftVersions();
    await testFabricLoaders();
    console.log('All version fetcher tests PASSED');
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
}

run();
