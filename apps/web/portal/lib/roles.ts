import { Session } from "next-auth";

export function isSuperUser(session: Session | null): boolean {
  if (!session?.roles) return false;
  return session.roles.includes("Super Admin") || session.roles.includes("CEO");
}
