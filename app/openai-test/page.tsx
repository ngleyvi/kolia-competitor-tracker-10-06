import { ContentPromptStudio } from "@/components/ContentPromptStudio";
import { getContentGapAnalytics, getOverviewAnalytics } from "@/lib/analytics";
import { getOpenAIModel, isOpenAIConfigured } from "@/lib/openai";
import type { Platform } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ContentPromptStudioPage() {
  const [gap, overview] = await Promise.all([
    getContentGapAnalytics({ days: 90 }),
    getOverviewAnalytics({ days: 90 })
  ]);

  const lessonPosts = overview.topPosts.slice(0, 18).map((post) => ({
    title: post.title,
    competitor: post.competitor.name,
    platform: post.platform as Platform,
    contentPillar: post.contentPillar,
    hookType: post.hookType,
    toneOfVoice: post.toneOfVoice,
    mainTopic: post.mainTopic,
    sourceUrl: post.postUrl
  }));

  const formulas = [...gap.foreign.shortForm, ...gap.foreign.longForm].slice(0, 6);

  return (
    <ContentPromptStudio
      configured={isOpenAIConfigured()}
      model={getOpenAIModel()}
      domestic={gap.domestic}
      formulas={formulas}
      lessonPosts={lessonPosts}
    />
  );
}
