"use client";

import { useNow } from "@/features/layout/hooks/use-now";
import { getRelativeTime } from "@/features/shared/lib/utils";
import { memo } from "react";

interface Props {
  iso: string;
}

export const LiveRelativeTime = memo<Props>(({ iso }) => {
  const now = useNow();
  return <>{getRelativeTime(iso, new Date(now))}</>;
});

LiveRelativeTime.displayName = "LiveRelativeTime";
