import type { Competitor, Post } from "@prisma/client";
import { competitorSeeds, generateMockPostsForCompetitor, seedPostCountForPlatform } from "@/lib/mockData";
import type { AnalyticsFilters, Platform, PublicSettings, SourceType } from "@/lib/types";

type DemoCompetitor = Competitor;
type DemoPost = Post & { competitor: DemoCompetitor };

type DemoState = {
  competitors: DemoCompetitor[];
  posts: DemoPost[];
  settings: PublicSettings;
  syncRuns: number;
};

const globalForDemo = globalThis as unknown as {
  koliaDemoState?: DemoState;
};

export function isPublicDemoRuntime() {
  return process.env.VERCEL === "1" || process.env.KOLIA_PUBLIC_DEMO === "true";
}

function nowMinusMinutes(minutes: number) {
  const date = new Date();
  date.setMinutes(date.getMinutes() - minutes);
  return date;
}

function createCompetitors(): DemoCompetitor[] {
  const now = new Date();
  return competitorSeeds.map((seed, index) => ({
    id: `demo_competitor_${index + 1}`,
    name: seed.name,
    platform: seed.platform,
    source: seed.source,
    segmentation: seed.segmentation ?? null,
    category: seed.category,
    topicDescription: seed.topicDescription ?? null,
    channelUrl: seed.channelUrl,
    avatarUrl: seed.avatarUrl ?? null,
    createdAt: now,
    updatedAt: now
  }));
}

function createPosts(competitors: DemoCompetitor[]) {
  return competitors.flatMap((competitor, competitorIndex) => {
    const seed = competitorSeeds[competitorIndex];
    return generateMockPostsForCompetitor(seed, seedPostCountForPlatform(seed.platform)).map((post, postIndex) =>
      attachCompetitor(post, competitor, `demo_post_${competitorIndex + 1}_${postIndex + 1}`)
    );
  });
}

function attachCompetitor(
  post: ReturnType<typeof generateMockPostsForCompetitor>[number],
  competitor: DemoCompetitor,
  id: string
): DemoPost {
  const now = new Date();
  return {
    id,
    competitorId: competitor.id,
    competitor,
    platform: post.platform,
    postUrl: post.postUrl,
    title: post.title,
    caption: post.caption,
    publishedAt: post.publishedAt,
    thumbnailUrl: post.thumbnailUrl ?? null,
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
    viralityScore: post.viralityScore,
    createdAt: now,
    updatedAt: now
  };
}

function createInitialState(): DemoState {
  const competitors = createCompetitors();
  return {
    competitors,
    posts: createPosts(competitors),
    settings: {
      mockMode: true,
      hasYoutubeApiKey: Boolean(process.env.YOUTUBE_API_KEY?.trim()),
      youtubeApiKeySource: process.env.YOUTUBE_API_KEY?.trim() ? "env" : undefined,
      hasTikTokProvider: false,
      hasMetaGraphToken: false,
      tiktokProviderUrl: undefined
    },
    syncRuns: 0
  };
}

export function getDemoState() {
  globalForDemo.koliaDemoState = globalForDemo.koliaDemoState ?? createInitialState();
  return globalForDemo.koliaDemoState;
}

function cleanFilter<T extends string>(value?: T | "all") {
  return !value || value === "all" ? undefined : value;
}

function sortPosts(posts: DemoPost[], sortBy?: AnalyticsFilters["sortBy"]) {
  return posts.slice().sort((a, b) => {
    if (sortBy === "views") return b.views - a.views;
    if (sortBy === "comments") return b.comments - a.comments;
    if (sortBy === "newest") return b.publishedAt.getTime() - a.publishedAt.getTime();
    return b.engagementRate - a.engagementRate || b.viralityScore - a.viralityScore;
  });
}

export function getDemoCompetitors(filters: Pick<AnalyticsFilters, "platform" | "source"> = {}) {
  const platform = cleanFilter(filters.platform as Platform | "all" | undefined);
  const source = cleanFilter(filters.source as SourceType | "all" | undefined);
  return getDemoState().competitors
    .filter((competitor) => (!platform || competitor.platform === platform) && (!source || competitor.source === source))
    .sort((a, b) => a.platform.localeCompare(b.platform) || a.source.localeCompare(b.source) || a.name.localeCompare(b.name));
}

