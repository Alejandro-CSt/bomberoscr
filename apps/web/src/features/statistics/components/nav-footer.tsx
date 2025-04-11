"use server";
import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/features/components/ui/sidebar";
import env from "@/server/env";
import { ShieldIcon } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";

export async function NavFooter() {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("admin-token");

  if (!adminToken) return null;

  if (adminToken.value !== env.ADMIN_TOKEN) return null;

  return (
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href="/estadisticas/admin">
              <ShieldIcon className="size-4" />
              Admin
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
}
