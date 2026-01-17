import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { useQueryStates } from "nuqs";

import { stationsSearchParamsParsers } from "@/components/stations/stations-directory-search-params";
import { Button } from "@/components/ui/button";

interface StationsDirectoryPaginationProps {
  totalPages: number;
}

export function StationsDirectoryPagination({ totalPages }: StationsDirectoryPaginationProps) {
  const [{ page }, setParams] = useQueryStates(stationsSearchParamsParsers, {
    shallow: true,
    history: "push"
  });

  const currentPage = page + 1;
  const isFirstPage = page === 0;
  const isLastPage = currentPage >= totalPages;

  return (
    <nav
      className="flex"
      aria-label="Paginación de estaciones">
      <Button
        variant="outline"
        size="icon"
        className="rounded-r-none"
        disabled={isFirstPage}
        onClick={() => {
          if (!isFirstPage) setParams({ page: page - 1 });
        }}
        aria-label="Página anterior">
        <CaretLeft weight="bold" />
      </Button>
      <div className="flex min-w-20 items-center justify-center border-y border-input bg-background px-3 tabular-nums">
        <span className="text-sm">
          {currentPage} de {totalPages}
        </span>
      </div>
      <Button
        variant="outline"
        size="icon"
        className="rounded-l-none"
        disabled={isLastPage}
        onClick={() => {
          if (!isLastPage) setParams({ page: page + 1 });
        }}
        aria-label="Página siguiente">
        <CaretRight weight="bold" />
      </Button>
    </nav>
  );
}
