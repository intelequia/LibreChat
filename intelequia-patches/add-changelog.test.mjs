import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { addChangelog } from './add-changelog.mjs';

const release = (version, overrides = {}) => ({
    id: `v${version}`,
    version,
    date: '2026-01-01',
    kind: 'release',
    ...overrides,
});

async function fixture(context, version, entries) {
    const root = await mkdtemp(join(tmpdir(), 'intelewriter-changelog-'));
    context.after(() => rm(root, { recursive: true, force: true }));
    const content = join(root, 'client/src/intelequia/news/content');
    const catalog = join(content, 'releases.json');
    await mkdir(join(content, 'librechat'), { recursive: true });
    await writeFile(join(root, 'package.json'), JSON.stringify({ version }));
    await writeFile(catalog, `${JSON.stringify(entries)}\n`);
    return { root, content, catalog };
}

test('creates bilingual templates for the package version and places a newer release first', async (context) => {
    const { root, catalog } = await fixture(context, 'v1.10.0', [release('1.9.0')]);
    const result = await addChangelog({ root, date: '2026-10-23' });
    assert.equal(result.created, true);
    assert.deepEqual(result.entry, release('1.10.0', { date: '2026-10-23' }));
    assert.match(
        await readFile(join(result.directory, 'en.md'), 'utf8'),
        /^# v1\.10\.0\n\n## Changes/,
    );
    assert.match(
        await readFile(join(result.directory, 'es.md'), 'utf8'),
        /^# v1\.10\.0\n\n## Cambios/,
    );
    assert.deepEqual(
        JSON.parse(await readFile(catalog, 'utf8')).map((entry) => entry.version),
        ['1.10.0', '1.9.0'],
    );
});

test('uses today in UTC and inserts a missing older version below newer ones', async (context) => {
    const { root, catalog } = await fixture(context, '1.9.0', [release('1.10.0')]);
    const today = new Date().toISOString().slice(0, 10);
    const result = await addChangelog({ root });
    assert.equal(result.entry.date, today);
    assert.deepEqual(
        JSON.parse(await readFile(catalog, 'utf8')).map((entry) => entry.version),
        ['1.10.0', '1.9.0'],
    );
});

test('orders numeric prereleases semantically without promoting them over the stable release', async (context) => {
    const { root, catalog } = await fixture(context, '1.10.0-rc.10', [
        release('1.10.0-rc.2'),
        release('1.10.0'),
    ]);
    await addChangelog({ root });
    assert.deepEqual(
        JSON.parse(await readFile(catalog, 'utf8')).map((entry) => entry.version),
        ['1.10.0', '1.10.0-rc.10', '1.10.0-rc.2'],
    );
});

test('does not overwrite an existing release, its date, the catalog or hand-written notes', async (context) => {
    const existing = release('1.10.0');
    const { root, content, catalog } = await fixture(context, 'v1.10.0', [existing]);
    const directory = join(content, 'librechat', existing.id);
    await mkdir(directory);
    await writeFile(join(directory, 'es.md'), '# Manual notes\n');
    const before = await readFile(catalog, 'utf8');
    const result = await addChangelog({ root, date: '2026-10-23' });
    assert.equal(result.created, false);
    assert.deepEqual(result.entry, existing);
    assert.equal(await readFile(catalog, 'utf8'), before);
    assert.equal(await readFile(join(directory, 'es.md'), 'utf8'), '# Manual notes\n');
});

test('keeps an announcement distinct from a release for the same version', async (context) => {
    const announcement = release('1.10.0', { id: 'v1.10.0-breaking-changes', kind: 'announcement' });
    const { root, catalog } = await fixture(context, '1.10.0', [announcement]);
    await addChangelog({ root });
    assert.deepEqual(
        JSON.parse(await readFile(catalog, 'utf8')).map((entry) => entry.kind),
        ['release', 'announcement'],
    );
});

test('refuses to replace a directory containing notes not yet indexed', async (context) => {
    const { root, content, catalog } = await fixture(context, '1.10.0', []);
    const directory = join(content, 'librechat/v1.10.0');
    await mkdir(directory);
    await writeFile(join(directory, 'en.md'), '# Keep this\n');
    await assert.rejects(addChangelog({ root }), { code: 'EEXIST' });
    assert.deepEqual(JSON.parse(await readFile(catalog, 'utf8')), []);
    assert.equal(await readFile(join(directory, 'en.md'), 'utf8'), '# Keep this\n');
});

test('rejects an invalid package version before changing the catalog', async (context) => {
    const { root, catalog } = await fixture(context, '../invalid', []);
    await assert.rejects(addChangelog({ root }), /valid semantic version/);
    assert.deepEqual(JSON.parse(await readFile(catalog, 'utf8')), []);
});

for (const date of ['2026-02-30', '23-10-2026', 'invalid']) {
    test(`rejects the invalid date ${date} without changing the catalog`, async (context) => {
        const { root, catalog } = await fixture(context, '1.10.0', []);
        await assert.rejects(addChangelog({ root, date }), /valid release date/);
        assert.deepEqual(JSON.parse(await readFile(catalog, 'utf8')), []);
    });
}
