import { SidebarInset, SidebarProvider } from "@/features/components/ui/sidebar";
import { StatisticsHeader } from "@/features/statistics/components/header";
import { AppSidebar } from "@/features/statistics/components/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="theme-dashboard">
      <SidebarProvider>
        <AppSidebar variant="inset" collapsible="icon" />
        <SidebarInset>
          <StatisticsHeader />
          <main className="flex w-full flex-col gap-1 px-6 py-2">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