export function getDemoPosts(filters: AnalyticsFilters = {}, limit?: number) {
  const platform = cleanFilter(filters.platform as Platform | "all" | undefined);
  const source = cleanFilter(filters.source as SourceType | "all" | undefined);
  const days = filters.days ?? 90;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const filtered = getDemoState().posts.filter((post) => {
    if (platform && post.platform !== platform) return false;
    if (source && post.competitor.source !== source) return false;
    if (filters.contentPillar && post.contentPillar !== filters.contentPillar) return false;
    if (filters.format && post.format !== filters.format) return false;
    if (filters.promotionType && post.promotionType !== filters.promotionType) return false;
    return post.publishedAt >= startDate;
  });

  return sortPosts(filtered, filters.sortBy).slice(0, limit ?? filtered.length);
}

export function getDemoSettings() {
  return getDemoState().settings;
}

export function updateDemoSettings(input: Partial<Record<string, string | boolean>>) {
  const state = getDemoState();
  state.settings = {
    ...state.settings,
    mockMode: input.mockMode === undefined ? state.settings.mockMode : Boolean(input.mockMode),
    hasYoutubeApiKey: Boolean(process.env.YOUTUBE_API_KEY?.trim() || input.youtubeApiKey),
    youtubeApiKeySource: process.env.YOUTUBE_API_KEY?.trim() || input.youtubeApiKey ? "env" : undefined,
    hasTikTokProvider: Boolean(input.tiktokProviderUrl && input.tiktokProviderToken),
    hasMetaGraphToken: Boolean(input.metaGraphToken),
    tiktokProviderUrl: typeof input.tiktokProviderUrl === "string" ? input.tiktokProviderUrl : state.settings.tiktokProviderUrl
  };
  return state.settings;
}

export function syncDemoData(platform?: Platform) {
  const state = getDemoState();
  state.syncRuns += 1;
  const batchKey = `public-demo-${state.syncRuns}-${Date.now()}`;
  const competitors = platform ? state.competitors.filter((competitor) => competitor.platform === platform) : state.competitors;
  const created: DemoPost[] = [];

  for (const competitor of competitors) {
    const seed = competitorSeeds.find((item) => item.name === competitor.name && item.platform === competitor.platform);
    if (!seed) continue;
    const newPosts = generateMockPostsForCompetitor(seed, 1, {
      syncMode: true,
      batchKey,
      startOffsetDays: 0
    }).map((post, index) =>
      attachCompetitor(post, competitor, `demo_sync_${state.syncRuns}_${competitor.id}_${index}`)
    );
    created.push(...newPosts);
  }

  state.posts = [...created, ...state.posts].map((post, index) => ({
    ...post,
    publishedAt: index < created.length ? nowMinusMinutes(index) : post.publishedAt
  }));

  return {
    syncRunId: batchKey,
    competitors: competitors.length,
    createdPosts: created.length,
    updatedPosts: 0,
    mockMode: true,
    syncedAt: new Date().toISOString(),
    note: "Public demo uses simulated data on Vercel. Localhost keeps the SQLite workflow."
  };
}

export function createDemoCompetitor(input: Partial<DemoCompetitor>) {
  const state = getDemoState();
  const now = new Date();
  const competitor: DemoCompetitor = {
    id: `demo_custom_${Date.now()}`,
    name: input.name ?? "Đối thủ mới",
    platform: input.platform ?? "youtube",
    source: input.source ?? "trong_nuoc",
    segmentation: input.segmentation ?? null,
    category: input.category ?? "other",
    topicDescription: input.topicDescription ?? null,
    channelUrl: input.channelUrl ?? "https://example.com",
    avatarUrl: input.avatarUrl ?? null,
    createdAt: now,
    updatedAt: now
  };
  state.competitors.push(competitor);
  return competitor;
}

export function updateDemoCompetitor(id: string, input: Partial<DemoCompetitor>) {
  const state = getDemoState();
  const index = state.competitors.findIndex((competitor) => competitor.id === id);
  if (index === -1) return null;
  state.competitors[index] = {
    ...state.competitors[index],
    ...input,
    segmentation: input.segmentation ?? state.competitors[index].segmentation,
    topicDescription: input.topicDescription ?? state.competitors[index].topicDescription,
    avatarUrl: input.avatarUrl ?? state.competitors[index].avatarUrl,
    updatedAt: new Date()
  };
  state.posts = state.posts.map((post) =>
    post.competitorId === id ? { ...post, competitor: state.competitors[index] } : post
  );
  return state.competitors[index];
}

export function deleteDemoCompetitor(id: string) {
  const state = getDemoState();
  state.competitors = state.competitors.filter((competitor) => competitor.id !== id);
  state.posts = state.posts.filter((post) => post.competitorId !== id);
  return true;
}
