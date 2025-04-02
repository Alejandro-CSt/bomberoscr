import { Button } from "@/features/components/ui/button";
import { FloatingPanelHeader } from "@/features/layout/components/floating-panel-header";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

interface ErrorPanelProps {
  title?: string;
  message: string;
  backHref: string;
  backLabel?: string;
}

export function ErrorPanel({
  title = "Error",
  message,
  backHref,
  backLabel = "Volver"
}: ErrorPanelProps) {
  return (
    <div className="flex flex-col">
      <FloatingPanelHeader title={title} />
      <div className="flex w-full flex-col items-center gap-4 p-4">
        <p className="text-muted-foreground">{message}</p>
        <Button asChild>
          <Link href={backHref} className="group flex gap-2">
            <ArrowLeftIcon className="group-hover:-translate-x-1 transition-transform" />{" "}
            {backLabel}
          </Link>
        </Button>
      </div>
    </div>
  );
}
