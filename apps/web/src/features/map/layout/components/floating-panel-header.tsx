import { XIcon } from "lucide-react";
import Link from "next/link";

export function FloatingPanelHeader({ title }: { title: string }) {
  return (
    <div className="sticky top-0 z-30 flex items-center justify-between border-b bg-card p-4">
      <div className="flex items-center">
        <h1 className="font-medium text-xl">{title}</h1>
      </div>
      <Link href="/mapa">
        <XIcon className="size-5" />
        <span className="sr-only">Cerrar</span>
      </Link>
    </div>
  );
}
