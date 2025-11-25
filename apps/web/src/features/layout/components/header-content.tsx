"use client";

import { navItems } from "@/features/layout/components/nav-items";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/features/shared/components/ui/breadcrumb";
import { cn, extractIncidentId } from "@/features/shared/lib/utils";
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
      // Extract just the incident ID (e.g., "1548947-serpiente-2025-11-06" -> "1548947")
      const incidentId = extractIncidentId(pathname);
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
      className={cn("app-subheader flex shrink-0 items-center gap-2 bg-background px-4 py-2")}
    >
      <div className="mx-auto w-full max-w-4xl">
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
      </div>
    </header>
  );
}
