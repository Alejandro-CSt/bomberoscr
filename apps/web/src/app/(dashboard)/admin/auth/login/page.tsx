"use server";

import { submitAdminForm } from "@/features/admin/actions/actions";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { AlertCircle } from "lucide-react";

type Params = Promise<{
  error?: string;
}>;

export default async function Page({ searchParams }: { searchParams: Params }) {
  const { error } = await searchParams;

  return (
    <form className="flex flex-col gap-4 p-4" action={submitAdminForm}>
      <Input type="password" placeholder="Password" name="adminToken" />
      <Button type="submit">Login</Button>
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error === "not-authenticated" && "You are not authenticated."}
            {error === "invalid-token" && "Invalid token."}
          </AlertDescription>
        </Alert>
      )}
    </form>
  );
}
