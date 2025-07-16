import { FloatingPanelHeader } from "@/map/layout/components/floating-panel-header";
import { Skeleton } from "@/shared/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <FloatingPanelHeader title="Detalles del incidente" />
      <div className="flex flex-col gap-4 p-4">
        <section className="flex justify-between">
          <div className="flex flex-col">
            <p className="font-semibold text-muted-foreground">Aviso</p>
            <Skeleton className="mt-1 h-4 w-32" />
          </div>
          <div className="flex flex-col text-end">
            <p className="font-semibold text-muted-foreground">Última actualización</p>
            <Skeleton className="mt-1 ml-auto h-4 w-32" />
          </div>
        </section>

        <section>
          <Skeleton className="h-4 w-full" />
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex justify-between gap-4">
            <div className="flex flex-col">
              <p className="font-semibold text-muted-foreground">Se despacha por</p>
              <Skeleton className="mt-1 h-3 w-24" />
              <Skeleton className="mt-2 h-3 w-32" />
            </div>
            <div className="flex flex-col">
              <p className="font-semibold text-muted-foreground">Bomberos reportan</p>
              <Skeleton className="mt-1 h-3 w-24" />
              <Skeleton className="mt-2 h-3 w-32" />
            </div>
          </div>
          <Skeleton className="h-4 w-full" />
        </section>

        <section className="flex flex-col gap-2 rounded-md border p-4">
          <div className="mb-2 flex items-center justify-between">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-20" />
          </div>
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                key={i}
                className="flex items-center justify-between border-b py-2 last:border-b-0"
              >
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
        </section>

        <section className="flex flex-col gap-2 pb-4">
          <h4 className="font-semibold text-muted-foreground">Unidades</h4>
          {Array(2)
            .fill(0)
            .map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              <div key={i} className="space-y-4 rounded-md border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-6 w-6 rounded-full" />
                </div>
              </div>
            ))}
        </section>
      </div>
    </div>
  );
}
