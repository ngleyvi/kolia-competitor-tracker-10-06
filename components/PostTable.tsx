import type { PostWithCompetitor } from "@/lib/analytics";
import { formatLabels, platformLabels } from "@/lib/constants";
import { formatDate, formatNumber, formatPercent, getPlatformBadgeClass } from "@/lib/utils";

export function PostTable({ posts, title = "Bài/video nổi bật theo trụ cột nội dung" }: { posts: PostWithCompetitor[]; title?: string }) {
  return (
    <div className="overflow-hidden rounded border border-kolia-line bg-white shadow-sm">
      <div className="border-b border-kolia-line px-5 py-4">
        <h2 className="text-base font-bold text-kolia-ink">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[1180px] divide-y divide-kolia-line text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
              <th className="px-5 py-3">Bài/video</th>
              <th className="px-5 py-3">Đối thủ</th>
              <th className="px-5 py-3">Phân loại</th>
              <th className="px-5 py-3">Hook/Tone</th>
              <th className="px-5 py-3 text-right">Lượt xem</th>
              <th className="px-5 py-3 text-right">Like</th>
              <th className="px-5 py-3 text-right">Comment</th>
              <th className="px-5 py-3 text-right">Share</th>
              <th className="px-5 py-3 text-right">Tỷ lệ tương tác</th>
              <th className="px-5 py-3">Ngày</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-kolia-line">
            {posts.map((post) => (
              <tr key={post.id} className="align-top hover:bg-kolia-mint/35">
                <td className="max-w-[330px] px-5 py-4">
                  <a href={post.postUrl} target="_blank" rel="noreferrer" className="font-semibold text-kolia-ink hover:text-kolia-green">
                    {post.title}
                  </a>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{post.caption}</p>
                </td>
                <td className="px-5 py-4">
                  <p className="font-semibold text-slate-800">{post.competitor.name}</p>
                  <span className={`mt-2 inline-flex rounded px-2 py-1 text-xs font-bold ring-1 ${getPlatformBadgeClass(post.platform)}`}>
                    {platformLabels[post.platform as keyof typeof platformLabels]}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <p className="font-medium text-slate-800">{post.contentPillar}</p>
                  <p className="mt-1 text-xs text-slate-500">{formatLabels[post.format] ?? post.format} · {post.promotionType}</p>
                  <p className="mt-1 text-xs text-kolia-green">{post.mainTopic}</p>
                </td>
                <td className="px-5 py-4">
                  <p className="font-medium text-slate-800">{post.hookType}</p>
                  <p className="mt-1 text-xs text-slate-500">{post.toneOfVoice}</p>
                </td>
                <td className="px-5 py-4 text-right">{formatNumber(post.views)}</td>
                <td className="px-5 py-4 text-right">{formatNumber(post.likes)}</td>
                <td className="px-5 py-4 text-right">{formatNumber(post.comments)}</td>
                <td className="px-5 py-4 text-right">{formatNumber(post.shares)}</td>
                <td className="px-5 py-4 text-right font-bold text-kolia-green">{formatPercent(post.engagementRate)}</td>
                <td className="px-5 py-4 text-slate-600">{formatDate(post.publishedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
