import { auth } from "@/auth";
import { getUsers, UserListItemDto } from "@/lib/apiClient";
import { MonitoringPageContainer } from "@/components/monitoring/MonitoringPageContainer";

export const dynamic = "force-dynamic";

export default async function MonitoringPage() {
  const session = await auth();
  const token = session?.accessToken ?? "";

  let users: UserListItemDto[] = [];
  let errorMsg = "";

  try {
    users = await getUsers(token, true);
  } catch (err: unknown) {
    errorMsg = err instanceof Error ? err.message : "Failed to load telemetry data.";
  }

  return (
    <MonitoringPageContainer 
      users={users} 
      errorMsg={errorMsg} 
    />
  );
}
