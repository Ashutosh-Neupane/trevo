"use client";

import { useState } from "react";
import { Button } from "@/components/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/shadcn/dialog";

interface AssignToDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  docnames: string[];
  onAssign: (users: string[]) => Promise<void>;
}

export function AssignToDialog({
  open,
  onOpenChange,
  docnames,
  onAssign,
}: AssignToDialogProps) {
  const [userInput, setUserInput] = useState("");
  const [assignedUsers, setAssignedUsers] = useState<string[]>([]);
  const [assigning, setAssigning] = useState(false);

  const handleAddUser = () => {
    const email = userInput.trim();
    if (email && !assignedUsers.includes(email)) {
      setAssignedUsers([...assignedUsers, email]);
      setUserInput("");
    }
  };

  const handleRemoveUser = (email: string) => {
    setAssignedUsers(assignedUsers.filter((u) => u !== email));
  };

  const handleAssign = async () => {
    if (assignedUsers.length === 0) return;
    setAssigning(true);
    try {
      await onAssign(assignedUsers);
      onOpenChange(false);
      setAssignedUsers([]);
    } catch {
      // Error handled by parent
    } finally {
      setAssigning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Assign To — {docnames.length} {docnames.length === 1 ? "document" : "documents"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Assign these documents to one or more users.
          </p>

          {/* User input */}
          <div className="flex gap-2">
            <input
              type="email"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddUser();
                }
              }}
              placeholder="Enter user email..."
              className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
            <Button onClick={handleAddUser} variant="outline" size="sm">
              Add
            </Button>
          </div>

          {/* Assigned users list */}
          {assignedUsers.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Assigned Users ({assignedUsers.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {assignedUsers.map((email) => (
                  <span
                    key={email}
                    className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1 text-sm dark:bg-zinc-800"
                  >
                    {email}
                    <button
                      onClick={() => handleRemoveUser(email)}
                      className="ml-1 text-zinc-400 hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={assigning}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={assignedUsers.length === 0 || assigning}>
            {assigning ? "Assigning..." : `Assign to ${assignedUsers.length} user${assignedUsers.length !== 1 ? "s" : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

