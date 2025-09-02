import { Loader2Icon } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-[80dvh] flex-col items-center justify-center">
      <Loader2Icon className="size-5 animate-spin" />
    </div>
  );
}
