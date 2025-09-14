import type { ResultAsync } from "neverthrow";

export type RawArticle = {
  title: string;
  url: string;
  publishedAt: string;
  content: string;
  contentSnippet?: string;
  guid?: string;
  media: {
    url: string;
    type: "image" | "video";
  }[];
};

export type OutletError = {
  type: "fetch_error" | "parse_error";
  resource: string;
  error: unknown;
};

export interface Outlet {
  id: string;
  name: string;
  getLatestNews: (limit?: number) => ResultAsync<RawArticle[], OutletError>;
}
