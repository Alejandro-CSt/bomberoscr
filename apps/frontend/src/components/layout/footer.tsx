import { Link } from "@tanstack/react-router";
import { GithubLogo, Globe } from "@phosphor-icons/react";
import { Logo } from "@/components/layout/logo";
import { navItems } from "@/components/layout/nav-items";

const SOCIAL_LINKS = [
  {
    title: "GitHub",
    url: "https://github.com/Alejandro-CSt/bomberoscr",
    icon: GithubLogo
  },
  {
    title: "Página Oficial de Bomberos",
    url: "https://www.bomberos.go.cr",
    icon: Globe
  }
] as const;

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto w-full max-w-6xl px-0 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="flex flex-col gap-4 md:col-span-2">
            <div className="-ml-2 w-fit">
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

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 md:flex-row">
          <p className="text-xs text-muted-foreground">
            © {currentYear} Emergencias CR. No afiliado oficialmente al Benemérito Cuerpo de
            Bomberos de Costa Rica.
          </p>
        </div>
      </div>
    </footer>
  );
}
