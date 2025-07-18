import { AppSidebar } from "@/features/sidebar/components/sidebar";
import Header from "@/shared/components/header";
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "350px"
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset className="min-w-0 overflow-hidden">
        <Header />
        <main className="min-w-0 overflow-auto">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
