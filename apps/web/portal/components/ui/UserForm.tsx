"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AppPermissionDto, CreateUserRequest } from "@/lib/apiClient";
import { ActionResult } from "@/types/actions";
import { toTitleCase } from "@/lib/utils";
import { useUserFormValidation } from "@/hooks/useUserFormValidation";
import { PermissionsEditor } from "./PermissionsEditor";
import { ConfirmationModal } from "./ConfirmationModal";
import { Input } from "@/lib/ui/components/input";
import { Button } from "@/lib/ui/components/button";
import { Label } from "@/lib/ui/components/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/lib/ui/components/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/lib/ui/components/select";

interface UserFormProps {
  roles: string[];
  initialApps: AppPermissionDto[];
  initialData?: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  userId?: string;
  username?: string;
  isEdit?: boolean;
  onSubmitAction: (data: CreateUserRequest) => Promise<ActionResult>;
  onCheckEmailAction?: (email: string, excludeUserId?: string) => Promise<boolean>;
}

export function UserForm({
  roles,
  initialApps,
  initialData,
  userId,
  username,
  isEdit = false,
  onSubmitAction,
  onCheckEmailAction,
}: UserFormProps) {
  const router = useRouter();
  const filteredRoles = roles.filter((r) => r.toLowerCase() !== "superadmin");
  const [firstName, setFirstName] = useState(initialData?.firstName ?? "");
  const [lastName, setLastName] = useState(initialData?.lastName ?? "");
  const [email, setEmail] = useState(initialData?.email ?? "");
  const [role, setRole] = useState(initialData?.role ?? filteredRoles[0] ?? "");
  const [apps, setApps] = useState<AppPermissionDto[]>(initialApps);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const {
    fieldErrors,
    checkingEmail,
    hasErrors,
    clearFieldError,
    handleBlur,
    validateAllFields,
    checkEmailBeforeSubmit,
  } = useUserFormValidation({ isEdit, userId, onCheckEmailAction });

  const hasChanges = useMemo(() => {
    if (!isEdit) return true;
    const profileChanged =
      firstName !== (initialData?.firstName ?? "") ||
      lastName !== (initialData?.lastName ?? "") ||
      email !== (initialData?.email ?? "") ||
      role !== (initialData?.role ?? "");
    if (profileChanged) return true;
    return JSON.stringify(apps) !== JSON.stringify(initialApps);
  }, [firstName, lastName, email, role, apps, initialData, initialApps, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAllFields({ firstName, lastName, email, role })) return;
    const emailTaken = await checkEmailBeforeSubmit(email);
    if (emailTaken) return;
    setShowConfirm(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirm(false);
    setLoading(true);
    setErrorMsg("");

    try {
      const result = await onSubmitAction({
        firstName: toTitleCase(firstName),
        lastName: toTitleCase(lastName),
        email,
        role,
        apps,
      });

      if (result.success) {
        toast.success(
          isEdit ? "User updated successfully." : "User created successfully."
        );
        router.push("/admin/users");
      } else {
        const message = result.error ?? "An unexpected error occurred.";
        setErrorMsg(message);
        toast.error(isEdit ? "Failed to update user." : "Failed to create user.", {
          description: message,
        });
        setLoading(false);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to submit user form.";
      setErrorMsg(message);
      toast.error(isEdit ? "Failed to update user." : "Failed to create user.", {
        description: message,
      });
      setLoading(false);
    }
  };

  const handleCancelClick = () => {
    if (hasChanges) {
      setShowCancelConfirm(true);
    } else {
      router.push("/admin/users");
    }
  };

  const handleConfirmCancel = () => {
    setShowCancelConfirm(false);
    router.push("/admin/users");
  };

  const inputErrorClass = (field: string) =>
    fieldErrors[field]
      ? "border-danger focus-visible:border-danger focus-visible:ring-danger/10"
      : "border-border focus-visible:border-primary focus-visible:ring-primary/10";

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {errorMsg && (
        <div className="rounded-lg bg-error-container p-4 text-sm text-on-error-container border border-error/20">
          {errorMsg}
        </div>
      )}

      {/* Profile Section */}
      <Card className="bg-surface-container-lowest border-border">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-lg font-bold text-on-surface">
            User Profile
          </CardTitle>
          <CardDescription className="text-sm text-secondary">
            Account identity details and login configuration.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {isEdit && username && (
              <div className="sm:col-span-2 space-y-2">
                <Label className="text-sm font-medium text-secondary uppercase tracking-wider">
                  Generated Employee ID (Username)
                </Label>
                <Input
                  type="text"
                  value={username}
                  readOnly
                  className="font-mono text-secondary bg-surface-container-low border-border"
                />
              </div>
            )}

            {/* First Name */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-secondary uppercase tracking-wider">
                First Name <span className="text-danger">*</span>
              </Label>
              <Input
                type="text"
                value={firstName}
                onChange={(e) => { setFirstName(e.target.value); clearFieldError("firstName"); }}
                onBlur={() => handleBlur("firstName", firstName)}
                placeholder="e.g. Jane"
                className={`bg-surface-container-lowest ${inputErrorClass("firstName")}`}
              />
              {fieldErrors.firstName && (
                <p className="text-xs text-danger mt-1">{fieldErrors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-secondary uppercase tracking-wider">
                Last Name <span className="text-danger">*</span>
              </Label>
              <Input
                type="text"
                value={lastName}
                onChange={(e) => { setLastName(e.target.value); clearFieldError("lastName"); }}
                onBlur={() => handleBlur("lastName", lastName)}
                placeholder="e.g. Doe"
                className={`bg-surface-container-lowest ${inputErrorClass("lastName")}`}
              />
              {fieldErrors.lastName && (
                <p className="text-xs text-danger mt-1">{fieldErrors.lastName}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-secondary uppercase tracking-wider">
                Email Address <span className="text-danger">*</span>
              </Label>
              <div className="relative">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearFieldError("email"); }}
                  onBlur={() => handleBlur("email", email)}
                  placeholder="e.g. jane.doe@company.com"
                  className={`bg-surface-container-lowest ${inputErrorClass("email")}`}
                />
                {checkingEmail && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-secondary">
                    Checking…
                  </span>
                )}
              </div>
              {fieldErrors.email && (
                <p className="text-xs text-danger mt-1">{fieldErrors.email}</p>
              )}
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-secondary uppercase tracking-wider">
                System Access Role <span className="text-danger">*</span>
              </Label>
              <Select
                value={role}
                onValueChange={(v) => { setRole(v); clearFieldError("role"); }}
              >
                <SelectTrigger className={`w-full bg-surface-container-lowest ${inputErrorClass("role")}`}>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  className="w-[var(--radix-select-trigger-width)] bg-surface-container-lowest border-border"
                >
                  {filteredRoles.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.role && (
                <p className="text-xs text-danger mt-1">{fieldErrors.role}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permissions Section */}
      <PermissionsEditor apps={apps} onChange={setApps} />

      {/* Actions */}
      <div className="flex items-center justify-end space-x-4 border-t border-border pt-6">
        <Button type="button" variant="outline" onClick={handleCancelClick}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading || !hasChanges || hasErrors || checkingEmail}
        >
          {loading ? "Saving..." : isEdit ? "Update User" : "Create User"}
        </Button>
      </div>

      {/* Submit Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmSubmit}
        title={isEdit ? "Confirm User Update" : "Confirm User Creation"}
        description={
          isEdit
            ? "Are you sure you want to update this user's profile and permissions?"
            : "Are you sure you want to create this new user account?"
        }
        confirmText={isEdit ? "Update" : "Create"}
        confirmVariant="default"
      />

      {/* Cancel Confirmation Modal */}
      <ConfirmationModal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={handleConfirmCancel}
        title="Discard Changes"
        description="You have unsaved changes. Are you sure you want to leave? Your changes will be lost."
        confirmText="Discard"
        confirmVariant="destructive"
      />
    </form>
  );
}
