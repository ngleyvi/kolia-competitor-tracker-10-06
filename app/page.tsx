import { Activity, BarChart3, Database, Users } from "lucide-react";
import { CompetitorTable } from "@/components/CompetitorTable";
import { ContentPillarChart } from "@/components/ContentPillarChart";
import { FilterBar } from "@/components/FilterBar";
import { MetricCard } from "@/components/MetricCard";
import { PlatformEffectivenessBubbleChart } from "@/components/PlatformEffectivenessBubbleChart";
import { PostTable } from "@/components/PostTable";
import { TopPostCard } from "@/components/TopPostCard";
import { getOverviewAnalytics, parseAnalyticsFilters } from "@/lib/analytics";
import { formatNumber, formatPercent } from "@/lib/utils";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

export default async function DashboardPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const filters = parseAnalyticsFilters(params);
  const analytics = await getOverviewAnalytics(filters);

  return (
    <div className="space-y-6">
      <section className="financial-grid overflow-hidden rounded border border-kolia-line bg-white p-6 shadow-sm">
        <div className="max-w-4xl">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-kolia-green">Bảng phân tích đối thủ</p>
          <h1 className="mt-3 text-3xl font-bold text-kolia-ink md:text-4xl">Kolia Competitor Intelligence Tracker</h1>
          <p className="mt-3 text-base leading-7 text-slate-600">
            Theo dõi đối thủ trên YouTube, TikTok và Facebook; tự phân loại trụ cột nội dung, nhóm CTA/ưu đãi, sắc thái truyền thông, kiểu mở đầu và tạo gợi ý khoảng trống nội dung cho Kolia Phan.
          </p>
        </div>
      </section>

      <FilterBar filters={filters} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Tổng số đối thủ" value={formatNumber(analytics.totalCompetitors)} detail="Các kênh đang được đưa vào phạm vi theo dõi." icon={<Users className="h-5 w-5" />} />
        <MetricCard title="Tổng bài/video" value={formatNumber(analytics.totalPosts)} detail="Có link gốc, metric và phân loại tự động." icon={<Database className="h-5 w-5" />} />
        <MetricCard title="Tỷ lệ tương tác bình quân" value={formatPercent(analytics.avgEngagement)} detail="Tính theo lượt thích, bình luận và chia sẻ trên lượt xem." icon={<BarChart3 className="h-5 w-5" />} />
        <MetricCard title="Tổng tương tác" value={formatNumber(analytics.totalInteractions)} detail="Tổng lượt thích, bình luận và chia sẻ trong phạm vi lọc." icon={<Activity className="h-5 w-5" />} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ContentPillarChart data={analytics.topPillars} />
        <PlatformEffectivenessBubbleChart data={analytics.platformEffectiveness} />
      </div>

      <section className="rounded border border-kolia-line bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-kolia-ink">10 nội dung có tỷ lệ tương tác cao nhất</h2>
            <p className="text-sm text-slate-500">Ưu tiên theo tỷ lệ tương tác, điểm lan tỏa và quy mô phản hồi của thị trường.</p>
          </div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {analytics.topPosts.map((post, index) => (
            <TopPostCard key={post.id} post={post} rank={index + 1} />
          ))}
        </div>
      </section>

      <CompetitorTable summaries={analytics.competitorSummaries} />
      <PostTable posts={analytics.weeklyActivities} title="Đối thủ đang làm gì tuần này/tháng này" />
    </div>
  );
}
