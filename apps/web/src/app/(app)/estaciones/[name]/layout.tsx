import { FloatingPanelHeader } from "@/features/layout/components/floating-panel-header";

export default async function StationLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <FloatingPanelHeader title="Detalles de la estación" />
      {children}
    </div>
  );
}
