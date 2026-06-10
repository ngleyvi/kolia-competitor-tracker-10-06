import { ContentGapPanel } from "@/components/ContentGapPanel";
import { FilterBar } from "@/components/FilterBar";
import { ViralFormulaCard } from "@/components/ViralFormulaCard";
import { getContentGapAnalytics, parseAnalyticsFilters } from "@/lib/analytics";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

export default async function ContentGapPage({ searchParams }: PageProps) {
  const filters = parseAnalyticsFilters((await searchParams) ?? {});
  const gap = await getContentGapAnalytics(filters);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-kolia-green">Báo cáo chiến lược nội dung</p>
        <h1 className="mt-2 text-3xl font-bold text-kolia-ink">Khoảng trống nội dung</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Report chia thành đối thủ trong nước và nước ngoài, giúp Kolia chọn tuyến nội dung/chương trình có thể khai thác mà vẫn trung lập, giáo dục và minh bạch.
        </p>
      </div>
      <FilterBar filters={filters} />
      <ContentGapPanel domestic={gap.domestic} />
      <section className="rounded border border-kolia-line bg-white p-5 shadow-sm">
        <h2 className="text-base font-bold text-kolia-ink">B. Đối thủ nước ngoài: cấu trúc nội dung tạo lan tỏa có thể Việt hóa</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {gap.foreign.shortForm.slice(0, 3).map((formula) => (
            <ViralFormulaCard key={formula.sourceUrl} formula={formula} label="Video ngắn hiệu quả" />
          ))}
          {gap.foreign.longForm.slice(0, 3).map((formula) => (
            <ViralFormulaCard key={formula.sourceUrl} formula={formula} label="Video phân tích dài hiệu quả" />
          ))}
        </div>
        <div className="mt-5 rounded bg-kolia-amber p-4">
          <h3 className="font-bold text-kolia-ink">Định dạng triển khai phù hợp với Kolia</h3>
          <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-700 md:grid-cols-2">
            {gap.foreign.koliaFormats.map((format) => (
              <li key={format} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-kolia-gold" />
                {format}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
