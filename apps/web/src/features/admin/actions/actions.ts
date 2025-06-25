"use server";

import env from "@/server/env";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function submitAdminForm(formData: FormData) {
  "use server";
  const adminToken = formData.get("adminToken");
  (await cookies()).set({
    name: "admin-token",
    value: adminToken as string
  });
  redirect("/admin");
}

export async function validateAdminSession() {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("admin-token");
  if (!adminToken) redirect("/admin/auth/login?error=not-authenticated");
  if (adminToken.value !== env.ADMIN_TOKEN) redirect("/admin/auth/login?error=invalid-token");
}
