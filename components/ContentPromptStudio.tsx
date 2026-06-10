"use client";

import { useMemo, useState, useTransition } from "react";
import {
  BarChart3,
  Check,
  Clipboard,
  Copy,
  FileText,
  Loader2,
  MessagesSquare,
  Music2,
  Send,
  Sparkles,
  Youtube
} from "lucide-react";
import type { Platform } from "@/lib/types";

type GapData = {
  commonTopics: string[];
  repeatedTopics: string[];
  underusedHighEngagement: string[];
  gaps: string[];
  suggestions: string[];
};

type FormulaData = {
  title: string;
  competitor: string;
  format: string;
  sourceUrl: string;
  formula: string;
  vietnamized: string;
};

type LessonPost = {
  title: string;
  competitor: string;
  platform: Platform;
  contentPillar: string;
  hookType: string;
  toneOfVoice: string;
  mainTopic: string;
  sourceUrl: string;
};

type OpenAIResponse = {
  ok?: boolean;
  outputText?: string;
  responseId?: string;
  model?: string;
  error?: string;
  setup?: string;
};

const platformOptions: Array<{ value: Platform; label: string; icon: typeof Youtube; intent: string }> = [
  {
    value: "youtube",
    label: "YouTube",
    icon: Youtube,
    intent: "Kịch bản video phân tích có luận điểm, timeline rõ, title và thumbnail đủ dùng cho production."
  },
  {
    value: "tiktok",
    label: "TikTok",
    icon: Music2,
    intent: "Kịch bản video ngắn, mở hook nhanh, dễ dựng, có CTA theo dõi/cộng đồng."
  },
  {
    value: "facebook",
    label: "Facebook",
    icon: MessagesSquare,
    intent: "Bài fanpage/carousel/livestream post có góc nhìn chuyên gia và CTA mềm."
  }
];

const marketContextDefault =
  "Bối cảnh cần đưa vào: dữ liệu CPI/Fed, lãi suất, biến động giá vàng/crypto/VN-Index, tâm lý FOMO của nhà đầu tư cá nhân. Không đưa khuyến nghị mua/bán cá nhân.";

