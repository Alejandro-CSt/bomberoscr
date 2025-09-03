"use client";

import { getRelativeTime } from "@/features/shared/lib/utils";
import { useNow } from "@/features/sidebar/hooks/use-now";
import { memo } from "react";

interface Props {
  iso: string;
}

export const LiveRelativeTime = memo<Props>(({ iso }) => {
  const now = useNow();
  return <>{getRelativeTime(iso, new Date(now))}</>;
});

LiveRelativeTime.displayName = "LiveRelativeTime";
