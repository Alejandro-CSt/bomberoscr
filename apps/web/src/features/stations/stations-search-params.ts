import { createSearchParamsCache, parseAsIndex, parseAsString } from "nuqs/server";

export const STATIONS_PER_PAGE = 9;

export const stationsSearchParamsParsers = {
  q: parseAsString.withDefault(""),
  page: parseAsIndex.withDefault(0)
};

export const stationsSearchParamsCache = createSearchParamsCache(stationsSearchParamsParsers);
