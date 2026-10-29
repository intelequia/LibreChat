import { render, screen } from '@testing-library/react';
import Markdown from '../Markdown';

describe('News Markdown', () => {
  it('renders original headings, GFM tables, links, images and code without frontmatter', () => {
    const { container } = render(
      <Markdown
        source="https://www.librechat.ai/changelog/v0.8.8"
        content={
          '---\ntitle: Hidden metadata\n---\n# Release\n\n[Docs](/docs)\n\n![Logo](/images/logo.png)\n\n| A | B |\n| - | - |\n| 1 | 2 |\n\n```sh\nnpm install\n```'
        }
      />,
    );
    expect(screen.getByRole('heading', { name: 'Release' })).toBeInTheDocument();
    expect(screen.queryByText('Hidden metadata')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute(
      'href',
      'https://www.librechat.ai/docs',
    );
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute(
      'rel',
      'noopener noreferrer',
    );
    expect(screen.getByRole('img', { name: 'Logo' })).toHaveAttribute(
      'src',
      'https://www.librechat.ai/images/logo.png',
    );
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(container.querySelector('pre code')).toHaveTextContent('npm install');
  });

  it('sanitizes scripts, event handlers, unsafe protocols, styles and frames', () => {
    const { container } = render(
      <Markdown
        content={
          '<script>alert(1)</script>\n\n<img src="https://example.com/image.png" onerror="alert(1)" style="position:fixed">\n\n<a href="javascript:alert(1)">Unsafe</a>\n\n<iframe srcdoc="unsafe"></iframe>\n\n[Bad](javascript:alert(1))'
        }
      />,
    );
    expect(container.querySelector('script,iframe,[onerror],[style]')).toBeNull();
    for (const anchor of container.querySelectorAll('a')) {
      expect(anchor.getAttribute('href') ?? '').not.toMatch(/^javascript:/i);
    }
  });

  it('preserves the titles and contents of upstream MDX callouts without executing MDX', () => {
    render(
      <Markdown
        content={
          '<Callout type="warning" title="Breaking changes">\n\nKeep **this content**.\n\n</Callout>'
        }
      />,
    );
    expect(screen.getByRole('heading', { name: 'Breaking changes' })).toBeInTheDocument();
    expect(screen.getByText('this content').tagName).toBe('STRONG');
  });

  it('does not rewrite callout examples inside fenced code blocks', () => {
    const { container } = render(
      <Markdown content={'```xml\n<Callout title="Example">\n</Callout>\n```'} />,
    );
    expect(container.querySelector('code')).toHaveTextContent('<Callout title="Example">');
    expect(container.querySelector('h3')).toBeNull();
  });
});
