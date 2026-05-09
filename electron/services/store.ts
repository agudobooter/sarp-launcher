import Store from "electron-store"

export interface WindowStateSchema {
  width: number
  height: number
  x: number | null
  y: number | null
  isMaximized: boolean
  isFullscreen: boolean
}

export interface LauncherStoreSchema {
  sampVersion: number | null
  cacheVersion: number | null
  gtaPath: string | null
  gtaInstallTempDir: string | null
  cacheInstallTempDir: string | null
  /** Size in bytes of the last successfully installed server cache zip.
   *  Compared against the manifest's cache.zip.size to decide whether the
   *  local cache is current — different size means a new upload happened. */
  installedCacheSize: number | null
  /** Last known window bounds + flags. Restored on next launch and clamped
   *  to a visible display before being applied. */
  windowState: WindowStateSchema | null

  /** Best Score for minigame */
  miniGameHighScore: number
}

const store = new Store<LauncherStoreSchema>({
  defaults: {
    sampVersion: null,
    cacheVersion: null,
    gtaPath: null,
    gtaInstallTempDir: null,
    cacheInstallTempDir: null,
    installedCacheSize: null,
    windowState: null,
    miniGameHighScore: 0,
  },
})

export default store
