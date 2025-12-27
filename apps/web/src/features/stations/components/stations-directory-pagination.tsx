"use client";

import { Button } from "@/features/shared/components/ui/button";
import { ButtonGroup, ButtonGroupText } from "@/features/shared/components/ui/button-group";
import { stationsSearchParamsParsers } from "@/features/stations/stations-search-params";
import { SpinnerIcon } from "@phosphor-icons/react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useQueryStates } from "nuqs";
import { useEffect, useState, useTransition } from "react";

interface StationsDirectoryPaginationProps {
  totalPages: number;
}

export function StationsDirectoryPagination({ totalPages }: StationsDirectoryPaginationProps) {
  const [isPending, startTransition] = useTransition();
  const [showSpinner, setShowSpinner] = useState(false);
  const [{ page }, setParams] = useQueryStates(stationsSearchParamsParsers, {
    shallow: false,
    history: "push",
    startTransition
  });

  useEffect(() => {
    if (!isPending) {
      setShowSpinner(false);
      return;
    }

    const timeout = setTimeout(() => setShowSpinner(true), 500);
    return () => clearTimeout(timeout);
  }, [isPending]);

  const displayTotalPages = Math.max(1, totalPages);
  const currentPage = page + 1;
  const isFirstPage = page === 0;
  const isLastPage = currentPage >= displayTotalPages;

  return (
    <ButtonGroup aria-label="Paginación de estaciones">
      <Button
        variant="outline"
        className="rounded-r-none"
        onClick={() => {
          if (!isFirstPage) setParams({ page: page - 1 });
        }}
        disabled={isFirstPage || showSpinner}
        aria-label="Página anterior"
      >
        <ChevronLeftIcon />
      </Button>

      <ButtonGroupText className="min-w-20 justify-center tabular-nums">
        {showSpinner ? (
          <SpinnerIcon className="size-4 animate-spin" />
        ) : (
          <>
            {currentPage} de {displayTotalPages}
          </>
        )}
      </ButtonGroupText>

      <Button
        variant="outline"
        className="rounded-l-none"
        onClick={() => {
          if (!isLastPage) setParams({ page: page + 1 });
        }}
        disabled={isLastPage || showSpinner}
        aria-label="Página siguiente"
      >
        <ChevronRightIcon />
      </Button>
    </ButtonGroup>
  );
}
