import React from 'react';

import { stripUnsafeMarkdown, safeHref } from './storeFormat';

/**
 * Minimal Modrinth-flavoured Markdown renderer.
 * Images and raw HTML are dropped — RawCraft Rule #9 forbids decorative images.
 * ponytail: covers headings, lists, quotes, fences, bold/italic/code/links only.
 * Swap in `marked` + a sanitiser if tables or nested lists ever matter.
 */

function inline(text: string, keyPrefix: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const pattern = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(_[^_]+_)|(\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = pattern.exec(text))) {
    if (match.index > last) out.push(text.slice(last, match.index));
    const token = match[0];
    const key = `${keyPrefix}-${i++}`;

    if (token.startsWith('`')) {
      out.push(<code key={key} className="md-code">{token.slice(1, -1)}</code>);
    } else if (token.startsWith('**')) {
      out.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('*') || token.startsWith('_')) {
      out.push(<em key={key}>{token.slice(1, -1)}</em>);
    } else {
      const link = /\[([^\]]+)\]\(([^)]+)\)/.exec(token);
      const href = link ? safeHref(link[2]) : undefined;
      out.push(
        href ? (
          <a key={key} href={href} target="_blank" rel="noopener noreferrer" className="md-link">
            {link![1]}
          </a>
        ) : (
          link?.[1] ?? token
        )
      );
    }
    last = match.index + token.length;
  }

  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function renderMarkdown(source: string): React.ReactNode[] {
  const lines = stripUnsafeMarkdown(source || '').split('\n');
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i++;
      continue;
    }

    // Fenced code block
    if (line.trimStart().startsWith('```')) {
      const body: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith('```')) body.push(lines[i++]);
      i++;
      blocks.push(
        <pre key={key++} className="md-pre">
          <code>{body.join('\n')}</code>
        </pre>
      );
      continue;
    }

    // Heading
    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      const level = Math.min(heading[1].length + 1, 6);
      const Tag = `h${level}` as 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
      blocks.push(
        <Tag key={key++} className={`md-h md-h${level}`}>
          {inline(heading[2], `h${key}`)}
        </Tag>
      );
      i++;
      continue;
    }

    // Horizontal rule
    if (/^(\*\s*){3,}$|^(-\s*){3,}$|^(_\s*){3,}$/.test(line.trim())) {
      blocks.push(<hr key={key++} className="md-hr" />);
      i++;
      continue;
    }

    // Blockquote
    if (line.trimStart().startsWith('>')) {
      const body: string[] = [];
      while (i < lines.length && lines[i].trimStart().startsWith('>')) {
        body.push(lines[i++].replace(/^\s*>\s?/, ''));
      }
      blocks.push(
        <blockquote key={key++} className="md-quote">
          {inline(body.join(' '), `q${key}`)}
        </blockquote>
      );
      continue;
    }

    // Lists (ordered + unordered)
    if (/^\s*([-*+]|\d+\.)\s+/.test(line)) {
      const ordered = /^\s*\d+\./.test(line);
      const items: string[] = [];
      while (i < lines.length && /^\s*([-*+]|\d+\.)\s+/.test(lines[i])) {
        items.push(lines[i++].replace(/^\s*([-*+]|\d+\.)\s+/, ''));
      }
      const Tag = ordered ? 'ol' : 'ul';
      blocks.push(
        <Tag key={key++} className="md-list">
          {items.map((item, idx) => (
            <li key={idx}>{inline(item, `li${key}-${idx}`)}</li>
          ))}
        </Tag>
      );
      continue;
    }

    // Paragraph — consume until a blank line or a new block marker
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^\s*([-*+]|\d+\.)\s+/.test(lines[i]) &&
      !lines[i].trimStart().startsWith('```') &&
      !lines[i].trimStart().startsWith('>') &&
      !/^#{1,6}\s+/.test(lines[i])
    ) {
      para.push(lines[i++]);
    }
    blocks.push(
      <p key={key++} className="md-p">
        {inline(para.join(' '), `p${key}`)}
      </p>
    );
  }

  return blocks;
}
