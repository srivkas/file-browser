import { expect, test } from 'claude-code/testing'
import { loadPreview } from '../hooks/register'

const PANE = {
  plugin: 'file-viewer',
  component: 'Pane',
  requestId: 'file-viewer',
  surface: 'terminal',
  props: {
    title: 'project',
    isFocused: false,
    bodyColumns: 40,
    placement: 'dock',
    scroll: { offset: 0, bodyRows: 20 },
    view: {},
  },
} as const

const entry = (name: string, kind: string, size = 0) => ({
  name,
  kind,
  size,
  mtimeMs: 0,
  isLink: kind === 'other',
})

const FOLDERS: Record<string, unknown[]> = {
  '/project': [
    entry('z.txt', 'file', 2048),
    entry('a.ts', 'file', 5),
    entry('src', 'dir'),
    entry('.git', 'dir'),
    entry('node_modules', 'dir'),
    entry('link', 'other'),
  ],
  '/project/src': [entry('main.ts', 'file', 10)],
}

type Stub = (event: string, hook: (_: unknown, e: { path: string }) => unknown) => void

const stubEngine = (on: Stub) => {
  on('session.root', () => ({ value: '/project' }))
  on('fs.list', (_, e) => {
    const value = FOLDERS[e.path]
    if (!value) throw new Error('ENOENT')
    return { value }
  })
  on('fs.stat', (_, e) => ({ value: { kind: 'file', size: 5, mtimeMs: 0, isLink: false, realPath: e.path } }))
  on('fs.read', () => ({ value: 'const a = 1' }))
}

test('folders come first, files show a size, and skipped entries are gone', async ($, on) => {
  stubEngine(on)
  const ui = await $.ui.mount(PANE)

  expect(await ui.find({ key: 'src' })).toBeDefined()
  expect((await ui.find({ key: 'a.ts' }))?.text).toBe('a.ts 5 B')
  expect((await ui.find({ key: 'z.txt' }))?.text).toBe('z.txt 2.0 KB')
  expect(await ui.find({ key: '.git' })).toBeUndefined()
  expect(await ui.find({ key: 'node_modules' })).toBeUndefined()
  expect(await ui.find({ key: 'link' })).toBeUndefined()
  await ui.unmount()
})

test('a press opens a folder and a second press closes it', async ($, on) => {
  stubEngine(on)
  const ui = await $.ui.mount(PANE)

  expect(await ui.find({ key: 'src/main.ts' })).toBeUndefined()
  await ui.press({ key: 'src' })
  expect(await ui.find({ key: 'src/main.ts' })).toBeDefined()
  await ui.press({ key: 'src' })
  expect(await ui.find({ key: 'src/main.ts' })).toBeUndefined()
  await ui.unmount()
})

test('selecting a file marks it and shows its path, size and code', async ($, on) => {
  stubEngine(on)
  const ui = await $.ui.mount(PANE)

  await ui.press({ key: 'a.ts' })
  expect((await ui.find({ key: 'a.ts' }))?.text).toBe('● a.ts 5 B')
  expect((await ui.find({ type: 'Text', text: /a\.ts · 5 B/ }))?.text).toBe('a.ts · 5 B')
  expect(await ui.find({ type: 'Code' })).toBeDefined()
  await ui.unmount()
})

test('an unreadable folder shows one calm line', async ($, on) => {
  on('session.root', () => ({ value: '/missing' }))
  on('fs.list', () => {
    throw new Error('EACCES')
  })
  const ui = await $.ui.mount(PANE)

  expect((await ui.find({ type: 'Text', text: /Cannot read/ }))?.text).toBe('Cannot read this folder.')
  await ui.unmount()
})

const stat = (size: number, realPath: string) => ({ kind: 'file', size, mtimeMs: 0, isLink: false, realPath }) as const

const fsWith = (options: { size?: number; text?: string; realPath?: string; fails?: boolean }) => ({
  list: async () => [],
  stat: async (path: string) => {
    if (path === '/project') return stat(0, '/project')
    return stat(options.size ?? 5, options.realPath ?? path)
  },
  read: async () => {
    if (options.fails) throw new Error('EACCES')
    return options.text ?? 'hello'
  },
})

const noteOf = async (fs: ReturnType<typeof fsWith>, path = 'a.txt') => {
  const preview = await loadPreview(fs, '/project', path)
  return preview.kind === 'note' ? preview.text : undefined
}

test('a binary, a huge and an unreadable file each get one line', async () => {
  expect(await noteOf(fsWith({ text: 'a\0b' }))).toBe('Binary file, nothing to preview.')
  expect(await noteOf(fsWith({ text: 'a�b' }))).toBe('Binary file, nothing to preview.')
  expect(await noteOf(fsWith({ size: 5_000_000 }))).toBe('Too large to preview: 4.8 MB, the limit is 256.0 KB.')
  expect(await noteOf(fsWith({ fails: true }))).toBe('Cannot read this file.')
})

test('a path outside the project is refused, however it is spelled', async () => {
  const refused = 'This file is outside the project view.'
  expect(await noteOf(fsWith({}), '../secret.txt')).toBe(refused)
  expect(await noteOf(fsWith({}), 'src/../../secret.txt')).toBe(refused)
  expect(await noteOf(fsWith({}), '.git/config')).toBe(refused)
  expect(await noteOf(fsWith({ realPath: '/elsewhere/secret.txt' }))).toBe(refused)
  expect(await noteOf(fsWith({ realPath: '/project-other/secret.txt' }))).toBe(refused)
})

test('a long file shows only its first lines', async () => {
  const text = Array.from({ length: 1000 }, (_, i) => `line ${i}`).join('\n')
  const preview = await loadPreview(fsWith({ text }), '/project', 'a.txt')
  expect(preview.kind === 'code' && preview.isCut).toBe(true)
  expect(preview.kind === 'code' && preview.source.split('\n').length).toBe(400)
})
