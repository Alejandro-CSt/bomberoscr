import { validateAdminSession } from "@/features/dashboard/admin/lib/validateSession";
import { Suspense } from "react";
import type { Metadata } from "next";

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

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false
    }
  }
};

export default function AdminPage() {
  return (
    <Suspense fallback={<AdminPageSkeleton />}>
      <AdminContent />
    </Suspense>
  );
}
