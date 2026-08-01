"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/shadcn/dialog";
import { Filter, Plus, X, Save, FolderOpen } from "lucide-react";
import type { FilterOperator } from "@/lib/frappe/types";

export interface FilterGroup {
  id: string;
  logic: "AND" | "OR";
  conditions: FilterCondition[];
}

export interface FilterCondition {
  id: string;
  fieldname: string;
  operator: FilterOperator;
  value: string;
  valueTo?: string;
}

export interface FilterDef {
  fieldname: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "link";
  options?: Array<{ value: string; label: string }>;
  operators?: FilterOperator[];
}

export interface SavedFilterLayout {
  id: string;
  name: string;
  doctype: string;
  groups: FilterGroup[];
  createdAt: string;
}

interface AdvancedFiltersProps {
  doctype: string;
  groups: FilterGroup[];
  availableFilters: FilterDef[];
  onGroupsChange: (groups: FilterGroup[]) => void;
  savedLayouts?: SavedFilterLayout[];
  onSaveLayout?: (name: string) => void;
  onLoadLayout?: (layout: SavedFilterLayout) => void;
}

const DEFAULT_OPERATORS: FilterOperator[] = ["like", "=", "!=", "is"];

const OPERATOR_LABELS: Record<FilterOperator, string> = {
  "=": "Equals",
  "!=": "Not Equals",
  ">": "Greater Than",
  "<": "Less Than",
  ">=": "Greater or Equal",
  "<=": "Less or Equal",
  like: "Contains",
  "not like": "Not Contains",
  Between: "Between",
  is: "Is",
  "in": "In",
  "not in": "Not In",
};

