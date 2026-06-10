import { FacebookAdapter } from "@/lib/adapters/facebookAdapter";
import { TikTokAdapter } from "@/lib/adapters/tiktokAdapter";
import { YouTubeAdapter } from "@/lib/adapters/youtubeAdapter";
import { isPublicDemoRuntime, syncDemoData } from "@/lib/demoData";
import { enrichRawPost } from "@/lib/mockData";
import { prisma } from "@/lib/prisma";
import { hasPublicYoutubeApiKey, syncPublicYoutubeData } from "@/lib/publicYoutubeData";
import { getPublicSettings } from "@/lib/settings";
import type { Platform } from "@/lib/types";

const adapters = {
  youtube: new YouTubeAdapter(),
  tiktok: new TikTokAdapter(),
  facebook: new FacebookAdapter()
};

export async function syncCompetitorData(platform?: Platform) {
  if (isPublicDemoRuntime()) {
    return syncPublicDemoData(platform);
  }

  const settings = await getPublicSettings();
  if ((!platform || platform === "youtube") && settings.hasYoutubeApiKey && !settings.mockMode) {
    await cleanupMockYouTubePosts();
  }
  const competitors = await prisma.competitor.findMany({
    where: platform ? { platform } : undefined,
    orderBy: [{ platform: "asc" }, { name: "asc" }]
  });
  const syncRunId = `${Date.now()}`;
  let createdPosts = 0;
  let updatedPosts = 0;

  for (const competitor of competitors) {
    const adapter = adapters[competitor.platform as Platform];
    const rawPosts = await adapter.fetchLatestPosts(competitor, { settings, syncRunId });

    for (const rawPost of rawPosts) {
      const enriched = enrichRawPost({
        ...rawPost,
        competitorId: competitor.id
      });

      const existingPost = await prisma.post.findFirst({
        where: {
          competitorId: competitor.id,
          postUrl: enriched.postUrl
        },
        select: { id: true }
      });
      const data = {
        competitorId: competitor.id,
        platform: enriched.platform,
        postUrl: enriched.postUrl,
        title: enriched.title,
        caption: enriched.caption,
        publishedAt: enriched.publishedAt,
        thumbnailUrl: enriched.thumbnailUrl,
        format: enriched.format,
        contentPillar: enriched.contentPillar,
        promotionType: enriched.promotionType,
        toneOfVoice: enriched.toneOfVoice,
        hookType: enriched.hookType,
        mainTopic: enriched.mainTopic,
        views: enriched.views,
        likes: enriched.likes,
        comments: enriched.comments,
        shares: enriched.shares,
        engagementRate: enriched.engagementRate,
        viralityScore: enriched.viralityScore
      };

      if (existingPost) {
        await prisma.post.update({
          where: { id: existingPost.id },
          data
        });
        updatedPosts += 1;
      } else {
        await prisma.post.create({ data });
        createdPosts += 1;
      }
    }
  }

  return {
    syncRunId,
    competitors: competitors.length,
    createdPosts,
    updatedPosts,
    mockMode: settings.mockMode,
    syncedAt: new Date().toISOString()
  };
}

async function syncPublicDemoData(platform?: Platform) {
  if ((!platform || platform === "youtube") && hasPublicYoutubeApiKey()) {
    const youtubeResult = await syncPublicYoutubeData(true);
    if (platform === "youtube") {
      return youtubeResult;
    }

    const demoResult = syncDemoData(platform, { excludePlatforms: ["youtube"] });
    return {
      ...demoResult,
      syncRunId: youtubeResult.syncRunId,
      competitors: demoResult.competitors + youtubeResult.competitors,
      createdPosts: demoResult.createdPosts + youtubeResult.createdPosts,
      updatedPosts: demoResult.updatedPosts + youtubeResult.updatedPosts,
      mockMode: false,
      provider: "mixed_youtube_api_and_demo_adapters",
      note: "YouTube đang lấy dữ liệu thật qua YouTube Data API v3; TikTok và Facebook dùng adapter mô phỏng vì chưa có data provider hợp lệ."
    };
  }

  return syncDemoData(platform);
}

async function cleanupMockYouTubePosts() {
  await prisma.post.deleteMany({
    where: {
      platform: "youtube",
      OR: [
        { thumbnailUrl: { contains: "placehold.co" } },
        { postUrl: { contains: "quang-du" } },
        { postUrl: { contains: "riley-co" } },
        { postUrl: { contains: "tta-post" } },
        { postUrl: { contains: "con-duon" } }
      ]
    }
  });
}
