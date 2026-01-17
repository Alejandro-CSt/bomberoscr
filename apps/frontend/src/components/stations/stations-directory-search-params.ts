import { parseAsIndex, parseAsString } from "nuqs";

export const STATIONS_PER_PAGE = 9;

export const stationsSearchParamsParsers = {
  q: parseAsString.withDefault(""),
  page: parseAsIndex.withDefault(0)
};
