/**
 * src/preload/preload.ts
 * Secure IPC bridge exposed to the renderer via contextBridge.
 * The renderer calls window.api.* — never touches Node/DB directly.
 * Full implementation in Phase 3; this is the scaffold stub.
 */

import { contextBridge } from 'electron'

// Expose an empty api object for now; Phase 3 will populate it.
contextBridge.exposeInMainWorld('api', {})
