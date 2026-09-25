import { auth } from "@/auth";
import { getApps, getRoles, createUser, checkEmailExists, CreateUserRequest, AppPermissionDto } from "@/lib/apiClient";
import { revalidatePath } from "next/cache";
import { NewUserPageContainer } from "@/components/users/NewUserPageContainer";
import { ActionResult } from "@/types/actions";
import { userFormSchema } from "@/lib/validation/userFormSchema";

export const dynamic = "force-dynamic";

export default async function NewUserPage() {
  const session = await auth();
  const token = session?.accessToken ?? "";

  let roles: string[] = [];
  let apps: AppPermissionDto[] = [];
  let errorMsg = "";

  try {
    const [rolesData, appsData] = await Promise.all([
      getRoles(token),
      getApps(token),
    ]);
    roles = rolesData;
    apps = appsData;
  } catch (err: unknown) {
    errorMsg = err instanceof Error ? err.message : "Failed to load directory configuration metadata.";
  }

  // Server Action to create the user
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
      await createUser(token, data);
      revalidatePath("/admin/users");
      revalidatePath("/admin/monitoring");
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create user.";
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
      return false; // Fail open — the submit action will catch duplicates via the backend
    }
  }

  return (
    <NewUserPageContainer
      roles={roles}
      apps={apps}
      errorMsg={errorMsg}
      onSubmitAction={handleSubmit}
      onCheckEmailAction={handleCheckEmail}
    />
  );
}
