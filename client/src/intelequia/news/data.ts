import { z } from 'zod';
import type { NewsEntry, NewsLanguage } from './catalog';
import { version } from '../../../../package.json';
import releases from './content/releases.json';
import { visibleEntries } from './catalog';

const catalog = z
  .array(
    z.object({
      id: z.string().regex(/^[\w.-]+$/),
      version: z.string(),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      kind: z.enum(['release', 'announcement']),
      source: z.string().url().optional(),
    }),
  )
  .parse(releases);

export const deployedVersion = version;
export const entries = visibleEntries(catalog, deployedVersion);

const documents = import.meta.glob<string>('./content/**/*.md', {
  query: '?url&no-inline',
  import: 'default',
  eager: true,
});

export async function loadContent(entry: NewsEntry, language: NewsLanguage, signal?: AbortSignal) {
  const prefix = `./content/librechat/${entry.id}/`;
  const url = documents[`${prefix}${language}.md`] ?? documents[`${prefix}en.md`];
  if (!url) {
    throw new Error('Release document is missing');
  }
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error('Release document could not be loaded');
  }
  return response.text();
}
