import { UserForm } from "@/components/ui/UserForm";
import { CreateUserRequest, AppPermissionDto } from "@/lib/apiClient";
import { ActionResult } from "@/types/actions";

interface NewUserPageContainerProps {
  roles: string[];
  apps: AppPermissionDto[];
  errorMsg?: string;
  onSubmitAction: (data: CreateUserRequest) => Promise<ActionResult>;
  onCheckEmailAction?: (email: string, excludeUserId?: string) => Promise<boolean>;
}

export function NewUserPageContainer({
  roles,
  apps,
  errorMsg,
  onSubmitAction,
  onCheckEmailAction,
}: NewUserPageContainerProps) {
  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Register New User Account
        </h1>
        <p className="text-sm text-muted mt-1">
          Add a new employee to the central identity directory and configure initial access privileges.
        </p>
      </div>

      {errorMsg ? (
        <div className="rounded-lg bg-danger/10 p-4 text-sm text-danger border border-danger/20">
          {errorMsg}
        </div>
      ) : (
        <UserForm
          roles={roles}
          initialApps={apps}
          onSubmitAction={onSubmitAction}
          onCheckEmailAction={onCheckEmailAction}
        />
      )}
    </div>
  );
}
