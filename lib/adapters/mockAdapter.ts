import type { Competitor } from "@prisma/client";
import { generateMockPostsForCompetitor } from "@/lib/mockData";
import type { AdapterContext, CompetitorDataAdapter } from "@/lib/adapters/types";
import type { CompetitorSeed } from "@/lib/types";

export class MockAdapter implements CompetitorDataAdapter {
  async fetchLatestPosts(competitor: Competitor, context: AdapterContext) {
    const seed: CompetitorSeed = {
      name: competitor.name,
      platform: competitor.platform as CompetitorSeed["platform"],
      source: competitor.source as CompetitorSeed["source"],
      segmentation: competitor.segmentation ?? undefined,
      category: competitor.category,
      topicDescription: competitor.topicDescription ?? undefined,
      channelUrl: competitor.channelUrl,
      avatarUrl: competitor.avatarUrl ?? undefined
    };
    return generateMockPostsForCompetitor(seed, 1, {
      syncMode: true,
      batchKey: context.syncRunId,
      startOffsetDays: 0
    });
  }
}
