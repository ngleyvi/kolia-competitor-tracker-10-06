import { YouTubeAdapter } from "@/lib/adapters/youtubeAdapter";
import { clearDemoPostsForPlatform, getDemoCompetitors, upsertDemoPostsForCompetitor } from "@/lib/demoData";
import type { RawPostInput } from "@/lib/types";

const youtubeAdapter = new YouTubeAdapter();

const globalForPublicYoutube = globalThis as unknown as {
  koliaPublicYoutubeSync?: Promise<PublicYoutubeSyncResult>;
};

export type PublicYoutubeSyncResult = {
  syncRunId: string;
  competitors: number;
  createdPosts: number;
  updatedPosts: number;
  mockMode: false;
  provider: "youtube_data_api_v3";
  syncedAt: string;
  note: string;
};

export function hasPublicYoutubeApiKey() {
  return Boolean(process.env.YOUTUBE_API_KEY?.trim());
}

export async function syncPublicYoutubeData(force = false): Promise<PublicYoutubeSyncResult> {
  if (!hasPublicYoutubeApiKey()) {
    return {
      syncRunId: `youtube-api-missing-${Date.now()}`,
      competitors: 0,
      createdPosts: 0,
      updatedPosts: 0,
      mockMode: false,
      provider: "youtube_data_api_v3",
      syncedAt: new Date().toISOString(),
      note: "Chưa có YOUTUBE_API_KEY trong môi trường chạy public, hệ thống sẽ dùng dữ liệu mô phỏng."
    };
  }

  if (!force && globalForPublicYoutube.koliaPublicYoutubeSync) {
    return globalForPublicYoutube.koliaPublicYoutubeSync;
  }

  globalForPublicYoutube.koliaPublicYoutubeSync = fetchAndStorePublicYoutubeData();
  return globalForPublicYoutube.koliaPublicYoutubeSync;
}

async function fetchAndStorePublicYoutubeData(): Promise<PublicYoutubeSyncResult> {
  const syncRunId = `${Date.now()}`;
  const competitors = getDemoCompetitors({ platform: "youtube" });
  const youtubeSettings = {
    mockMode: false,
    hasYoutubeApiKey: true,
    youtubeApiKeySource: "env" as const,
    hasTikTokProvider: false,
    hasMetaGraphToken: false
  };
  const postsByCompetitor: Array<{ competitor: (typeof competitors)[number]; rawPosts: RawPostInput[] }> = [];

  for (const competitor of competitors) {
    const rawPosts = await youtubeAdapter.fetchLatestPosts(competitor, {
      settings: youtubeSettings,
      syncRunId
    });
    if (rawPosts.length) {
      postsByCompetitor.push({ competitor, rawPosts });
    }
  }

  let createdPosts = 0;
  let updatedPosts = 0;

  if (postsByCompetitor.length) {
    clearDemoPostsForPlatform("youtube");
    for (const { competitor, rawPosts } of postsByCompetitor) {
      const result = upsertDemoPostsForCompetitor(competitor, rawPosts, syncRunId);
      createdPosts += result.createdPosts;
      updatedPosts += result.updatedPosts;
    }
  }

  return {
    syncRunId,
    competitors: competitors.length,
    createdPosts,
    updatedPosts,
    mockMode: false,
    provider: "youtube_data_api_v3",
    syncedAt: new Date().toISOString(),
    note: postsByCompetitor.length
      ? "YouTube đang lấy dữ liệu thật qua YouTube Data API v3. TikTok và Facebook vẫn dùng adapter mô phỏng cho bản public demo."
      : "YouTube Data API v3 đã được gọi nhưng chưa trả về video mới. Vui lòng kiểm tra quota, giới hạn API key hoặc trạng thái kênh."
  };
}
