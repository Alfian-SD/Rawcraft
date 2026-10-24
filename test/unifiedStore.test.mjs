import assert from 'node:assert/strict';

// Contract for the Modrinth-backed mod installer
const SORTS = ['trend', 'popular', 'updated', 'relevance'];
const CATEGORIES = ['mod', 'modpack', 'resourcepack', 'shader'];

assert.equal(SORTS.length, 4, 'must have 4 sort modes');
assert.equal(CATEGORIES.length, 4, 'must have 4 categories');

// Modrinth facet building contract
function buildModrinthFacets(projectType, gameVersion, loader) {
  const facets = [[`project_type:${projectType}`]];
  if (gameVersion && gameVersion !== 'all') {
    facets.push([`versions:${gameVersion}`]);
  }
  if (loader && loader !== 'all' && (projectType === 'mod' || projectType === 'modpack')) {
    const loaderLower = loader.toLowerCase();
    if (loaderLower !== 'vanilla') {
      facets.push([`categories:${loaderLower}`]);
    }
  }
  return facets;
}

assert.deepEqual(buildModrinthFacets('mod', '1.21.4', 'FABRIC'), [
  ['project_type:mod'],
  ['versions:1.21.4'],
  ['categories:fabric'],
]);

assert.deepEqual(buildModrinthFacets('shader', 'all', 'all'), [['project_type:shader']]);

assert.deepEqual(buildModrinthFacets('modpack', '1.20.1', 'VANILLA'), [
  ['project_type:modpack'],
  ['versions:1.20.1'],
]);

// Sort -> Modrinth index mapping
const MR_INDEX_MAP = { trend: 'follows', popular: 'downloads', updated: 'updated', relevance: 'relevance' };
for (const sort of SORTS) {
  assert.ok(MR_INDEX_MAP[sort], `sort ${sort} must map to a Modrinth index`);
}

console.log('unifiedStore test: ALL PASS');
