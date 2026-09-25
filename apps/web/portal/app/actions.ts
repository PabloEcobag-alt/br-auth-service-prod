"use server";

import { signOut } from "@/auth";
import { redirect } from "next/navigation";

export async function handleLogout() {
  await signOut({ redirect: false });
  const postLogoutUri = (process.env.AUTH_URL || "https://localhost:3000/").replace(/\/?$/, "/");
  redirect(
    `${process.env.AUTH_ISSUER}connect/logout?post_logout_redirect_uri=${encodeURIComponent(
      postLogoutUri
    )}`
  );
}
