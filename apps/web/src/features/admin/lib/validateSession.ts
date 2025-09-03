import env from "@/features/server/env";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function validateAdminSession() {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("admin-token");

  if (!adminToken?.value) {
    redirect("/admin/auth/login?error=not-authenticated");
    return;
  }

  if (adminToken.value !== env.ADMIN_TOKEN) {
    redirect("/admin/auth/login?error=invalid-token");
  }
}