export function ContentPromptStudio({
  configured,
  model,
  domestic,
  formulas,
  lessonPosts
}: {
  configured: boolean;
  model: string;
  domestic: GapData;
  formulas: FormulaData[];
  lessonPosts: LessonPost[];
}) {
  const [platform, setPlatform] = useState<Platform>("youtube");
  const [selectedGaps, setSelectedGaps] = useState<string[]>(() => domestic.gaps.slice(0, 2));
  const [selectedLessons, setSelectedLessons] = useState<string[]>(() =>
    lessonPosts.slice(0, 3).map((post) => post.title)
  );
  const [marketContext, setMarketContext] = useState(marketContextDefault);
  const [prompt, setPrompt] = useState("");
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<OpenAIResponse | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedPlatform = platformOptions.find((item) => item.value === platform) ?? platformOptions[0];
  const relevantLessons = useMemo(
    () => lessonPosts.filter((post) => post.platform === platform || platform === "youtube").slice(0, 8),
    [lessonPosts, platform]
  );
  const relevantFormula = formulas[0];

  const toggle = (value: string, list: string[], setList: (next: string[]) => void) => {
    setList(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  };

  const generatePrompt = () => {
    const nextPrompt = buildPrompt({
      platform,
      marketContext,
      selectedGaps,
      selectedLessons: lessonPosts.filter((post) => selectedLessons.includes(post.title)),
      formula: relevantFormula
    });
    setPrompt(nextPrompt);
    setResult(null);
  };

  const copyPrompt = async () => {
    const text = prompt || buildPrompt({
      platform,
      marketContext,
      selectedGaps,
      selectedLessons: lessonPosts.filter((post) => selectedLessons.includes(post.title)),
      formula: relevantFormula
    });
    await navigator.clipboard.writeText(text);
    setPrompt(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const submitPrompt = () => {
    const text = prompt.trim();
    if (!text) return;
    setResult(null);
    startTransition(async () => {
      try {
        const response = await fetch("/api/openai/test", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: text })
        });
        const payload = (await response.json()) as OpenAIResponse;
        setResult(payload);
      } catch (error) {
        setResult({ error: error instanceof Error ? error.message : "Không thể gọi API tạo bản nháp." });
      }
    });
  };

  return (
    <div className="space-y-6">
      <section className="border-b border-kolia-line pb-5">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-kolia-green">Content prompt studio</p>
        <h1 className="mt-2 max-w-4xl text-3xl font-bold leading-tight text-kolia-ink">
          Biến insight đối thủ thành prompt sản xuất nội dung cho Kolia
        </h1>
        <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-600">
          Trang này dùng cho bước sau nghiên cứu: chọn khoảng trống nội dung, chọn bài học từ đối thủ, sau đó tạo prompt
          để viết kịch bản YouTube, TikTok hoặc Facebook theo giọng chuyên gia tài chính trung lập, không khuyến nghị đầu tư cá nhân.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[390px_1fr]">
        <aside className="space-y-4">
          <section className="rounded border border-kolia-line bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded bg-kolia-mint text-kolia-green">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-bold text-kolia-ink">1. Chọn kênh triển khai</h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">Mỗi kênh có cấu trúc prompt và đầu ra khác nhau.</p>
              </div>
            </div>
            <div className="mt-4 grid gap-2">
              {platformOptions.map((item) => {
                const Icon = item.icon;
                const active = platform === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setPlatform(item.value)}
                    className={`rounded border p-3 text-left transition ${
                      active ? "border-kolia-green bg-kolia-mint text-kolia-ink" : "border-kolia-line bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="flex items-center gap-2 font-bold">
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </span>
                    <span className="mt-1 block text-xs leading-5">{item.intent}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded border border-kolia-line bg-white p-5 shadow-sm">
            <h2 className="font-bold text-kolia-ink">2. Chọn khoảng trống nội dung</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">Ưu tiên các khoảng trống có khả năng tạo khác biệt cho Kolia.</p>
            <div className="mt-4 space-y-2">
              {[...domestic.gaps, ...domestic.underusedHighEngagement, ...domestic.suggestions].slice(0, 10).map((item) => (
                <ToggleRow
                  key={item}
                  label={item}
                  checked={selectedGaps.includes(item)}
                  onClick={() => toggle(item, selectedGaps, setSelectedGaps)}
                />
              ))}
            </div>
          </section>
        </aside>

        <main className="space-y-4">
          <section className="rounded border border-kolia-line bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="font-bold text-kolia-ink">3. Chọn bài học từ nội dung đối thủ</h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Chọn các pattern đáng học: hook, chủ đề, tone, cách giải thích hoặc công thức nội dung.
                </p>
              </div>
              <span className="rounded bg-kolia-amber px-3 py-2 text-xs font-bold text-kolia-gold">
                {selectedLessons.length} bài học đã chọn
              </span>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {relevantLessons.map((post) => (
                <button
                  key={`${post.platform}-${post.title}`}
                  type="button"
                  onClick={() => toggle(post.title, selectedLessons, setSelectedLessons)}
                  className={`rounded border p-4 text-left transition ${
                    selectedLessons.includes(post.title)
                      ? "border-kolia-green bg-kolia-mint"
                      : "border-kolia-line bg-slate-50 hover:bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-bold leading-6 text-kolia-ink">{post.title}</p>
                    {selectedLessons.includes(post.title) ? <Check className="h-4 w-4 shrink-0 text-kolia-green" /> : null}
                  </div>
                  <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-kolia-gold">
                    {post.competitor} · {post.platform}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {post.hookType} · {post.contentPillar} · {post.toneOfVoice}
                  </p>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded border border-kolia-line bg-white p-5 shadow-sm">
            <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
              <div>
                <label className="block">
                  <span className="font-bold text-kolia-ink">Bối cảnh thời sự/thị trường cần đưa vào</span>
                  <textarea
                    value={marketContext}
                    onChange={(event) => setMarketContext(event.target.value)}
                    rows={4}
                    className="mt-2 w-full rounded border border-kolia-line p-3 text-sm leading-6 outline-none focus:border-kolia-green focus:ring-2 focus:ring-kolia-mint"
                  />
                </label>
              </div>
              <div className="rounded border border-kolia-line bg-slate-50 p-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-kolia-green" />
                  <h3 className="font-bold text-kolia-ink">Công thức tham chiếu</h3>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {relevantFormula?.formula ?? "Hook → Market tension → Simple explanation → Visual proof → CTA"}
                </p>
                {relevantFormula?.sourceUrl ? (
                  <a href={relevantFormula.sourceUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm font-bold text-kolia-green">
                    Xem ví dụ đối thủ
                  </a>
                ) : null}
              </div>
            </div>
          </section>

          <section className="rounded border border-kolia-line bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-kolia-ink">Prompt có thể chỉnh sửa</h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Bấm Generate để tạo prompt theo {selectedPlatform.label}, sau đó chỉnh tay nếu cần rồi copy.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={generatePrompt}
                  className="inline-flex items-center gap-2 rounded bg-kolia-green px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700"
                >
                  <FileText className="h-4 w-4" />
                  Generate
                </button>
                <button
                  type="button"
                  onClick={copyPrompt}
                  className="inline-flex items-center gap-2 rounded border border-kolia-line bg-white px-4 py-2 text-sm font-bold text-kolia-ink hover:bg-kolia-mint"
                >
                  {copied ? <Check className="h-4 w-4 text-kolia-green" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Đã copy" : "Copy prompt"}
                </button>
                <button
                  type="button"
                  onClick={submitPrompt}
                  disabled={!configured || isPending || !prompt.trim()}
                  className="inline-flex items-center gap-2 rounded bg-kolia-ink px-4 py-2 text-sm font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Tạo bản nháp AI
                </button>
              </div>
            </div>
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              rows={18}
              placeholder="Bấm Generate để tạo prompt theo insight đã chọn."
              className="mt-4 w-full rounded border border-kolia-line bg-slate-50 p-4 font-mono text-sm leading-6 outline-none focus:border-kolia-green focus:ring-2 focus:ring-kolia-mint"
            />
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Model cấu hình: <strong>{model}</strong>. API key chỉ dùng ở server. Nếu chưa muốn gọi AI, chỉ cần copy prompt và chỉnh tiếp.
            </p>
          </section>

          {result ? (
            <section className="rounded border border-kolia-line bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <Clipboard className="h-5 w-5 text-kolia-green" />
                <h2 className="font-bold text-kolia-ink">Bản nháp từ AI</h2>
              </div>
              {result.error ? (
                <div className="mt-4 rounded border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">
                  <p className="font-bold">Không tạo được bản nháp</p>
                  <p className="mt-2">{result.error}</p>
                  {result.setup ? <p className="mt-2">{result.setup}</p> : null}
                </div>
              ) : (
                <div className="mt-4 whitespace-pre-wrap rounded bg-kolia-mint p-4 text-sm leading-7 text-kolia-ink">
                  {result.outputText}
                </div>
              )}
            </section>
          ) : null}
        </main>
      </div>
    </div>
  );
}

function ToggleRow({ label, checked, onClick }: { label: string; checked: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-start gap-3 rounded border p-3 text-left text-sm leading-6 transition ${
        checked ? "border-kolia-green bg-kolia-mint text-kolia-ink" : "border-kolia-line bg-slate-50 text-slate-600 hover:bg-white"
      }`}
    >
      <span className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${checked ? "border-kolia-green bg-kolia-green text-white" : "border-slate-300"}`}>
        {checked ? <Check className="h-3 w-3" /> : null}
      </span>
      <span>{label}</span>
    </button>
  );
}

function buildPrompt({
  platform,
  marketContext,
  selectedGaps,
  selectedLessons,
  formula
}: {
  platform: Platform;
  marketContext: string;
  selectedGaps: string[];
  selectedLessons: LessonPost[];
  formula?: FormulaData;
}) {
  const lessonsText = selectedLessons.length
    ? selectedLessons
        .map(
          (post, index) =>
            `${index + 1}. ${post.title} | Đối thủ: ${post.competitor} | Kênh: ${post.platform} | Hook: ${post.hookType} | Trụ cột: ${post.contentPillar} | Tone: ${post.toneOfVoice} | Link: ${post.sourceUrl}`
        )
        .join("\n")
    : "Chưa chọn bài học cụ thể, hãy dùng các pattern chung từ đối thủ cùng ngành.";

  const gapsText = selectedGaps.length ? selectedGaps.map((item, index) => `${index + 1}. ${item}`).join("\n") : "Chưa chọn khoảng trống cụ thể.";
  const formulaText = formula?.formula ?? "Hook → Market tension → Simple explanation → Visual proof → Risk note → Soft CTA";

  const channelOutput =
    platform === "youtube"
      ? `Hãy tạo output cho YouTube gồm:
1. Topic video và luận điểm trung tâm.
2. Tin tức thời sự/thị trường nên đưa vào, nêu rõ dữ liệu nào cần kiểm chứng trước khi sản xuất.
3. Công thức nội dung tạo lan tỏa dựa trên pattern: ${formulaText}.
4. Kịch bản timeline chi tiết: 0-15s hook, 15-60s market tension, 1-3 phút giải thích, 3-6 phút bằng chứng/chart, 6-8 phút kịch bản thị trường, 8-10 phút lưu ý rủi ro và CTA mềm.
5. 5 title đề xuất, không giật tít quá mức.
6. Thiết kế thumbnail: bố cục, text ngắn, hình ảnh/chỉ báo/chart nên dùng, màu sắc phù hợp thương hiệu tài chính giáo dục.
7. CTA phù hợp: theo dõi kênh, tham gia webinar/cộng đồng học tập, không khuyến nghị mua/bán cá nhân.`
      : platform === "tiktok"
        ? `Hãy tạo output cho TikTok gồm:
1. Big idea video 45-60 giây.
2. Hook 0-3 giây, nêu đúng nỗi đau hoặc câu hỏi của nhà đầu tư.
3. Script từng cảnh: 0-3s, 3-12s, 12-35s, 35-50s, 50-60s.
4. Visual gợi ý: chart, text overlay, B-roll, biểu cảm, cut nhanh.
5. Caption, hashtag, CTA theo dõi/cộng đồng.
6. 5 title/on-screen hook có thể test A/B.`
        : `Hãy tạo output cho Facebook gồm:
1. Góc bài viết fanpage hoặc carousel.
2. Mở bài chuyên gia, không FOMO.
3. Dàn ý carousel 6-8 slide hoặc bài post 700-900 chữ.
4. CTA mềm cho webinar/cộng đồng/checklist.
5. Gợi ý visual thumbnail/cover post.
6. 3 biến thể headline và caption.`;

  return `Bạn là chiến lược gia nội dung tài chính cho Kolia Phan tại Việt Nam.

Bối cảnh thương hiệu:
- Kolia Phan là cộng đồng đào tạo và chia sẻ kiến thức đầu tư tài chính.
- Nội dung phải mang tinh thần giáo dục, minh bạch, trung lập.
- Không được trình bày như khuyến nghị đầu tư cá nhân, không hứa lợi nhuận, không kích thích FOMO quá mức.

Kênh cần triển khai: ${platform.toUpperCase()}.

Bối cảnh thời sự/thị trường cần đưa vào:
${marketContext}

Khoảng trống nội dung đã chọn:
${gapsText}

Bài học từ nội dung đối thủ:
${lessonsText}

Công thức nội dung tham chiếu:
${formulaText}

Yêu cầu đầu ra:
${channelOutput}

Phong cách viết:
- Dùng ngôn ngữ của chuyên gia phân tích đầu tư: rõ nghĩa, có luận điểm, có điều kiện, có dữ liệu cần kiểm chứng.
- Tránh văn phong AI chung chung.
- Mỗi đề xuất phải có lý do vì sao phù hợp với Kolia và rủi ro cần tránh.
- Nếu dùng tin tức thị trường, hãy ghi rõ phần nào cần researcher kiểm chứng lại nguồn trước khi đăng.`;
}
