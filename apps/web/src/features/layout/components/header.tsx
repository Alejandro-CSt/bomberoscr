"use client";

import { HeaderNav } from "@/features/layout/components/header-nav";
import { Logo } from "@/features/layout/components/logo";
import { MobileHeaderNav } from "@/features/layout/components/mobile-header-nav";
import ThemeToggle from "@/features/layout/components/theme-toggle";

export function Header() {
  return (
    <header className="app-header fixed inset-x-0 top-0 z-40 flex shrink-0 items-center bg-background px-6 max-w-4xl:px-0">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-3">
        <Logo />
        <HeaderNav className="max-sm:hidden" />
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <MobileHeaderNav className="sm:hidden" />
        </div>
      </div>
    </header>
  );
}
