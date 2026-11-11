/**
 * The folders a file sits in, from the picked root down to the file's own folder.
 * Takes a tree path such as `proj/src/lib/a.ts` (root folder name first) and returns
 * `['proj', 'src', 'lib']`; a file directly in the root gives just `['proj']`.
 */
export function breadcrumbFolders(path: string): string[] {
  return path.split('/').filter(Boolean).slice(0, -1);
}
