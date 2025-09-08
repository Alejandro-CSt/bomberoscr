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
