import { auth } from "@/auth";
import { getAccessibleSystems } from "@/lib/getAccessibleSystems";
import { PortalDashboard } from "@/components/PortalDashboard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth();
  const systems = await getAccessibleSystems(session?.systems ?? []);

  return (
    <PortalDashboard 
      userName={session?.user?.name} 
      systems={systems} 
    />
  );
}
