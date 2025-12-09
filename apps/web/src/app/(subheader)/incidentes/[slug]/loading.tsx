import { Skeleton } from "@/features/shared/components/ui/skeleton";
import {
  Timeline,
  TimelineContent,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle
} from "@/features/shared/components/ui/timeline";

export default function Loading() {
  return (
    <article className="grid w-full max-w-none grid-cols-1 gap-6 pb-24 md:gap-8 lg:grid-cols-3">
      {/* Main content - left column (spans 2 on lg) */}
      <div className="order-1 flex flex-col gap-4 md:gap-6 lg:order-1 lg:col-span-2">
        {/* Title - 3 lines with text-4xl line-height (2.5rem = 40px per line) */}
        <div className="space-y-2">
          <Skeleton className="h-9 w-full md:h-10" />
          <Skeleton className="h-9 w-full md:h-10" />
          <Skeleton className="h-9 w-3/4 md:h-10" />
        </div>

        {/* Map placeholder */}
        <div className="min-h-[400px] w-full rounded-xl border-2 bg-muted" />

        {/* Timestamp */}
        <Skeleton className="h-5 w-56" />

        {/* Narrative section */}
        <section className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-full max-w-prose" />
            <Skeleton className="h-4 w-3/4 max-w-prose" />
          </div>
          <Skeleton className="ml-4 h-5 w-5/6 max-w-prose border-l-4 pl-4" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full max-w-prose" />
            <Skeleton className="h-4 w-4/5 max-w-prose" />
            <Skeleton className="h-4 w-2/3 max-w-prose" />
          </div>
        </section>
      </div>

      {/* Timeline aside - right column */}
      <aside className="order-2 self-start lg:sticky lg:top-4 lg:order-2 lg:col-span-1">
        <Timeline defaultValue={5}>
          {/* First event - "Reporte inicial" is always the first */}
          <TimelineItem step={1}>
            <TimelineHeader>
              <TimelineSeparator />
              <Skeleton className="mb-1 h-4 w-16" />
              <TimelineTitle>Reporte inicial</TimelineTitle>
              <TimelineIndicator />
            </TimelineHeader>
          </TimelineItem>

          {/* Remaining timeline events */}
          {Array(4)
            .fill(0)
            .map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton items
              <TimelineItem key={i} step={i + 2}>
                <TimelineHeader>
                  <TimelineSeparator />
                  <Skeleton className="mb-1 h-4 w-16" />
                  <TimelineTitle>
                    <Skeleton className="h-4 w-40" />
                  </TimelineTitle>
                  <TimelineIndicator />
                </TimelineHeader>
                <TimelineContent>
                  <Skeleton className="h-3 w-24" />
                </TimelineContent>
              </TimelineItem>
            ))}
        </Timeline>
      </aside>
    </article>
  );
}
