import type { Competitor } from "@prisma/client";
import type { PublicSettings, RawPostInput } from "@/lib/types";

export type AdapterContext = {
  settings: PublicSettings;
  syncRunId: string;
};

export interface CompetitorDataAdapter {
  fetchLatestPosts(competitor: Competitor, context: AdapterContext): Promise<RawPostInput[]>;
}
