import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import semver from 'semver';

const repository = fileURLToPath(new URL('../', import.meta.url));

export async function addChangelog({
    root = repository,
    date = new Date().toISOString().slice(0, 10),
} = {}) {
    const metadata = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
    const version = semver.valid(metadata.version);
    if (!version) {
        throw new Error('package.json must contain a valid semantic version.');
    }
    const parsedDate = new Date(`${date}T00:00:00Z`);
    if (
        !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
        Number.isNaN(parsedDate.getTime()) ||
        parsedDate.toISOString().slice(0, 10) !== date
    ) {
        throw new Error('Use a valid release date in YYYY-MM-DD format.');
    }

    const content = join(root, 'client/src/intelequia/news/content');
    const catalogPath = join(content, 'releases.json');
    const entries = JSON.parse(await readFile(catalogPath, 'utf8'));
    if (!Array.isArray(entries) || entries.some((entry) => !semver.valid(entry.version))) {
        throw new Error('releases.json must be an array of entries with valid semantic versions.');
    }

    const existing = entries.find(
        (entry) => entry.kind === 'release' && semver.eq(entry.version, version),
    );
    if (existing) {
        return { created: false, entry: existing, directory: join(content, 'librechat', existing.id) };
    }

    const entry = { id: `v${version}`, version, date, kind: 'release' };
    const directory = join(content, 'librechat', entry.id);
    await mkdir(directory);
    for (const [language, heading] of [
        ['en', 'Changes'],
        ['es', 'Cambios'],
    ]) {
        await writeFile(join(directory, `${language}.md`), `# v${version}\n\n## ${heading}\n\n`, {
            flag: 'wx',
        });
    }
    entries.push(entry);
    entries.sort(
        (left, right) =>
            semver.rcompare(left.version, right.version) ||
            Number(left.kind === 'announcement') - Number(right.kind === 'announcement') ||
            right.date.localeCompare(left.date) ||
            left.id.localeCompare(right.id),
    );
    await writeFile(catalogPath, `${JSON.stringify(entries, null, 2)}\n`);
    return { created: true, entry, directory };
}

async function main() {
    const { values } = parseArgs({
        options: { date: { type: 'string' }, help: { type: 'boolean', short: 'h' } },
    });
    if (values.help) {
        console.log('npm run add-changelog [-- --date YYYY-MM-DD]');
        console.log('Uses the root package version and today (UTC). Never overwrites existing notes.');
        return;
    }
    const { created, entry, directory } = await addChangelog({ date: values.date });
    console.log(
        `${entry.id}: ${created ? `created (${entry.date})` : 'already exists; nothing changed'}.`,
    );
    console.log(`Edit ${directory}/en.md and es.md manually.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    main().catch((error) => {
        console.error(error.message);
        process.exitCode = 1;
    });
}
