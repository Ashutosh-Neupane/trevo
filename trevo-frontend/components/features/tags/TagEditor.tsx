"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { frappeMethod } from "@/lib/frappe/client";
import { X, Plus, Tag } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { Card } from "@/components/shadcn/card";
import { Badge } from "@/components/shadcn/badge";

interface TagEditorProps {
  doctype: string;
  docname: string;
}

interface TagDoc {
  name: string;
  tag: string;
  parent?: string;
  idx?: number;
}

export function TagEditor({ doctype, docname }: TagEditorProps) {
  const [newTag, setNewTag] = useState("");
  const [adding, setAdding] = useState(false);

  const { data: tags = [], refetch } = useQuery({
    queryKey: ["tags", doctype, docname],
    queryFn: async () => {
      const result = await frappeMethod<TagDoc[]>("frappe.desk.form.load.get_tags", {
        doctype,
        name: docname,
      });
      return result ?? [];
    },
    staleTime: 30_000,
  });

  const addMutation = useMutation({
    mutationFn: async (tag: string) => {
      return frappeMethod("frappe.client.insert", {
        doc: {
          doctype: "Tag Link",
          tag,
          document_type: doctype,
          document_name: docname,
        },
      });
    },
    onSuccess: () => {
      refetch();
      setNewTag("");
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (tagName: string) => {
      const tagToRemove = tags.find((t) => t.tag === tagName);
      if (tagToRemove) {
        return frappeMethod("frappe.client.delete", {
          doctype: "Tag Link",
          name: tagToRemove.name,
        });
      }
    },
    onSuccess: () => refetch(),
  });

  const handleAddTag = useCallback(() => {
    const trimmed = newTag.trim();
    if (!trimmed) return;
    if (tags.some((t) => t.tag === trimmed)) {
      setNewTag("");
      return;
    }
    setAdding(true);
    addMutation.mutate(trimmed, {
      onSettled: () => setAdding(false),
    });
  }, [newTag, tags, addMutation]);

  const handleRemoveTag = useCallback((tagName: string) => {
    removeMutation.mutate(tagName);
  }, [removeMutation]);

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Tag className="h-4 w-4 text-zinc-500" />
        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Tags</h3>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {tags.length === 0 ? (
          <p className="text-xs text-zinc-500">No tags</p>
        ) : (
          tags.map((t) => (
            <Badge key={t.name} variant="secondary" className="gap-1">
              {t.tag}
              <button
                onClick={() => handleRemoveTag(t.tag)}
                className="ml-0.5 hover:text-red-500 transition-colors"
                aria-label={`Remove tag ${t.tag}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))
        )}
      </div>

      <div className="flex gap-2">
        <Input
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="Add tag..."
          className="h-8 text-xs"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddTag();
            }
          }}
          disabled={adding}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddTag}
          disabled={!newTag.trim() || adding}
          className="h-8"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </Card>
  );
}
