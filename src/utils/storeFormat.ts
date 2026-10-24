/**
 * Shared, dependency-free helpers for the mod store + detail view.
 * Pure functions only — imported by both React components and `node --test` style checks.
 */

export const formatCount = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return String(n);
};

export const formatBytes = (bytes: number): string => {
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
};

/** Drop images and raw HTML — RawCraft Rule #9 forbids decorative images. */
export const stripUnsafeMarkdown = (text: string): string =>
  text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\r\n/g, '\n');

/** Only absolute http(s)/mailto links are allowed through to the DOM. */
export const safeHref = (href: string): string | undefined =>
  /^(https?:|mailto:)/i.test(href.trim()) ? href.trim() : undefined;

const parseVersion = (v: string) => v.split(/[.\-+]/).map((p) => parseInt(p, 10) || 0);

/** Oldest → newest, so compatibility chips read chronologically. */
export const sortGameVersions = (list: string[]): string[] =>
  [...list].sort((a, b) => {
    const pa = parseVersion(a);
    const pb = parseVersion(b);
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
      const diff = (pa[i] || 0) - (pb[i] || 0);
      if (diff) return diff;
    }
    return a.localeCompare(b);
  });
