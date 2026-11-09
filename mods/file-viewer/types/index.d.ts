export type OpenFolders = string[]

declare module 'claude-code' {
  interface PluginState {
    'file-viewer': { openFolders: Shaped<OpenFolders> }
  }
}
