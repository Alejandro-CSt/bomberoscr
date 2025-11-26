import { submitAdminForm } from "@/features/dashboard/admin/actions/actions";
import { Alert, AlertDescription, AlertTitle } from "@/features/shared/components/ui/alert";
import { Button } from "@/features/shared/components/ui/button";
import { Input } from "@/features/shared/components/ui/input";
import { AlertCircle } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

type Params = Promise<{
  error?: string;
}>;

function LoginSkeleton() {
  return (
    <form className="flex flex-col gap-4">
      <Input type="password" placeholder="Password" name="adminToken" disabled />
      <Button type="submit" disabled>
        Loading...
      </Button>
    </form>
  );
}

async function LoginForm({ searchParams }: { searchParams: Params }) {
  const { error } = await searchParams;

  return (
    <form className="flex flex-col gap-4" action={submitAdminForm}>
      <Input type="password" placeholder="Password" name="adminToken" />
      <Button type="submit">Login</Button>
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error === "invalid-token" ? "Invalid token." : "You are not authenticated."}
          </AlertDescription>
        </Alert>
      )}
    </form>
  );
}

export default function Page({ searchParams }: { searchParams: Params }) {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginForm searchParams={searchParams} />
    </Suspense>
  );
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
