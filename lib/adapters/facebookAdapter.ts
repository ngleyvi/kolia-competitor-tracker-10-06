import type { Competitor } from "@prisma/client";
import { MockAdapter } from "@/lib/adapters/mockAdapter";
import type { AdapterContext, CompetitorDataAdapter } from "@/lib/adapters/types";

export class FacebookAdapter implements CompetitorDataAdapter {
  private fallback = new MockAdapter();

  async fetchLatestPosts(competitor: Competitor, context: AdapterContext) {
    if (!context.settings.hasMetaGraphToken || context.settings.mockMode) {
      return this.fallback.fetchLatestPosts(competitor, context);
    }

    // Placeholder for Meta Graph API or a compliant data provider.
    // Map API records into RawPostInput before returning.
    return this.fallback.fetchLatestPosts(competitor, context);
  }
}
