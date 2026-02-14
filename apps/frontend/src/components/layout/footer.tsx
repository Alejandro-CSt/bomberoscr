import { GithubLogoIcon, GlobeIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";

import { Logo } from "@/components/layout/logo";
import { navItems } from "@/components/layout/nav-items";

const SOCIAL_LINKS = [
  {
    title: "GitHub",
    url: "https://github.com/Alejandro-CSt/bomberoscr",
    icon: GithubLogoIcon
  },
  {
    title: "Página Oficial de Bomberos",
    url: "https://www.bomberos.go.cr",
    icon: GlobeIcon
  }
] as const;

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer rail-divider-top mt-20 bg-background/95 px-6 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto w-full max-w-6xl px-2 py-12 sm:px-0">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="flex flex-col gap-4 md:col-span-2">
            <div className="w-fit">
              <Logo />
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Monitoreo en tiempo real de incidentes atendidos por el Benemérito Cuerpo de Bomberos
              de Costa Rica.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold tracking-tight">Navegación</h3>
            <nav className="flex flex-col gap-3">
              {navItems
                .filter((item) => item.enabled)
                .map((item) => (
                  <Link
                    key={item.url}
                    to={item.url}
                    className="w-fit text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {item.title}
                  </Link>
                ))}
            </nav>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold tracking-tight">Enlaces</h3>
            <nav className="flex flex-col gap-3">
              {SOCIAL_LINKS.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
                  <link.icon
                    size={16}
                    weight="duotone"
                  />
                  <span>{link.title}</span>
                </a>
              ))}
            </nav>
          </div>
        </div>

        <div className="-mx-2 mt-12 flex flex-col items-center justify-between gap-4 border-t px-2 pt-8 sm:mx-0 sm:px-0 md:flex-row">
          <p className="text-xs text-muted-foreground">
            © {currentYear} Emergencias CR. No afiliado oficialmente al Benemérito Cuerpo de
            Bomberos de Costa Rica.
          </p>
        </div>
      </div>
    </footer>
  );
}
