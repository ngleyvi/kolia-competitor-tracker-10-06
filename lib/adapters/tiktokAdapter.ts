import type { Competitor } from "@prisma/client";
import { MockAdapter } from "@/lib/adapters/mockAdapter";
import type { AdapterContext, CompetitorDataAdapter } from "@/lib/adapters/types";

export class TikTokAdapter implements CompetitorDataAdapter {
  private fallback = new MockAdapter();

  async fetchLatestPosts(competitor: Competitor, context: AdapterContext) {
    if (!context.settings.hasTikTokProvider || context.settings.mockMode) {
      return this.fallback.fetchLatestPosts(competitor, context);
    }

    // Placeholder for Apify/TikTok API/legal scraper providers.
    // Keep provider token server-side and normalize provider output here.
    return this.fallback.fetchLatestPosts(competitor, context);
  }
}
