import { AppSidebar } from "@/features/sidebar/components/sidebar";
import Header from "@/shared/components/header";
import { SidebarWrapper } from "@/shared/components/sidebar-wrapper";
import { SidebarInset } from "@/shared/components/ui/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarWrapper>
      <AppSidebar />
      <SidebarInset className="min-w-0 overflow-hidden">
        <Header />
        <main className="min-w-0 overflow-auto">{children}</main>
      </SidebarInset>
    </SidebarWrapper>
  );
}
