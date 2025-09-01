import {
  createSearchParamsCache,
  parseAsIndex,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum
} from "nuqs/server";

enum SortBy {
  id = "id",
  fecha = "fecha"
}

enum SortDirection {
  asc = "asc",
  desc = "desc"
}

export const tableSearchParamsCache = createSearchParamsCache({
  sortBy: parseAsStringEnum<SortBy>(Object.values(SortBy)).withDefault(SortBy.id),
  sortDirection: parseAsStringEnum<SortDirection>(Object.values(SortDirection)).withDefault(
    SortDirection.asc
  ),
  pageIndex: parseAsIndex.withDefault(0),
  pageSize: parseAsInteger.withDefault(10),
  query: parseAsString.withDefault("")
});
