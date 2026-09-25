"use client";

import { useState, useMemo } from "react";
import { AppPermissionDto, ModulePermissionDto } from "@/lib/apiClient";
import { Checkbox } from "@/lib/ui/components/checkbox";
import { Label } from "@/lib/ui/components/label";
import { Check } from "lucide-react";

interface PermissionsEditorProps {
  apps: AppPermissionDto[];
  onChange: (updatedApps: AppPermissionDto[]) => void;
}

function computeInitialState(apps: AppPermissionDto[]) {
  const appEnabled: Record<string, boolean> = {};
  const moduleEnabled: Record<string, boolean> = {};
  const expandedApps: Record<string, boolean> = {};

  apps.forEach((app) => {
    let isAnyAppModuleEnabled = false;

    app.modules.forEach((mod) => {
      const hasAnyPermission =
        mod.canRead ||
        mod.canWrite ||
        mod.canUpdate ||
        mod.canDelete ||
        mod.canApprove ||
        mod.canExport;

      const modKey = `${app.appName}::${mod.moduleName}`;
      moduleEnabled[modKey] = hasAnyPermission;
      if (hasAnyPermission) {
        isAnyAppModuleEnabled = true;
      }
    });

    appEnabled[app.appName] = isAnyAppModuleEnabled;
    if (isAnyAppModuleEnabled) {
      expandedApps[app.appName] = true;
    }
  });

  return { appEnabled, moduleEnabled, expandedApps };
}

