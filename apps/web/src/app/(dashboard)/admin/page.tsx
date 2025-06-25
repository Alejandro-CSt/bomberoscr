"use server";

import { validateAdminSession } from "@/features/admin/actions/actions";

export default async function AdminPage() {
  await validateAdminSession();
  return <div>Admin page</div>;
}
