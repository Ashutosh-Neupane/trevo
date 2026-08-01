"use client";

import { useQuery } from "@tanstack/react-query";
import { frappeMethod } from "@/lib/frappe/client";
import { Button } from "@/components/shadcn/button";
import { Card } from "@/components/shadcn/card";
import { Badge } from "@/components/shadcn/badge";
import { Loader2 } from "lucide-react";

interface WorkflowState {
  state: string;
  label: string;
  color: string;
  allow_edit: number;
  is_current: number;
}

interface WorkflowAction {
  action: string;
  label: string;
  next_state: string;
  allowed: number;
}

interface WorkflowData {
  workflow_name: string;
  state: string;
  states: WorkflowState[];
  transitions: WorkflowAction[];
}

interface WorkflowActionsProps {
  doctype: string;
  name: string;
  currentState?: string;
  onAction?: (action: string, nextState: string) => void;
}

export function WorkflowActions({ doctype, name, currentState, onAction }: WorkflowActionsProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["workflow", doctype, name],
    queryFn: async () => {
      const result = await frappeMethod<WorkflowData>("frappe.model.get_workflow", {
        doctype,
        name,
      });
      return result;
    },
    enabled: !!doctype && !!name,
  });

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-center gap-2 text-sm text-zinc-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading workflow...
        </div>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="p-4 text-sm text-zinc-500">
        No workflow configured for this doctype.
      </Card>
    );
  }

  const current = data.states.find((s) => s.state === (currentState || data.state));
  const availableActions = data.transitions.filter((t) => t.allowed);

  return (
    <Card className="p-4">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Workflow: {data.workflow_name}</h3>
        {current && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-zinc-500">Current state:</span>
            <Badge style={{ backgroundColor: current.color }} className="text-white">
              {current.label || current.state}
            </Badge>
          </div>
        )}
      </div>

      {availableActions.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {availableActions.map((action) => (
            <Button
              key={action.action}
              size="sm"
              onClick={() => onAction?.(action.action, action.next_state)}
            >
              {action.label}
            </Button>
          ))}
        </div>
      ) : (
        <p className="text-xs text-zinc-400">No actions available in current state.</p>
      )}

      <div className="mt-4">
        <p className="text-xs font-medium text-zinc-500 mb-2">Workflow States</p>
        <div className="flex flex-wrap gap-1.5">
          {data.states.map((state) => (
            <div
              key={state.state}
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                state.is_current
                  ? "ring-2 ring-zinc-900 dark:ring-zinc-100"
                  : "opacity-60"
              }`}
              style={{ backgroundColor: state.color, color: "#fff" }}
            >
              {state.label || state.state}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
