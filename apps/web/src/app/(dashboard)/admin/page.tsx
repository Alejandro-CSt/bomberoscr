import { validateAdminSession } from "@/features/admin/lib/validateSession";
import { Suspense } from "react";

function AdminPageSkeleton() {
  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <div className="text-muted-foreground">Loading admin panel...</div>
    </div>
  );
}

async function AdminContent() {
  await validateAdminSession();
  return <div>Admin page</div>;
}

export default function AdminPage() {
  return (
    <Suspense fallback={<AdminPageSkeleton />}>
      <AdminContent />
    </Suspense>
  );
}
