import { HeaderNav } from "@/components/layout/header-nav";
import { Logo } from "@/components/layout/logo";
import { MobileHeaderNav } from "@/components/layout/mobile-header-nav";

export function Header() {
  return (
    <header className="app-header fixed inset-x-0 top-0 z-40 flex shrink-0 items-center bg-background px-6 xl:px-0">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3">
        <Logo />
        <HeaderNav className="max-sm:hidden" />
        <MobileHeaderNav className="sm:hidden" />
      </div>
    </header>
  );
}
