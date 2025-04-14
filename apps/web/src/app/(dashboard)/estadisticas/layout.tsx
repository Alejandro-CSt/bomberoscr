import { StatisticsHeader } from "@/dashboard/layout/components/header";
import { AppSidebar } from "@/dashboard/layout/components/sidebar";
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" collapsible="icon" />
      <SidebarInset>
        <StatisticsHeader />
        <main className="flex w-full flex-col gap-1 px-6 py-2">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
