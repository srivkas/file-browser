export type OpenFolders = string[]
export type SelectedFile = string | null

declare module 'claude-code' {
  interface PluginState {
    'file-viewer': {
      openFolders: Shaped<OpenFolders>
      selectedFile: Shaped<SelectedFile>
    }
  }
}
