"use client";

import { navItems } from "@/features/layout/components/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/features/shared/components/ui/breadcrumb";
import { Separator } from "@/features/shared/components/ui/separator";
import { SidebarTrigger } from "@/features/shared/components/ui/sidebar";
import { cn } from "@/features/shared/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const incidentRegex = /^\/incidentes\/(.+)$/;

export function HeaderContent() {
  const pathname = usePathname();

  const getCurrentPageInfo = () => {
    if (pathname === "/") {
      return { title: null, breadcrumbs: [] };
    }

    const incidentMatch = pathname.match(incidentRegex);
    if (incidentMatch) {
      const incidentId = incidentMatch[1];
      return {
        title: `Incidente ${incidentId}`,
        breadcrumbs: [
          { title: "Incidentes", href: "/incidentes" },
          { title: `Incidente ${incidentId}`, href: pathname, isActive: true }
        ]
      };
    }

    const navItem = navItems.find((item) => item.url === pathname);
    if (navItem && navItem.url !== "/") {
      return {
        title: navItem.title,
        breadcrumbs: [{ title: navItem.title, href: pathname, isActive: true }]
      };
    }

    return { title: "Página", breadcrumbs: [] };
  };

  const { title, breadcrumbs } = getCurrentPageInfo();

  return (
    <header
      className={cn(
        "flex shrink-0 items-center gap-2 border-b bg-background p-4",
        pathname === "/" && "md:hidden"
      )}
    >
      <SidebarTrigger className="-ml-1 md:hidden" />
      <Separator
        orientation="vertical"
        className="mr-2 data-[orientation=vertical]:h-4 md:hidden"
      />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Inicio</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {breadcrumbs.length > 0 && (
            <>
              <BreadcrumbSeparator />
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.href} className="flex items-center">
                  <BreadcrumbItem>
                    {crumb.isActive ? (
                      <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={{ pathname: crumb.href }}>{crumb.title}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                </div>
              ))}
            </>
          )}
          {title && breadcrumbs.length === 0 && (
            <>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{title}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
}
