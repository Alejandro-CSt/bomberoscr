import type { Outlet, RawArticle } from "@/services/news/types";
import { ResultAsync } from "neverthrow";
import Parser from "rss-parser";

export class Teletica implements Outlet {
  id = "teletica";
  name = "Teletica";

  getLatestNews = (limit = 100) => {
    const parser = new Parser();

    return ResultAsync.fromPromise(fetch("https://www.teletica.com/rss/feed"), (error) => ({
      type: "fetch_error" as const,
      resource: "teletica",
      error: error
    }))
      .andThen((response) => {
        if (!response.ok) {
          return ResultAsync.fromPromise(
            Promise.reject(new Error(`HTTP ${response.status}: ${response.statusText}`)),
            (error) => ({
              type: "parse_error" as const,
              resource: "teletica",
              error: error
            })
          );
        }
        return ResultAsync.fromPromise(response.text(), (error) => ({
          type: "parse_error" as const,
          resource: "teletica",
          error: error
        }));
      })
      .andThen((xmlText) => {
        return ResultAsync.fromPromise(parser.parseString(xmlText), (error) => ({
          type: "parse_error" as const,
          resource: "teletica",
          error: error
        }));
      })
      .andThen((feed) => {
        const articles: RawArticle[] = feed.items.slice(0, limit).map((item): RawArticle => {
          const media = [];
          if (item.enclosure?.url) {
            const originalUrl = this.getOriginalImageUrl(item.enclosure.url);
            media.push({
              url: originalUrl,
              type: "image" as const
            });
          }

          return {
            title: item.title || "",
            url: item.link || item.guid || "",
            publishedAt: item.pubDate || "",
            content: item["content:encoded"] || item.content || "",
            contentSnippet: item.contentSnippet || item.description || "",
            guid: item.guid,
            media
          };
        });

        return ResultAsync.fromSafePromise(Promise.resolve(articles));
      });
  };

  private static readonly SIZE_PATTERN = /_(\d+)x(\d+)\.jpg$/;

  /**
   * Converts Teletica processed image URLs to original image URLs
   * Example: https://static3.teletica.com/Files/Sizes/2025/9/11/importada-feed_1195670105_760x520.jpg
   * Becomes: https://static3.teletica.com/Files/Original/2025/9/11/importada-feed_1195670105.jpg
   */
  private getOriginalImageUrl(processedUrl: string): string {
    if (processedUrl.includes("static3.teletica.com/Files/Sizes/")) {
      let originalUrl = processedUrl.replace("/Files/Sizes/", "/Files/Original/");
      originalUrl = originalUrl.replace(Teletica.SIZE_PATTERN, ".jpg");
      return originalUrl;
    }

    return processedUrl;
  }
}
