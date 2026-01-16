import { CaretLeft, CaretRight, SpinnerGap } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";

interface StationsPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isPending?: boolean;
}

export function StationsPagination({
  currentPage,
  totalPages,
  onPageChange,
  isPending
}: StationsPaginationProps) {
  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage >= totalPages - 1;

  return (
    <nav
      className="flex"
      aria-label="Paginación de estaciones">
      <Button
        variant="outline"
        size="icon"
        className="rounded-r-none"
        disabled={isFirstPage || isPending}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Página anterior">
        <CaretLeft weight="bold" />
      </Button>
      <div className="flex min-w-20 items-center justify-center border-y border-input bg-background px-3 tabular-nums">
        {isPending ? (
          <SpinnerGap
            className="size-4 animate-spin"
            weight="bold"
          />
        ) : (
          <span className="text-sm">
            {currentPage + 1} de {totalPages}
          </span>
        )}
      </div>
      <Button
        variant="outline"
        size="icon"
        className="rounded-l-none"
        disabled={isLastPage || isPending}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Página siguiente">
        <CaretRight weight="bold" />
      </Button>
    </nav>
  );
}
