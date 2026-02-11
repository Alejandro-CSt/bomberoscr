import { ResultAsync } from "neverthrow";
import Parser from "rss-parser";

import type { Outlet, OutletError, RawArticle } from "@/services/news/types";

export class Nacion implements Outlet {
  id = "nacion";
  name = "Nacion";
  getLatestNews(limit?: number): ResultAsync<RawArticle[], OutletError> {
    const parser = new Parser();

    return ResultAsync.fromPromise(
      fetch("https://www.nacion.com/arc/outboundfeeds/rss/?outputType=xml"),
      (error) => ({
        type: "fetch_error" as const,
        resource: "nacion",
        error: error
      })
    )
      .andThen((response) => {
        return ResultAsync.fromPromise(response.text(), (error) => ({
          type: "parse_error" as const,
          resource: "nacion",
          error: error
        }));
      })
      .andThen((xmlText) => {
        return ResultAsync.fromPromise(parser.parseString(xmlText), (error) => ({
          type: "parse_error" as const,
          resource: "nacion",
          error: error
        }));
      })
      .andThen((feed) => {
        return ResultAsync.fromSafePromise(
          Promise.resolve(
            feed.items.slice(0, limit).map((item) => ({
              title: item.title || "",
              url: item.link || "",
              publishedAt: item.pubDate || "",
              content: item["content:encoded"] || "",
              contentSnippet: item.description || "",
              guid: item.guid || "",
              media: item["media:content"]
                ? [
                    {
                      url: item["media:content"].url || "",
                      type: "image" as const
                    }
                  ]
                : []
            }))
          )
        );
      });
  }
}
