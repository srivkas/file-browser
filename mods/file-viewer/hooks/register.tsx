import { atom, read, update } from 'claude-code'
import type { FsEntry, Register } from 'claude-code'

const PANE = 'file-viewer'
const SKIPPED = new Set(['.git', 'node_modules'])

// Folders the user has opened, as paths relative to the project root.
const openFolders = atom({ plugin: 'file-viewer', key: 'openFolders' } as const, [], {
  shape: 'open-folders-1',
})

type Row =
  | { kind: 'folder'; path: string; name: string; depth: number; isOpen: boolean }
  | { kind: 'file'; path: string; name: string; depth: number; size: number }
  | { kind: 'note'; path: string; text: string; depth: number }

type List = (path: string) => Promise<FsEntry[]>

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Links are left out on purpose: following one could lead outside the project.
function visibleEntries(entries: readonly FsEntry[]): FsEntry[] {
  return entries
    .filter(entry => (entry.kind === 'dir' || entry.kind === 'file') && !SKIPPED.has(entry.name))
    .sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === 'dir' ? -1 : 1
      return a.name.localeCompare(b.name)
    })
}

async function treeRows(
  list: List,
  root: string,
  folder: string,
  depth: number,
  open: readonly string[],
): Promise<Row[]> {
  let entries: FsEntry[]
  try {
    entries = visibleEntries(await list(folder === '' ? root : `${root}/${folder}`))
  } catch {
    return [{ kind: 'note', path: `${folder}/!`, text: 'Cannot read this folder.', depth }]
  }

  const rows: Row[] = []
  for (const entry of entries) {
    const path = folder === '' ? entry.name : `${folder}/${entry.name}`
    if (entry.kind === 'file') {
      rows.push({ kind: 'file', path, name: entry.name, depth, size: entry.size })
      continue
    }
    const isOpen = open.includes(path)
    rows.push({ kind: 'folder', path, name: entry.name, depth, isOpen })
    if (isOpen) rows.push(...(await treeRows(list, root, path, depth + 1, open)))
  }
  return rows
}

function projectName(root: string): string {
  return root.split(/[\\/]/).filter(Boolean).pop() ?? root
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'file-viewer',
      description: "Show this project's file tree in a pane",
    })

    return next(e)
  })

  on('command.run', { command: 'file-viewer' }, async $ => {
    const root = await $.session.root()
    await $.ui.open({ id: PANE, title: projectName(root) })

    return { text: 'File viewer opened.' }
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Button, Text } = $.ui.resolve(e)
    const root = await $.session.root()
    const open = await read($, openFolders)
    const rows = await treeRows(path => $.fs.list(path), root, '', 0, open)

    const toggle = (path: string) =>
      update($, openFolders, folders =>
        folders.includes(path) ? folders.filter(one => one !== path) : [...folders, path],
      )

    return (
      <Box flexDirection="column">
        {rows.length === 0 && <Text dimColor>This folder is empty.</Text>}
        {rows.map(row => (
          <Box flexDirection="row" paddingLeft={row.depth * 2}>
            {row.kind === 'folder' && (
              <Button key={row.path} plain onPress={() => toggle(row.path)}>
                {row.isOpen ? '▾' : '▸'} {row.name}/
              </Button>
            )}
            {row.kind === 'file' && (
              <Text>
                {row.name} <Text dimColor>{formatSize(row.size)}</Text>
              </Text>
            )}
            {row.kind === 'note' && <Text dimColor>{row.text}</Text>}
          </Box>
        ))}
      </Box>
    )
  })
}
