import type { NewsEntry } from '../catalog';
import { markdownBody, newsLanguage, visibleEntries } from '../catalog';

const entry = (version: string, overrides: Partial<NewsEntry> = {}): NewsEntry => ({
  id: version,
  version,
  date: '2026-09-30',
  kind: 'release',
  ...overrides,
});

describe('Intelequia news catalog', () => {
  it('orders stable versions, numbered prereleases and hotfixes by SemVer', () => {
    const entries = ['1.9.0', '1.10.0-rc.2', '1.10.0', '1.10.1-hotfix.1', '1.10.0-rc.10', '1.10.1'];
    expect(
      visibleEntries(
        entries.map((version) => entry(version)),
        'v1.10.1',
      ).map((item) => item.version),
    ).toEqual(['1.10.1', '1.10.1-hotfix.1', '1.10.0', '1.10.0-rc.10', '1.10.0-rc.2', '1.9.0']);
  });

  it('does not publish a stable release or a later candidate on an older deployment', () => {
    expect(
      visibleEntries(
        ['0.8.8', '0.8.8-rc4', '0.8.8-rc3', '0.8.7'].map((version) => entry(version)),
        'v0.8.8-rc3',
      ).map((item) => item.version),
    ).toEqual(['0.8.8-rc3', '0.8.7']);
  });

  it('fails closed for missing or invalid deployment versions and ignores invalid entries', () => {
    const entries = [entry('1.0.0'), entry('invalid')];
    expect(visibleEntries(entries, 'unknown')).toEqual([]);
    expect(visibleEntries(entries, null)).toEqual([]);
    expect(visibleEntries(entries, '1.0.0')).toEqual([entry('1.0.0')]);
  });

  it('uses version precedence instead of allowing a later date to promote an older release', () => {
    const older = entry('0.8.9', { date: '2026-10-23' });
    const newer = entry('0.8.10', { date: '2026-01-01' });
    expect(visibleEntries([older, newer], '0.8.10')).toEqual([newer, older]);
  });

  it('keeps a breaking-change announcement next to its release without treating it as a prerelease', () => {
    const release = entry('0.7.0');
    const announcement = entry('0.7.0', { id: 'v0.7.0-breaking-changes', kind: 'announcement' });
    expect(visibleEntries([announcement, release], '0.7.0')).toEqual([release, announcement]);
  });

  it.each(['es', 'es-ES', 'es_MX', 'ES-ar'])('uses Spanish for %s', (language) => {
    expect(newsLanguage(language)).toBe('es');
  });

  it.each(['en', 'fr', 'de-DE', '', undefined])('falls back to English for %s', (language) => {
    expect(newsLanguage(language)).toBe('en');
  });

  it('removes only the frontmatter and preserves code, links and subsequent horizontal rules', () => {
    expect(
      markdownBody(
        '---\ntitle: Release\ndate: 2026-09-30\n---\n# Release\n\n---\n`code` [link](/docs)',
      ),
    ).toBe('# Release\n\n---\n`code` [link](/docs)');
  });
});
