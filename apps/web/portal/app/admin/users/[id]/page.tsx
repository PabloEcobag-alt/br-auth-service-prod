import { auth } from "@/auth";
import { getApps, getRoles, getUser, updateUser, checkEmailExists, CreateUserRequest, UserDetailDto, AppPermissionDto, ModulePermissionDto } from "@/lib/apiClient";
import { revalidatePath } from "next/cache";
import { EditUserPageContainer } from "@/components/users/EditUserPageContainer";
import { ActionResult } from "@/types/actions";
import { userFormSchema } from "@/lib/validation/userFormSchema";

export const dynamic = "force-dynamic";

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditUserPage({ params }: EditPageProps) {
  const { id } = await params;
  const session = await auth();
  const token = session?.accessToken ?? "";

  let user: UserDetailDto | null = null;
  let roles: string[] = [];
  let mergedApps: AppPermissionDto[] = [];
  let errorMsg = "";

  try {
    const [userData, rolesData, allApps] = await Promise.all([
      getUser(token, id),
      getRoles(token),
      getApps(token),
    ]);

    user = userData;
    roles = rolesData.filter((r) => r.toLowerCase() !== "superadmin");

    // Merge global apps list with user's specific configured permissions
    mergedApps = allApps.map((allApp) => {
      const userApp = user?.apps?.find((ua: AppPermissionDto) => ua.appName === allApp.appName);
      return {
        appName: allApp.appName,
        modules: allApp.modules.map((allMod: ModulePermissionDto) => {
          const userMod = userApp?.modules?.find(
            (um: ModulePermissionDto) => um.moduleName === allMod.moduleName
          );
          return {
            moduleName: allMod.moduleName,
            canRead: userMod?.canRead ?? false,
            canWrite: userMod?.canWrite ?? false,
            canUpdate: userMod?.canUpdate ?? false,
            canDelete: userMod?.canDelete ?? false,
            canApprove: userMod?.canApprove ?? false,
            canExport: userMod?.canExport ?? false,
          };
        }),
      };
    });
  } catch (err: unknown) {
    errorMsg = err instanceof Error ? err.message : "Failed to load employee details.";
  }

  // Server Action to update the user
  async function handleSubmit(data: CreateUserRequest): Promise<ActionResult> {
    "use server";
    const session = await auth();
    const token = session?.accessToken ?? "";

    // Defense-in-depth: validate on the server before calling the API
    const parsed = userFormSchema.safeParse(data);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Validation failed.";
      return { success: false, error: firstError };
    }

    try {
      await updateUser(token, id, data);
      revalidatePath("/admin/users");
      revalidatePath("/admin/monitoring");
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update user.";
      return { success: false, error: message };
    }
  }

  // Server Action to check email uniqueness (wraps the API call with the token)
  async function handleCheckEmail(email: string, excludeUserId?: string): Promise<boolean> {
    "use server";
    const session = await auth();
    const token = session?.accessToken ?? "";

    try {
      return await checkEmailExists(token, email, excludeUserId);
    } catch {
      return false;
    }
  }

  return (
    <EditUserPageContainer
      user={user}
      roles={roles}
      mergedApps={mergedApps}
      errorMsg={errorMsg}
      onSubmitAction={handleSubmit}
      onCheckEmailAction={handleCheckEmail}
    />
  );
}
