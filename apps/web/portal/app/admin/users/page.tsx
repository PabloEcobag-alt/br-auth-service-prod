import { auth } from "@/auth";
import { getUsers, deleteUser, UserListItemDto } from "@/lib/apiClient";
import { revalidatePath } from "next/cache";
import { UsersPageContainer } from "@/components/users/UsersPageContainer";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const session = await auth();
  const token = session?.accessToken ?? "";

  let users: UserListItemDto[] = [];
  let errorMsg = "";

  try {
    users = await getUsers(token, false);
  } catch (err: unknown) {
    errorMsg = err instanceof Error ? err.message : "Failed to load directory users.";
  }

  // Server Action for deleting (soft-deleting) a user
  async function handleDelete(formData: FormData) {
    "use server";
    const id = formData.get("userId") as string;
    const session = await auth();
    const token = session?.accessToken ?? "";

    try {
      await deleteUser(token, id);
      revalidatePath("/admin/users");
      revalidatePath("/admin/monitoring");
    } catch (err: unknown) {
      console.error("Delete failed:", err);
    }
  }

  return (
    <UsersPageContainer 
      users={users} 
      errorMsg={errorMsg} 
      onDeleteAction={handleDelete} 
    />
  );
}
