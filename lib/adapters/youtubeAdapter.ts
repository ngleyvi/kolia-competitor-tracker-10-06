import type { Competitor } from "@prisma/client";
import { MockAdapter } from "@/lib/adapters/mockAdapter";
import type { AdapterContext, CompetitorDataAdapter } from "@/lib/adapters/types";
import { getServerYoutubeApiKey } from "@/lib/settings";
import type { RawPostInput } from "@/lib/types";

type YouTubeSearchResponse = {
  items?: Array<{
    id?: {
      channelId?: string;
    };
    snippet?: {
      channelId?: string;
    };
  }>;
};

type YouTubeChannelsResponse = {
  items?: Array<{
    id?: string;
    contentDetails?: {
      relatedPlaylists?: {
        uploads?: string;
      };
    };
  }>;
};

type YouTubePlaylistItemsResponse = {
  items?: Array<{
    snippet?: {
      title?: string;
      description?: string;
      publishedAt?: string;
      thumbnails?: {
        maxres?: { url?: string };
        high?: { url?: string };
        medium?: { url?: string };
        default?: { url?: string };
      };
      resourceId?: {
        videoId?: string;
      };
    };
    contentDetails?: {
      videoId?: string;
      videoPublishedAt?: string;
    };
  }>;
};

type YouTubeVideosResponse = {
  items?: Array<{
    id: string;
    snippet?: {
      title?: string;
      description?: string;
      publishedAt?: string;
      thumbnails?: {
        maxres?: { url?: string };
        high?: { url?: string };
        medium?: { url?: string };
        default?: { url?: string };
      };
    };
    contentDetails?: {
      duration?: string;
    };
    statistics?: {
      viewCount?: string;
      likeCount?: string;
      commentCount?: string;
    };
  }>;
};

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";
const channelIdCache = new Map<string, string>();
const uploadsPlaylistCache = new Map<string, string>();

export class YouTubeAdapter implements CompetitorDataAdapter {
  private fallback = new MockAdapter();

  async fetchLatestPosts(competitor: Competitor, context: AdapterContext) {
    if (!context.settings.hasYoutubeApiKey || context.settings.mockMode) {
      return this.fallback.fetchLatestPosts(competitor, context);
    }

    const apiKey = await getServerYoutubeApiKey();
    if (!apiKey) {
      return this.fallback.fetchLatestPosts(competitor, context);
    }

    try {
      const channelId = await resolveChannelId(competitor, apiKey);
      if (!channelId) return [];

      const uploadsPlaylistId = await getUploadsPlaylistId(channelId, apiKey);
      if (!uploadsPlaylistId) return [];

      const videoIds = await getLatestVideoIds(uploadsPlaylistId, apiKey);
      if (!videoIds.length) return [];

      return getVideoDetails(videoIds, apiKey);
    } catch (error) {
      console.warn(`YouTube API sync failed for ${competitor.name}:`, error);
      return [];
    }
  }
}

async function youtubeGet<T>(path: string, params: Record<string, string | number | undefined>, apiKey: string): Promise<T> {
  const url = new URL(`${YOUTUBE_API_BASE}/${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }
  url.searchParams.set("key", apiKey);

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 0 }
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`YouTube API ${path} failed with ${response.status}: ${body.slice(0, 300)}`);
  }

  return response.json() as Promise<T>;
}

async function resolveChannelId(competitor: Competitor, apiKey: string) {
  const url = competitor.channelUrl;
  const cacheKey = `${competitor.id}:${url}`;
  const cached = channelIdCache.get(cacheKey);
  if (cached) return cached;

  const directChannelId = url.match(/youtube\.com\/channel\/([A-Za-z0-9_-]+)/)?.[1];
  if (directChannelId) {
    channelIdCache.set(cacheKey, directChannelId);
    return directChannelId;
  }

  const handle = url.match(/youtube\.com\/@([^/?#]+)/)?.[1];
  if (handle) {
    const decodedHandle = decodeURIComponent(handle);
    const channels = await youtubeGet<YouTubeChannelsResponse>(
      "channels",
      {
        part: "contentDetails",
        forHandle: decodedHandle,
        maxResults: 1
      },
      apiKey
    );
    const channelId = channels.items?.[0]?.id ?? "";
    if (channelId) {
      channelIdCache.set(cacheKey, channelId);
      return channelId;
    }

    return "";
  }

  const searchQuery = competitor.name;
  const search = await youtubeGet<YouTubeSearchResponse>(
    "search",
    {
      part: "snippet",
      type: "channel",
      maxResults: 1,
      q: searchQuery
    },
    apiKey
  );

  const channelId = search.items?.[0]?.id?.channelId ?? search.items?.[0]?.snippet?.channelId ?? "";
  if (channelId) channelIdCache.set(cacheKey, channelId);
  return channelId;
}

async function getUploadsPlaylistId(channelId: string, apiKey: string) {
  const cached = uploadsPlaylistCache.get(channelId);
  if (cached) return cached;

  const channels = await youtubeGet<YouTubeChannelsResponse>(
    "channels",
    {
      part: "contentDetails",
      id: channelId,
      maxResults: 1
    },
    apiKey
  );

  const playlistId = channels.items?.[0]?.contentDetails?.relatedPlaylists?.uploads ?? "";
  if (playlistId) uploadsPlaylistCache.set(channelId, playlistId);
  return playlistId;
}

async function getLatestVideoIds(playlistId: string, apiKey: string) {
  const playlist = await youtubeGet<YouTubePlaylistItemsResponse>(
    "playlistItems",
    {
      part: "snippet,contentDetails",
      playlistId,
      maxResults: 3
    },
    apiKey
  );

  return Array.from(
    new Set(
      (playlist.items ?? [])
        .map((item) => item.contentDetails?.videoId ?? item.snippet?.resourceId?.videoId ?? "")
        .filter(Boolean)
    )
  );
}

async function getVideoDetails(videoIds: string[], apiKey: string): Promise<RawPostInput[]> {
  const videos = await youtubeGet<YouTubeVideosResponse>(
    "videos",
    {
      part: "snippet,statistics,contentDetails",
      id: videoIds.join(","),
      maxResults: videoIds.length
    },
    apiKey
  );

  return (videos.items ?? []).map((video) => {
    const snippet = video.snippet;
    const statistics = video.statistics;
    const publishedAt = snippet?.publishedAt ? new Date(snippet.publishedAt) : new Date();
    const durationSeconds = parseIsoDurationToSeconds(video.contentDetails?.duration ?? "");

    return {
      platform: "youtube",
      postUrl: `https://www.youtube.com/watch?v=${video.id}`,
      title: snippet?.title ?? "Video YouTube chưa có tiêu đề",
      caption: snippet?.description ?? "",
      publishedAt,
      thumbnailUrl:
        snippet?.thumbnails?.maxres?.url ??
        snippet?.thumbnails?.high?.url ??
        snippet?.thumbnails?.medium?.url ??
        snippet?.thumbnails?.default?.url,
      format: durationSeconds > 0 && durationSeconds <= 90 ? "short_video" : "long_video",
      views: parseCount(statistics?.viewCount),
      likes: parseCount(statistics?.likeCount),
      comments: parseCount(statistics?.commentCount),
      shares: 0
    };
  });
}

function parseCount(value?: string) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseIsoDurationToSeconds(duration: string) {
  const match = duration.match(/^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!match) return 0;
  const [, days = "0", hours = "0", minutes = "0", seconds = "0"] = match;
  return Number(days) * 86400 + Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
}
