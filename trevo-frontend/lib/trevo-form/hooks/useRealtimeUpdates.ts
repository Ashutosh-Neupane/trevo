"use client";

import { useEffect } from "react";

/**
 * Real-time updates hook — subscribes to Frappe realtime events.
 * Updates the form when changes are made by other users.
 */
export function useRealtimeUpdates({
  doctype,
  docname,
  onUpdate,
  onComment,
  onVersion,
}: {
  doctype?: string;
  docname?: string;
  onUpdate?: (data: unknown) => void;
  onComment?: (data: unknown) => void;
  onVersion?: (data: unknown) => void;
}) {
  useEffect(() => {
    if (!doctype || !docname) return;

    // In a real implementation, this would use Socket.io or WebSocket
    // to listen for Frappe realtime events:
    // - `list_update` — when the list view changes
    // - `docinfo_update` — when doc info changes
    // - `new_comment` — when a comment is added
    // - `version` — when a new version is created
    //
    // For now, we'll set up the infrastructure:
    const rooms = [`doctype:${doctype}`, `doc:${doctype}:${docname}`];

    // Simulated subscription (replace with real Socket.io client)
    // frappe.realtime.on('docinfo_update', (data) => {
    //   if (data.doctype === doctype && data.docname === docname) {
    //     onUpdate?.(data);
    //   }
    // });

    return () => {
      // Cleanup subscriptions
      // rooms.forEach(room => frappe.realtime.off(room));
    };
  }, [doctype, docname, onUpdate, onComment, onVersion]);
}