export function PermissionsEditor({ apps, onChange }: PermissionsEditorProps) {
  const initialState = useMemo(() => computeInitialState(apps), [apps]);

  const [expandedApps, setExpandedApps] = useState<Record<string, boolean>>(initialState.expandedApps);
  const [appEnabled, setAppEnabled] = useState<Record<string, boolean>>(initialState.appEnabled);
  const [moduleEnabled, setModuleEnabled] = useState<Record<string, boolean>>(initialState.moduleEnabled);

  const toggleAppExpansion = (appName: string) => {
    setExpandedApps((prev) => ({ ...prev, [appName]: !prev[appName] }));
  };

  const handleAppToggle = (appName: string, enabled: boolean) => {
    setAppEnabled((prev) => ({ ...prev, [appName]: enabled }));
    if (enabled) {
      setExpandedApps((prev) => ({ ...prev, [appName]: true }));
    }

    const updated = JSON.parse(JSON.stringify(apps)) as AppPermissionDto[];
    const targetApp = updated.find((a) => a.appName === appName);

    if (targetApp && !enabled) {
      // Disabling app: wipe all permissions for all its modules
      targetApp.modules.forEach((mod) => {
        mod.canRead = false;
        mod.canWrite = false;
        mod.canUpdate = false;
        mod.canDelete = false;
        mod.canApprove = false;
        mod.canExport = false;

        const modKey = `${appName}::${mod.moduleName}`;
        setModuleEnabled((prev) => ({ ...prev, [modKey]: false }));
      });
      onChange(updated);
    }
  };

  const handleModuleToggle = (appName: string, moduleName: string, enabled: boolean) => {
    const modKey = `${appName}::${moduleName}`;
    setModuleEnabled((prev) => ({ ...prev, [modKey]: enabled }));

    const updated = JSON.parse(JSON.stringify(apps)) as AppPermissionDto[];
    const targetApp = updated.find((a) => a.appName === appName);
    if (!targetApp) return;

    const targetMod = targetApp.modules.find((m) => m.moduleName === moduleName);
    if (!targetMod) return;

    if (enabled) {
      // Enabling module: default to canRead = true as basic access requirement
      targetMod.canRead = true;
    } else {
      // Disabling module: clear all permissions
      targetMod.canRead = false;
      targetMod.canWrite = false;
      targetMod.canUpdate = false;
      targetMod.canDelete = false;
      targetMod.canApprove = false;
      targetMod.canExport = false;
    }

    // Update parent state
    onChange(updated);
  };

  const handlePermissionChange = (
    appName: string,
    moduleName: string,
    permissionKey: keyof Omit<ModulePermissionDto, "moduleName">,
    value: boolean
  ) => {
    const updated = JSON.parse(JSON.stringify(apps)) as AppPermissionDto[];
    const targetApp = updated.find((a) => a.appName === appName);
    if (!targetApp) return;

    const targetMod = targetApp.modules.find((m) => m.moduleName === moduleName);
    if (!targetMod) return;

    targetMod[permissionKey] = value;

    // If all permissions are now unchecked, toggle module off
    const hasAnyPermission =
      targetMod.canRead ||
      targetMod.canWrite ||
      targetMod.canUpdate ||
      targetMod.canDelete ||
      targetMod.canApprove ||
      targetMod.canExport;

    const modKey = `${appName}::${moduleName}`;
    if (!hasAnyPermission) {
      setModuleEnabled((prev) => ({ ...prev, [modKey]: false }));
    } else {
      setModuleEnabled((prev) => ({ ...prev, [modKey]: true }));
    }

    onChange(updated);
  };

  const permissionLabels: { key: keyof Omit<ModulePermissionDto, "moduleName">; label: string }[] = [
    { key: "canRead", label: "Read" },
    { key: "canWrite", label: "Write" },
    { key: "canUpdate", label: "Update" },
    { key: "canDelete", label: "Delete" },
    { key: "canApprove", label: "Approve" },
    { key: "canExport", label: "Export" },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-2">
        <h3 className="text-lg font-bold text-on-surface">Granular Module Permissions</h3>
        <p className="text-sm text-secondary mt-0.5">
          Select apps and modules to assign access permissions.
        </p>
      </div>

      <div className="space-y-4">
        {apps.map((app) => {
          const isAppEnabled = appEnabled[app.appName] || false;
          const isExpanded = expandedApps[app.appName] || false;

          return (
            <div
              key={app.appName}
              className={`rounded-xl border transition-all duration-200 ${
                isAppEnabled
                  ? "border-primary/30 bg-surface-container-lowest shadow-2xs"
                  : "border-border bg-surface-container-low/50 opacity-80"
              }`}
            >
              {/* Level 1: App Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id={`app-toggle-${app.appName}`}
                    checked={isAppEnabled}
                    onCheckedChange={(checked) =>
                      handleAppToggle(app.appName, checked as boolean)
                    }
                    className="h-5 w-5"
                  />
                  <Label
                    htmlFor={`app-toggle-${app.appName}`}
                    className="text-base font-bold text-on-surface hover:text-primary transition-colors cursor-pointer"
                  >
                    {app.appName} System Access
                  </Label>
                </div>

                {isAppEnabled && (
                  <button
                    type="button"
                    onClick={() => toggleAppExpansion(app.appName)}
                    className="text-sm font-semibold text-primary hover:underline cursor-pointer"
                  >
                    {isExpanded ? "Collapse Modules ▴" : "Expand Modules ▾"}
                  </button>
                )}
              </div>

              {/* Level 2 & 3: Modules & Permissions */}
              {isAppEnabled && isExpanded && (
                <div className="px-6 py-4 space-y-6 divide-y divide-border">
                  {app.modules.map((module) => {
                    const modKey = `${app.appName}::${module.moduleName}`;
                    const isModEnabled = moduleEnabled[modKey] || false;

                    return (
                      <div
                        key={module.moduleName}
                        className="pt-6 first:pt-0 grid grid-cols-1 md:grid-cols-3 gap-4"
                      >
                        {/* Level 2: Module toggle */}
                        <div className="flex items-start space-x-3 pt-1">
                          <Checkbox
                            id={`mod-toggle-${modKey}`}
                            checked={isModEnabled}
                            onCheckedChange={(checked) =>
                              handleModuleToggle(app.appName, module.moduleName, checked as boolean)
                            }
                            className="mt-0.5"
                          />
                          <div className="space-y-0.5">
                            <Label
                              htmlFor={`mod-toggle-${modKey}`}
                              className="text-base font-semibold text-on-surface cursor-pointer"
                            >
                              {module.moduleName}
                            </Label>
                            <p className="text-xs text-secondary">
                              Authorize features inside {module.moduleName} module.
                            </p>
                          </div>
                        </div>

                        {/* Level 3: Permissions checkboxes */}
                        <div className="md:col-span-2">
                          {isModEnabled ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {permissionLabels.map((perm) => (
                                <Label
                                  key={perm.key}
                                  htmlFor={`perm-${modKey}-${perm.key}`}
                                  className={`flex items-center space-x-2 rounded-lg border p-3 text-sm transition-colors cursor-pointer select-none ${
                                    module[perm.key]
                                      ? "bg-primary/5 border-primary/30 text-on-surface font-medium"
                                      : "border-border hover:bg-surface-container-low text-secondary"
                                  }`}
                                >
                                  <Checkbox
                                    id={`perm-${modKey}-${perm.key}`}
                                    checked={module[perm.key]}
                                    onCheckedChange={(checked) =>
                                      handlePermissionChange(
                                        app.appName,
                                        module.moduleName,
                                        perm.key,
                                        checked as boolean
                                      )
                                    }
                                  />
                                  <span>{perm.label}</span>
                                  {module[perm.key] && (
                                    <Check className="ml-auto h-4 w-4 text-primary shrink-0" />
                                  )}
                                </Label>
                              ))}
                            </div>
                          ) : (
                            <div className="h-full flex items-center text-sm text-secondary italic bg-surface-container-low/50 rounded-lg p-3 border border-dashed border-border">
                              Toggle the module on to configure access actions.
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
