export type Platform = "youtube" | "tiktok" | "facebook";
export type SourceType = "trong_nuoc" | "nuoc_ngoai";
export type SortBy = "engagement" | "views" | "comments" | "newest";

export type ClassifiedPost = {
  contentPillar: string;
  promotionType: string;
  toneOfVoice: string;
  hookType: string;
  format: string;
  mainTopic: string;
};

export type RawPostInput = {
  competitorId?: string;
  platform: Platform;
  postUrl: string;
  title: string;
  caption: string;
  publishedAt: Date;
  thumbnailUrl?: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  format?: string;
};

export type CompetitorSeed = {
  name: string;
  platform: Platform;
  source: SourceType;
  segmentation?: string;
  category: string;
  topicDescription?: string;
  channelUrl: string;
  avatarUrl?: string;
};

export type PublicSettings = {
  mockMode: boolean;
  hasYoutubeApiKey: boolean;
  youtubeApiKeySource?: "env" | "database";
  hasTikTokProvider: boolean;
  hasMetaGraphToken: boolean;
  hasGoogleDocsConnection?: boolean;
  tiktokProviderUrl?: string;
};

export type AnalyticsFilters = {
  platform?: Platform | "all";
  days?: number;
  source?: SourceType | "all";
  contentPillar?: string;
  format?: string;
  promotionType?: string;
  sortBy?: SortBy;
};

export type ExportType = "csv" | "json" | "markdown";
