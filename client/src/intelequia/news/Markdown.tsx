import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { visit } from 'unist-util-visit';
import rehypeSanitize from 'rehype-sanitize';
import ReactMarkdown, { defaultUrlTransform } from 'react-markdown';
import type { Components } from 'react-markdown';
import type { Root } from 'mdast';
import { markdownBody } from './catalog';

function remarkCallouts() {
  return (tree: Root) => {
    visit(tree, 'html', (node) => {
      node.value = node.value
        .replace(/<Callout\b[^>]*>/gi, (tag) => {
          const parsed = new DOMParser().parseFromString(tag, 'text/html');
          const heading = document.createElement('h3');
          heading.textContent = parsed.querySelector('callout')?.getAttribute('title') ?? '';
          return heading.outerHTML;
        })
        .replace(/<\/Callout>/gi, '');
    });
  };
}

const components: Components = {
  a: ({ node: _node, children, ...props }) => (
    <a {...props} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
  img: ({ node: _node, ...props }) => <img {...props} alt={props.alt ?? ''} loading="lazy" />,
};

export default function Markdown({ content, source }: { content: string; source?: string }) {
  return (
    <div className="markdown prose prose-sm dark:prose-invert max-w-none break-words text-text-primary [&_pre]:overflow-x-auto [&_table]:block [&_table]:overflow-x-auto">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkCallouts]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={components}
        urlTransform={(value) => {
          const safe = defaultUrlTransform(value);
          if (!safe || !source) {
            return safe;
          }
          try {
            return new URL(safe, source).href;
          } catch {
            return '';
          }
        }}
      >
        {markdownBody(content)}
      </ReactMarkdown>
    </div>
  );
}
