import { lte, rcompare, valid } from 'semver';

export type NewsLanguage = 'en' | 'es';

export interface NewsEntry {
  id: string;
  version: string;
  date: string;
  kind: 'release' | 'announcement';
  source?: string;
}

export function newsLanguage(language?: string): NewsLanguage {
  return language?.replace(/_/g, '-').split('-')[0].toLowerCase() === 'es' ? 'es' : 'en';
}

export function visibleEntries(
  entries: readonly NewsEntry[],
  deployedVersion: string | null,
): NewsEntry[] {
  return entries
    .filter((entry) => {
      return Boolean(
        deployedVersion &&
        valid(deployedVersion) &&
        valid(entry.version) &&
        lte(entry.version, deployedVersion),
      );
    })
    .sort(
      (left, right) =>
        rcompare(left.version, right.version) ||
        Number(left.kind === 'announcement') - Number(right.kind === 'announcement') ||
        right.date.localeCompare(left.date) ||
        left.id.localeCompare(right.id),
    );
}

export function markdownBody(source: string): string {
  return source.replace(/^\uFEFF?---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
}
