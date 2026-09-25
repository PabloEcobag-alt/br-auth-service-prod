import { UserForm } from "@/components/ui/UserForm";
import { toTitleCase } from "@/lib/utils";
import { CreateUserRequest, UserDetailDto, AppPermissionDto } from "@/lib/apiClient";
import { ActionResult } from "@/types/actions";

interface EditUserPageContainerProps {
  user: UserDetailDto | null;
  roles: string[];
  mergedApps: AppPermissionDto[];
  errorMsg?: string;
  onSubmitAction: (data: CreateUserRequest) => Promise<ActionResult>;
  onCheckEmailAction?: (email: string, excludeUserId?: string) => Promise<boolean>;
}

export function EditUserPageContainer({
  user,
  roles,
  mergedApps,
  errorMsg,
  onSubmitAction,
  onCheckEmailAction,
}: EditUserPageContainerProps) {
  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Edit User Profile & Permissions
        </h1>
        <p className="text-sm text-muted mt-1">
          Modify identification profile, update system access role, and tune security policies.
        </p>
      </div>

      {errorMsg || !user ? (
        <div className="rounded-lg bg-danger/10 p-4 text-sm text-danger border border-danger/20">
          {errorMsg || "User details could not be resolved."}
        </div>
      ) : (
        <UserForm
          roles={roles}
          initialApps={mergedApps}
          initialData={{
            firstName: toTitleCase(user.firstName),
            lastName: toTitleCase(user.lastName),
            email: user.email,
            role: user.role,
          }}
          userId={user.id}
          username={user.username}
          isEdit={true}
          onSubmitAction={onSubmitAction}
          onCheckEmailAction={onCheckEmailAction}
        />
      )}
    </div>
  );
}