export function AdvancedFilters({
  groups,
  availableFilters,
  onGroupsChange,
  savedLayouts = [],
  onSaveLayout,
  onLoadLayout,
}: AdvancedFiltersProps) {
  const [open, setOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [localGroups, setLocalGroups] = useState<FilterGroup[]>(groups);

  // Sync local groups when groups prop changes
  const syncGroups = useCallback(() => {
    setLocalGroups(groups);
  }, [groups]);

  const handleOpen = () => {
    syncGroups();
    setOpen(true);
  };

  const generateId = () => Math.random().toString(36).substring(2, 10);

  const addGroup = () => {
    const newGroup: FilterGroup = {
      id: generateId(),
      logic: "AND",
      conditions: [
        {
          id: generateId(),
          fieldname: availableFilters[0]?.fieldname ?? "",
          operator: "like",
          value: "",
        },
      ],
    };
    setLocalGroups([...localGroups, newGroup]);
  };

  const removeGroup = (groupId: string) => {
    setLocalGroups(localGroups.filter((g) => g.id !== groupId));
  };

  const addCondition = (groupId: string) => {
    setLocalGroups(
      localGroups.map((g) =>
        g.id === groupId
          ? {
              ...g,
              conditions: [
                ...g.conditions,
                {
                  id: generateId(),
                  fieldname: availableFilters[0]?.fieldname ?? "",
                  operator: "like" as FilterOperator,
                  value: "",
                },
              ],
            }
          : g,
      ),
    );
  };

  const removeCondition = (groupId: string, conditionId: string) => {
    setLocalGroups(
      localGroups.map((g) =>
        g.id === groupId
          ? {
              ...g,
              conditions: g.conditions.filter((c) => c.id !== conditionId),
            }
          : g,
      ),
    );
  };

  const updateCondition = (
    groupId: string,
    conditionId: string,
    updates: Partial<FilterCondition>,
  ) => {
    setLocalGroups(
      localGroups.map((g) =>
        g.id === groupId
          ? {
              ...g,
              conditions: g.conditions.map((c) =>
                c.id === conditionId ? { ...c, ...updates } : c,
              ),
            }
          : g,
      ),
    );
  };

  const toggleGroupLogic = (groupId: string) => {
    setLocalGroups(
      localGroups.map((g) =>
        g.id === groupId
          ? { ...g, logic: g.logic === "AND" ? "OR" : "AND" }
          : g,
      ),
    );
  };

  const handleApply = () => {
    onGroupsChange(localGroups);
    setOpen(false);
  };

  const handleSave = () => {
    if (saveName.trim() && onSaveLayout) {
      onSaveLayout(saveName.trim());
      setSaveName("");
      setSaveDialogOpen(false);
    }
  };

  const handleLoad = (layout: SavedFilterLayout) => {
    if (onLoadLayout) {
      onLoadLayout(layout);
    }
    setLoadDialogOpen(false);
    setOpen(false);
  };

  const getFieldOperators = (fieldname: string): FilterOperator[] => {
    const field = availableFilters.find((f) => f.fieldname === fieldname);
    return field?.operators ?? DEFAULT_OPERATORS;
  };

  const getFieldType = (fieldname: string): string => {
    return availableFilters.find((f) => f.fieldname === fieldname)?.type ?? "text";
  };

  const getFieldOptions = (fieldname: string) => {
    return availableFilters.find((f) => f.fieldname === fieldname)?.options;
  };

  const activeFilterCount = groups.reduce(
    (count, g) => count + g.conditions.filter((c) => c.value).length,
    0,
  );

  return (
    <>
      {/* Filter trigger button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleOpen}
        className="gap-1.5"
      >
        <Filter className="h-4 w-4" />
        Filters
        {activeFilterCount > 0 && (
          <span className="ml-1 rounded-full bg-zinc-900 px-1.5 py-0.5 text-xs text-white dark:bg-zinc-100 dark:text-zinc-900">
            {activeFilterCount}
          </span>
        )}
      </Button>

      {/* Main filter dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Advanced Filters</DialogTitle>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSaveDialogOpen(true)}
                  title="Save filter layout"
                >
                  <Save className="h-4 w-4" />
                </Button>
                {savedLayouts.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLoadDialogOpen(true)}
                    title="Load saved layout"
                  >
                    <FolderOpen className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            {localGroups.length === 0 && (
              <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
                <p className="text-sm text-zinc-500">No filters applied</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addGroup}
                  className="mt-2"
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Add Filter
                </Button>
              </div>
            )}

            {localGroups.map((group, groupIndex) => (
              <div
                key={group.id}
                className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700"
              >
                {/* Group header */}
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-zinc-500">
                      Group {groupIndex + 1}
                    </span>
                    <button
                      onClick={() => toggleGroupLogic(group.id)}
                      className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                        group.logic === "AND"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                      }`}
                    >
                      {group.logic}
                    </button>
                    <span className="text-xs text-zinc-400">
                      (click to toggle)
                    </span>
                  </div>
                  <button
                    onClick={() => removeGroup(group.id)}
                    className="text-zinc-400 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Conditions */}
                <div className="space-y-2">
                  {group.conditions.map((condition, condIndex) => (
                    <div
                      key={condition.id}
                      className="flex items-center gap-2"
                    >
                      {condIndex > 0 && (
                        <span className="w-8 text-center text-xs font-medium text-zinc-400">
                          {group.logic}
                        </span>
                      )}
                      {/* Field selector */}
                      <select
                        value={condition.fieldname}
                        onChange={(e) =>
                          updateCondition(group.id, condition.id, {
                            fieldname: e.target.value,
                            operator: "like",
                            value: "",
                          })
                        }
                        className="flex-1 rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      >
                        <option value="">Select field...</option>
                        {availableFilters.map((f) => (
                          <option key={f.fieldname} value={f.fieldname}>
                            {f.label}
                          </option>
                        ))}
                      </select>

                      {/* Operator selector */}
                      <select
                        value={condition.operator}
                        onChange={(e) =>
                          updateCondition(group.id, condition.id, {
                            operator: e.target.value as FilterOperator,
                          })
                        }
                        className="w-32 rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      >
                        {getFieldOperators(condition.fieldname).map((op) => (
                          <option key={op} value={op}>
                            {OPERATOR_LABELS[op] ?? op}
                          </option>
                        ))}
                      </select>

                      {/* Value input */}
                      {condition.operator === "Between" ? (
                        <div className="flex items-center gap-1">
                          <input
                            type={getFieldType(condition.fieldname) === "date" ? "date" : "text"}
                            value={condition.value}
                            onChange={(e) =>
                              updateCondition(group.id, condition.id, {
                                value: e.target.value,
                              })
                            }
                            placeholder="From"
                            className="w-28 rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                          />
                          <span className="text-zinc-400">to</span>
                          <input
                            type={getFieldType(condition.fieldname) === "date" ? "date" : "text"}
                            value={condition.valueTo ?? ""}
                            onChange={(e) =>
                              updateCondition(group.id, condition.id, {
                                valueTo: e.target.value,
                              })
                            }
                            placeholder="To"
                            className="w-28 rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                          />
                        </div>
                      ) : getFieldType(condition.fieldname) === "select" && getFieldOptions(condition.fieldname) ? (
                        <select
                          value={condition.value}
                          onChange={(e) =>
                            updateCondition(group.id, condition.id, {
                              value: e.target.value,
                            })
                          }
                          className="w-36 rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                        >
                          <option value="">Select...</option>
                          {getFieldOptions(condition.fieldname)?.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={getFieldType(condition.fieldname) === "date" ? "date" : getFieldType(condition.fieldname) === "number" ? "number" : "text"}
                          value={condition.value}
                          onChange={(e) =>
                            updateCondition(group.id, condition.id, {
                              value: e.target.value,
                            })
                          }
                          placeholder="Value"
                          className="flex-1 rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                        />
                      )}

                      {/* Remove condition */}
                      <button
                        onClick={() =>
                          removeCondition(group.id, condition.id)
                        }
                        className="text-zinc-400 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add condition */}
                <button
                  onClick={() => addCondition(group.id)}
                  className="mt-2 flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                >
                  <Plus className="h-3 w-3" />
                  Add condition
                </button>
              </div>
            ))}

            {/* Add group */}
            {localGroups.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={addGroup}
                className="w-full"
              >
                <Plus className="mr-1 h-4 w-4" />
                Add Filter Group
              </Button>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApply}>
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save filter layout dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Filter Layout</DialogTitle>
          </DialogHeader>
          <input
            type="text"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            placeholder="Layout name..."
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
            }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!saveName.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Load filter layout dialog */}
      <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Load Saved Layout</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {savedLayouts.length === 0 ? (
              <p className="text-sm text-zinc-500">No saved layouts</p>
            ) : (
              savedLayouts.map((layout) => (
                <button
                  key={layout.id}
                  onClick={() => handleLoad(layout)}
                  className="w-full rounded-lg border border-zinc-200 p-3 text-left text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                >
                  <div className="font-medium text-zinc-900 dark:text-zinc-100">
                    {layout.name}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {layout.groups.reduce(
                      (count, g) => count + g.conditions.length,
                      0,
                    )}{" "}
                    conditions
                  </div>
                </button>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLoadDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Note: interface uses fields from the props type above
export type { AdvancedFiltersProps };
