import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MarkdownBoundary } from './MarkdownBoundary';

// Without a DOM test environment (retro item 6) React won't catch a render error
// in a static render, so these test the boundary's two halves directly.
describe('MarkdownBoundary', () => {
  it('renders its children while nothing has failed', () => {
    const html = renderToStaticMarkup(
      <MarkdownBoundary fallback={<p>plain</p>}>
        <p>markdown</p>
      </MarkdownBoundary>,
    );
    expect(html).toBe('<p>markdown</p>');
  });

  it('renders the fallback once a render error was caught', () => {
    const boundary = new MarkdownBoundary({ fallback: <p>plain</p>, children: <p>markdown</p> });
    boundary.state = MarkdownBoundary.getDerivedStateFromError();
    expect(renderToStaticMarkup(<>{boundary.render()}</>)).toBe('<p>plain</p>');
  });
});
