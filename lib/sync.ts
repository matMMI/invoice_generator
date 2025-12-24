"use client";

/**
 * Cross-tab synchronization using BroadcastChannel API
 * When a CRUD operation happens, this broadcasts to all tabs
 * so they can refresh their data.
 */

const CHANNEL_NAME = "devis-sync";

type SyncMessage = {
  type:
    | "quote_created"
    | "quote_updated"
    | "quote_deleted"
    | "client_created"
    | "client_updated"
    | "client_deleted"
    | "refresh_all";
  id?: string;
  timestamp: number;
};

let channel: BroadcastChannel | null = null;

// Initialize channel (client-side only)
function getChannel(): BroadcastChannel | null {
  if (typeof window === "undefined") return null;
  if (typeof BroadcastChannel === "undefined") return null;
  if (!channel) {
    channel = new BroadcastChannel(CHANNEL_NAME);
  }
  return channel;
}

/**
 * Broadcast a sync message to all tabs
 */
export function broadcastSync(type: SyncMessage["type"], id?: string) {
  const ch = getChannel();
  if (ch) {
    const message: SyncMessage = {
      type,
      id,
      timestamp: Date.now(),
    };
    ch.postMessage(message);
  }
}

/**
 * Subscribe to sync messages from other tabs
 * Returns an unsubscribe function
 */
export function onSyncMessage(
  callback: (message: SyncMessage) => void
): () => void {
  const ch = getChannel();
  if (!ch) return () => {};

  const handler = (event: MessageEvent<SyncMessage>) => {
    callback(event.data);
  };

  ch.addEventListener("message", handler);

  return () => {
    ch.removeEventListener("message", handler);
  };
}
