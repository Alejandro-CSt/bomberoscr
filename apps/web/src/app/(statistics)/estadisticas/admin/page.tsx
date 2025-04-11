"use server";

import { validateAdminSession } from "@/server/admin/actions";

export default async function AdminPage() {
  await validateAdminSession();
  return <div>Admin page</div>;
}
