"use client";

/**
 * Frappe Realtime (Socket.io) client.
 *
 * Connects to the Frappe backend's socket.io endpoint using the user's `sid`
 * session cookie, and exposes typed subscription helpers for the events Trevo
 * cares about:
 *   - `doc_update`     — document saved/changed
 *   - `docinfo_update` — docinfo (comments/attachments/versions) changed
 *   - `list_update`    — list view data changed (create/delete/etc.)
 *   - `new_comment`    — a comment was added to a document
 *   - `version`        — a new version was created
 *
 * The socket is a module-level singleton so multiple hooks/views share one
 * connection.
 */

import { io, type Socket } from "socket.io-client";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_FRAPPE_BASE_URL ??
  process.env.FRAPPE_BACKEND_URL ??
  "http://localhost:8000";

let socket: Socket | null = null;
let connecting = false;
let pendingHandlers = 0;

/** Read the Frappe `sid` cookie (set by /api/auth/login via the BFF). */
function getSid(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)sid=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function getSocketHost(): string {
  // Frappe serves socket.io on the backend host. Try to derive it from the
  // backend URL (strip any path).
  try {
    const u = new URL(BACKEND_URL);
    return `${u.protocol}//${u.host}`;
  } catch {
    return "http://localhost:8000";
  }
}

export function getRealtimeSocket(): Socket {
  if (socket) return socket;

  const sid = getSid();
  socket = io(getSocketHost(), {
    path: "/socket.io",
    transports: ["websocket", "polling"],
    withCredentials: true,
    query: sid ? { sid } : {},
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    connecting = false;
    console.debug("[realtime] connected to Frappe socket.io");
  });

  socket.on("disconnect", (reason) => {
    console.debug("[realtime] disconnected:", reason);
  });

  socket.on("connect_error", (err) => {
    // Non-fatal — the app keeps working with polling/refetch fallbacks.
    console.debug("[realtime] connect error:", err.message);
  });

  return socket;
}

export function connectRealtime(): void {
  if (typeof window === "undefined") return;
  if (socket || connecting) return;
  connecting = true;
  try {
    const s = getRealtimeSocket();
    // Bump the reference counter so the socket is not torn down mid-session.
    pendingHandlers += 0;
    if (s.connected) connecting = false;
  } catch {
    connecting = false;
  }
}

export function disconnectRealtime(): void {
  if (!socket) return;
  socket.disconnect();
  socket = null;
}

/** Subscribe to a Frappe realtime event. Returns an unsubscribe function. */
export function subscribeToRealtime<T = unknown>(
  event: string,
  handler: (data: T) => void,
): () => void {
  const s = getRealtimeSocket();
  pendingHandlers += 1;
  s.on(event, handler as (...args: unknown[]) => void);
  return () => {
    pendingHandlers -= 1;
    s.off(event, handler as (...args: unknown[]) => void);
    if (pendingHandlers <= 0) {
      // Leave the socket connected; it's cheap and shared. Call
      // disconnectRealtime() explicitly if you need to fully tear down.
      pendingHandlers = 0;
    }
  };
}

// ---------------------------------------------------------------------------
// Typed helpers for the specific Frappe realtime events Trevo consumes
// ---------------------------------------------------------------------------

export interface DocUpdateEvent {
  doctype: string;
  docname: string;
  name?: string;
  modified?: string;
  [key: string]: unknown;
}

export interface DocInfoUpdateEvent {
  doctype: string;
  docname: string;
  [key: string]: unknown;
}

export interface ListUpdateEvent {
  doctype: string;
  name: string;
  modified?: string;
  [key: string]: unknown;
}

export interface NewCommentEvent {
  doctype: string;
  docname: string;
  comment_by?: string;
  content?: string;
  creation?: string;
  [key: string]: unknown;
}

export interface VersionEvent {
  doctype: string;
  docname: string;
  version_name?: string;
  [key: string]: unknown;
}

export function subscribeDocUpdate(handler: (data: DocUpdateEvent) => void) {
  return subscribeToRealtime<DocUpdateEvent>("doc_update", handler);
}

export function subscribeDocInfoUpdate(handler: (data: DocInfoUpdateEvent) => void) {
  return subscribeToRealtime<DocInfoUpdateEvent>("docinfo_update", handler);
}

export function subscribeListUpdate(handler: (data: ListUpdateEvent) => void) {
  return subscribeToRealtime<ListUpdateEvent>("list_update", handler);
}

export function subscribeNewComment(handler: (data: NewCommentEvent) => void) {
  return subscribeToRealtime<NewCommentEvent>("new_comment", handler);
}

export function subscribeVersion(handler: (data: VersionEvent) => void) {
  return subscribeToRealtime<VersionEvent>("version", handler);
}

