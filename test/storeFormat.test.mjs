import assert from 'node:assert/strict';
import {
  formatCount,
  formatBytes,
  stripUnsafeMarkdown,
  safeHref,
  sortGameVersions,
} from '../src/utils/storeFormat.ts';

// formatCount: millions, thousands, exact
assert.equal(formatCount(288_135_144), '288.1M');
assert.equal(formatCount(12_500), '13k');
assert.equal(formatCount(999), '999');

// formatBytes: MB, KB, B
assert.equal(formatBytes(1_739_466), '1.7 MB');
assert.equal(formatBytes(2048), '2 KB');
assert.equal(formatBytes(512), '512 B');

// stripUnsafeMarkdown: drop images and HTML, preserve other markdown
const unsafe = '# Title\n\n![badge](https://bad.site/img.png)\n<script>alert(1)</script>\n**bold** and `code`';
const stripped = stripUnsafeMarkdown(unsafe);
assert.ok(!stripped.includes('badge'));
assert.ok(!stripped.includes('bad.site'));
assert.ok(!stripped.includes('<script>'));
assert.ok(stripped.includes('# Title'));
assert.ok(stripped.includes('**bold**'));

// safeHref: allow http/https/mailto, block javascript: / data:
assert.equal(safeHref('https://modrinth.com'), 'https://modrinth.com');
assert.equal(safeHref('http://example.com'), 'http://example.com');
assert.equal(safeHref('mailto:dev@example.com'), 'mailto:dev@example.com');
assert.equal(safeHref('javascript:alert(1)'), undefined);
assert.equal(safeHref('data:text/html,...'), undefined);

// sortGameVersions: chronological order
const sorted = sortGameVersions(['1.21', '1.20.4', '1.20', '26.2', '26.1']);
assert.deepEqual(sorted, ['1.20', '1.20.4', '1.21', '26.1', '26.2']);

console.log('storeFormat tests: ALL PASS');
