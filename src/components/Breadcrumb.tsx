import { breadcrumbFolders } from '../lib/breadcrumb';
import { BREADCRUMB_LABEL, BREADCRUMB_SEPARATOR } from '../lib/format';

/** The folders above the selected file, root first. The file's name stays in the title. */
export function Breadcrumb({ path }: { path: string }) {
  const folders = breadcrumbFolders(path);
  return (
    <nav className="breadcrumb" aria-label={BREADCRUMB_LABEL}>
      <ol className="breadcrumb-list">
        {folders.map((name, i) => (
          // Folders along one path can repeat names, so the index is part of the key.
          <li key={`${i}/${name}`} className="breadcrumb-item">
            {i > 0 && (
              <span className="breadcrumb-separator" aria-hidden="true">
                {BREADCRUMB_SEPARATOR}
              </span>
            )}
            <span className="breadcrumb-name" title={name}>
              {name}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
}
