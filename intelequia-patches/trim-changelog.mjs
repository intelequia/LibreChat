import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { unified } from 'unified';
import remarkParse from 'remark-parse';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const parser = unified().use(remarkParse);

function headingText(node) {
  return node.value ?? node.children?.map(headingText).join('') ?? '';
}

function headingName(node) {
  return headingText(node)
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const changes = /^(?:what s changed|que ha cambiado|changes|cambios)$/;
const highlights = /^(?:highlights|destacados|aspectos destacados|puntos destacados)$/;
const details =
  /^(?:(?:new )?features?|nuevas? (?:caracteristicas|funciones)|caracteristicas|fixes|bug fixes|correcciones|correccion de errores|refactor(?:ing|s|izacion|izadores)?|tests?|testing|pruebas|documentation|documentacion|chore?s?|tareas|internationalization|internacionalizacion|translations|traducciones|accessibility|accesibilidad|styles?|styling|estilos?|continuous integration|integracion continua|dependencies|dependencias|configs?|configuraciones)\b/;

export function trimChangelog(markdown) {
  const frontmatter = markdown.match(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/)?.[0] ?? '';
  const body = markdown.slice(frontmatter.length);
  const nodes = parser.parse(body).children;
  const ranges = [];

  for (let index = 0; index < nodes.length; index++) {
    const node = nodes[index];
    if (node.type !== 'heading') continue;
    const name = headingName(node);
    if (!changes.test(name) && !highlights.test(name)) continue;

    let end = index + 1;
    while (end < nodes.length) {
      const next = nodes[end];
      if (
        next.type === 'heading' &&
        (changes.test(name) || next.depth <= node.depth || details.test(headingName(next)))
      )
        break;
      end++;
    }
    while (end > index + 1 && nodes[end - 1].type === 'thematicBreak') end--;
    ranges.push({ start: index, end });
    index = end - 1;
  }

  const kept = ranges.flatMap(({ start, end }) => nodes.slice(start, end));
  if (!kept.some((node) => !['heading', 'thematicBreak', 'definition'].includes(node.type))) {
    return frontmatter;
  }

  const sections = ranges.map(({ start, end }) =>
    body.slice(nodes[start].position.start.offset, nodes[end - 1].position.end.offset).trim(),
  );
  const definitions = nodes.filter((node) => node.type === 'definition' && !kept.includes(node));
  sections.push(
    ...definitions.map((node) => body.slice(node.position.start.offset, node.position.end.offset)),
  );
  return `${frontmatter}${frontmatter ? '\n' : ''}${sections.join('\n\n')}\n`;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.some((arg) => arg !== '--write')) throw new Error('Only --write is supported.');
  const content = join(root, 'client/src/intelequia/news/content');
  const entries = JSON.parse(await readFile(join(content, 'releases.json'), 'utf8'));
  const updates = [];
  const empty = [];
  let unchanged = 0;

  for (const entry of entries) {
    for (const language of ['en', 'es']) {
      const path = join('librechat', entry.id, `${language}.md`);
      const original = await readFile(join(content, path), 'utf8');
      const trimmed = trimChangelog(original);
      if (!trimmed.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, '').trim()) {
        empty.push(path);
      }
      if (trimmed === original) {
        unchanged++;
      } else {
        updates.push({ path, trimmed });
      }
    }
  }

  if (args.includes('--write')) {
    for (const { path, trimmed } of updates) {
      await writeFile(join(content, path), trimmed);
    }
  }
  console.log(
    JSON.stringify(
      {
        mode: args.includes('--write') ? 'write' : 'preview',
        changed: updates.length,
        unchanged,
        empty,
      },
      null,
      2,
    ),
  );
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
