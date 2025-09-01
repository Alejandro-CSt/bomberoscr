"use server";

import { validateAdminSession } from "@/features/dashboard/admin/actions/actions";

export default async function AdminPage() {
  await validateAdminSession();
  return <div>Admin page</div>;
}
