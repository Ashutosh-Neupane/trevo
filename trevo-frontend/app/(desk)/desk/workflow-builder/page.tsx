"use client";

import { WorkflowBuilder } from "@/components/features/workflow-builder";

export default function WorkflowBuilderPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Workflow Builder</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Design and manage workflows
        </p>
      </div>
      <WorkflowBuilder />
    </div>
  );
}
