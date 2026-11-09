import { expect, test } from 'claude-code/testing'

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
    entry('a.txt', 'file', 5),
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
  on('fs.list', (_: unknown, e: { path: string }) => {
    const value = FOLDERS[e.path]
    if (!value) throw new Error('ENOENT')
    return { value }
  })
}

test('folders come first, files show a size, and skipped entries are gone', async ($, on) => {
  stubEngine(on)
  const ui = await $.ui.mount(PANE)

  expect(await ui.find({ key: 'src' })).toBeDefined()
  expect((await ui.find({ type: 'Text', text: /a\.txt/ }))?.text).toBe('a.txt 5 B')
  expect((await ui.find({ type: 'Text', text: /z\.txt/ }))?.text).toBe('z.txt 2.0 KB')
  expect(await ui.find({ key: '.git' })).toBeUndefined()
  expect(await ui.find({ key: 'node_modules' })).toBeUndefined()
  expect(await ui.find({ type: 'Text', text: /link/ })).toBeUndefined()
  await ui.unmount()
})

test('a press opens a folder and a second press closes it', async ($, on) => {
  stubEngine(on)
  const ui = await $.ui.mount(PANE)

  expect(await ui.find({ type: 'Text', text: /main\.ts/ })).toBeUndefined()
  await ui.press({ key: 'src' })
  expect(await ui.find({ type: 'Text', text: /main\.ts/ })).toBeDefined()
  await ui.press({ key: 'src' })
  expect(await ui.find({ type: 'Text', text: /main\.ts/ })).toBeUndefined()
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
