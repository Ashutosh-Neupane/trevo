"use client";

import { useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { frappeMethod } from "@/lib/frappe/client";
import { Button } from "@/components/shadcn/button";
import { Bell, BellOff, Loader2 } from "lucide-react";

interface DocumentFollowProps {
  doctype: string;
  docname: string;
}

export function DocumentFollow({ doctype, docname }: DocumentFollowProps) {
  const { data: isFollowing, isLoading, refetch } = useQuery({
    queryKey: ["document-follow", doctype, docname],
    queryFn: async () => {
      try {
        const result = await frappeMethod<{ message: boolean }>("frappe.desk.form.document_follow.is_following", {
          doctype,
          name: docname,
        });
        return result?.message ?? false;
      } catch {
        return false;
      }
    },
    staleTime: 60_000,
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      return frappeMethod("frappe.desk.form.document_follow.follow_document", {
        doctype,
        name: docname,
      });
    },
    onSuccess: () => refetch(),
  });

  const unfollowMutation = useMutation({
    mutationFn: async () => {
      return frappeMethod("frappe.desk.form.document_follow.unfollow_document", {
        doctype,
        name: docname,
      });
    },
    onSuccess: () => refetch(),
  });

  const handleToggle = useCallback(() => {
    if (isFollowing) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
  }, [isFollowing, followMutation, unfollowMutation]);

  if (isLoading) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      disabled={followMutation.isPending || unfollowMutation.isPending}
      className="gap-1.5"
    >
      {followMutation.isPending || unfollowMutation.isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        <BellOff className="h-4 w-4" />
      ) : (
        <Bell className="h-4 w-4" />
      )}
      {isFollowing ? "Following" : "Follow"}
    </Button>
  );
}
