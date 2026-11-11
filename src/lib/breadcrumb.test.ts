import { describe, expect, it } from 'vitest';
import { breadcrumbFolders } from './breadcrumb';

describe('breadcrumbFolders', () => {
  it('lists every folder from the root down to the file folder', () => {
    expect(breadcrumbFolders('proj/src/lib/a.ts')).toEqual(['proj', 'src', 'lib']);
  });

  it('gives just the root for a file directly in the root', () => {
    expect(breadcrumbFolders('proj/a.ts')).toEqual(['proj']);
  });

  it('leaves out the file name', () => {
    expect(breadcrumbFolders('proj/docs/readme.md')).not.toContain('readme.md');
  });

  it('ignores empty segments from stray slashes', () => {
    expect(breadcrumbFolders('proj//docs/a.md')).toEqual(['proj', 'docs']);
  });

  it('gives no folders for a bare name', () => {
    expect(breadcrumbFolders('a.md')).toEqual([]);
  });
});
