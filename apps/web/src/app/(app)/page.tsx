import FloatingMenu from "@/features/map/components/floating-menu";
import { InteractiveMap } from "@/features/map/components/interactive-map";

export default async function Home() {
  return (
    <div className="h-dvh">
      <FloatingMenu />
      <InteractiveMap />
    </div>
  );
}
