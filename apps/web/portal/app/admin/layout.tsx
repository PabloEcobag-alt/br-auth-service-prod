import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { isSuperUser } from "@/lib/roles";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  if (!isSuperUser(session)) {
    redirect("/");
  }

  return <>{children}</>;
}
