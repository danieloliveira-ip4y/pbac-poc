export type PermissionLogLayer = 'auth' | 'store' | 'guard' | 'admin'

export const permissionLogLayerLabels: Record<PermissionLogLayer, string> = {
  auth: 'Auth',
  store: 'Store',
  guard: 'Guard',
  admin: 'Admin',
}

export type PermissionLogDetails = Readonly<Record<string, string | number | boolean | null>>

export interface PermissionLogEntry {
  seq: number
  timestamp: number
  layer: PermissionLogLayer
  event: string
  message: string
  details?: PermissionLogDetails
}

export type PermissionLogListener = (entries: readonly PermissionLogEntry[]) => void

const MAX_ENTRIES = 200

class PermissionLogger {
  private seq = 0
  private entries: PermissionLogEntry[] = []
  private listeners = new Set<PermissionLogListener>()

  trace(
    layer: PermissionLogLayer,
    event: string,
    message: string,
    details?: PermissionLogDetails,
  ): PermissionLogEntry {
    this.seq += 1

    const entry: PermissionLogEntry = {
      seq: this.seq,
      timestamp: Date.now(),
      layer,
      event,
      message,
      details,
    }

    this.entries = [...this.entries, entry].slice(-MAX_ENTRIES)
    this.logToConsole(entry)
    this.emit()
    return entry
  }

  getEntries(): readonly PermissionLogEntry[] {
    return this.entries
  }

  clear(): void {
    this.entries = []
    this.emit()
  }

  reset(): void {
    this.seq = 0
    this.entries = []
    this.emit()
  }

  subscribe(listener: PermissionLogListener): () => void {
    this.listeners.add(listener)
    listener(this.entries)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private emit(): void {
    for (const listener of this.listeners) {
      listener(this.entries)
    }
  }

  private logToConsole(entry: PermissionLogEntry): void {
    if (import.meta.env.MODE === 'test') {
      return
    }

    const prefix = formatPermissionLogPrefix(entry)
    if (entry.details) {
      console.log(prefix, entry.message, { ...entry.details })
      return
    }

    console.log(prefix, entry.message)
  }
}

export function formatPermissionLogPrefix(
  entry: Pick<PermissionLogEntry, 'seq' | 'layer' | 'event'>,
): string {
  return `[${permissionLogLayerLabels[entry.layer]}] ${entry.seq} ${entry.event}`
}

export const permissionLogger = new PermissionLogger()
