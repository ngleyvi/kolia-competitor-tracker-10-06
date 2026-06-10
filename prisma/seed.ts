import { competitorSeeds, generateMockPostsForCompetitor, seedPostCountForPlatform } from "../lib/mockData";
import { prisma } from "../lib/prisma";

async function main() {
  await prisma.post.deleteMany();
  await prisma.insightReport.deleteMany();
  await prisma.competitor.deleteMany();
  await prisma.setting.deleteMany();

  await prisma.setting.createMany({
    data: [
      { key: "mockMode", value: "true" },
      { key: "youtubeApiKey", value: "" },
      { key: "tiktokProviderUrl", value: "" },
      { key: "tiktokProviderToken", value: "" },
      { key: "metaGraphToken", value: "" }
    ]
  });

  for (const seed of competitorSeeds) {
    const competitor = await prisma.competitor.create({
      data: {
        name: seed.name,
        platform: seed.platform,
        source: seed.source,
        segmentation: seed.segmentation,
        category: seed.category,
        topicDescription: seed.topicDescription,
        channelUrl: seed.channelUrl,
        avatarUrl: seed.avatarUrl
      }
    });

    const posts = generateMockPostsForCompetitor(seed, seedPostCountForPlatform(seed.platform));
    await prisma.post.createMany({
      data: posts.map((post) => ({
        competitorId: competitor.id,
        platform: post.platform,
        postUrl: post.postUrl,
        title: post.title,
        caption: post.caption,
        publishedAt: post.publishedAt,
        thumbnailUrl: post.thumbnailUrl,
        format: post.format,
        contentPillar: post.contentPillar,
        promotionType: post.promotionType,
        toneOfVoice: post.toneOfVoice,
        hookType: post.hookType,
        mainTopic: post.mainTopic,
        views: post.views,
        likes: post.likes,
        comments: post.comments,
        shares: post.shares,
        engagementRate: post.engagementRate,
        viralityScore: post.viralityScore
      }))
    });
  }

  const counts = await prisma.post.groupBy({
    by: ["platform"],
    _count: { id: true }
  });

  console.table(counts.map((item) => ({ platform: item.platform, posts: item._count.id })));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
