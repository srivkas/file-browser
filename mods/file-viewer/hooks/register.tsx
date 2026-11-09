import { atom, read, update } from 'claude-code'
import type { FsEntry, FsStat, Register } from 'claude-code'

const PANE = 'file-viewer'
const SKIPPED = new Set(['.git', 'node_modules'])
const SIZE_CAP = 256 * 1024
const LINE_CAP = 400
const CHARACTER_CAP = 60_000
const WIDE_COLUMNS = 70
const TREE_SHARE = 0.35

// Folders the user has opened, as paths relative to the project root.
const openFolders = atom({ plugin: 'file-viewer', key: 'openFolders' } as const, [], {
  shape: 'open-folders-1',
})

// The file shown in the preview, as a path relative to the project root.
const selectedFile = atom({ plugin: 'file-viewer', key: 'selectedFile' } as const, null, {
  shape: 'selected-file-1',
})

type Row =
  | { kind: 'folder'; path: string; name: string; depth: number; isOpen: boolean }
  | { kind: 'file'; path: string; name: string; depth: number; size: number }
  | { kind: 'note'; path: string; text: string; depth: number }

export type Preview =
  | { kind: 'code'; path: string; size: number; source: string; isCut: boolean }
  | { kind: 'note'; path: string; text: string }

type Fs = {
  list: (path: string) => Promise<FsEntry[]>
  stat: (path: string, options: { resolve: boolean }) => Promise<FsStat>
  read: (path: string) => Promise<string>
}

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
  fs: Fs,
  root: string,
  folder: string,
  depth: number,
  open: readonly string[],
): Promise<Row[]> {
  let entries: FsEntry[]
  try {
    entries = visibleEntries(await fs.list(folder === '' ? root : `${root}/${folder}`))
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
    if (isOpen) rows.push(...(await treeRows(fs, root, path, depth + 1, open)))
  }
  return rows
}

// The drawing accepts tab and newline only, and binary content decodes to these same characters.
function looksBinary(text: string): boolean {
  for (const character of text) {
    const code = character.codePointAt(0) ?? 0
    const isControl = (code < 32 && code !== 9 && code !== 10) || code === 127
    if (isControl || code === 0xfffd) return true
  }
  return false
}

export async function loadPreview(fs: Fs, root: string, path: string): Promise<Preview> {
  const note = (text: string): Preview => ({ kind: 'note', path, text })
  const parts = path.split(/[\\/]/)
  if (parts.includes('..') || parts.some(part => SKIPPED.has(part))) {
    return note('This file is outside the project view.')
  }

  try {
    const project = await fs.stat(root, { resolve: true })
    const stat = await fs.stat(`${root}/${path}`, { resolve: true })
    const projectPath = project.realPath ?? root
    if (!stat.realPath?.startsWith(`${projectPath}/`)) return note('This file is outside the project view.')
    if (stat.kind !== 'file') return note('This is not a regular file.')
    if (stat.size > SIZE_CAP) {
      return note(`Too large to preview: ${formatSize(stat.size)}, the limit is ${formatSize(SIZE_CAP)}.`)
    }
    if (stat.size === 0) return note('This file is empty.')

    const text = (await fs.read(`${root}/${path}`)).replaceAll('\r\n', '\n')
    if (looksBinary(text)) return note('Binary file, nothing to preview.')

    const lines = text.split('\n')
    const firstLines = lines.slice(0, LINE_CAP).join('\n')
    const source = firstLines.slice(0, CHARACTER_CAP)
    return { kind: 'code', path, size: stat.size, source, isCut: source.length < text.length }
  } catch {
    return note('Cannot read this file.')
  }
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
    const { Box, Button, Code, Text } = $.ui.resolve(e)
    const fs: Fs = {
      list: path => $.fs.list(path),
      stat: (path, options) => $.fs.stat(path, options),
      read: path => $.fs.read(path),
    }
    const root = await $.session.root()
    const open = await read($, openFolders)
    const selected = await read($, selectedFile)
    const rows = await treeRows(fs, root, '', 0, open)
    const preview = selected === null ? null : await loadPreview(fs, root, selected)

    const toggle = (path: string) =>
      update($, openFolders, folders =>
        folders.includes(path) ? folders.filter(one => one !== path) : [...folders, path],
      )
    const select = (path: string) => update($, selectedFile, () => path)

    // Two columns when there is room; a narrow pane stacks them.
    const columns = e.props.bodyColumns
    const isWide = columns >= WIDE_COLUMNS
    const treeWidth = isWide ? Math.floor(columns * TREE_SHARE) : undefined

    return (
      <Box flexDirection={isWide ? 'row' : 'column'}>
        <Box flexDirection="column" flexShrink={0} width={treeWidth}>
          {rows.length === 0 && <Text dimColor>This folder is empty.</Text>}
          {rows.map(row => (
            <Box flexDirection="row" paddingLeft={row.depth * 2}>
              {row.kind === 'folder' && (
                <Button key={row.path} plain onPress={() => toggle(row.path)}>
                  {row.isOpen ? '▾' : '▸'} {row.name}/
                </Button>
              )}
              {row.kind === 'file' && (
                <Button key={row.path} plain onPress={() => select(row.path)}>
                  {row.path === selected ? '● ' : ''}
                  {row.name} <Text dimColor>{formatSize(row.size)}</Text>
                </Button>
              )}
              {row.kind === 'note' && <Text dimColor>{row.text}</Text>}
            </Box>
          ))}
        </Box>
        {preview && (
          <Box flexDirection="column" flexGrow={1} flexShrink={1} marginLeft={isWide ? 2 : 0} marginTop={isWide ? 0 : 1}>
            <Text bold>
              {preview.path}
              {preview.kind === 'code' ? ` · ${formatSize(preview.size)}` : ''}
            </Text>
            {preview.kind === 'note' && <Text dimColor>{preview.text}</Text>}
            {preview.kind === 'code' && <Code source={preview.source} path={preview.path} startLine={1} />}
            {preview.kind === 'code' && preview.isCut && (
              <Text dimColor>Showing only the first part of this file.</Text>
            )}
          </Box>
        )}
      </Box>
    )
  })
}
