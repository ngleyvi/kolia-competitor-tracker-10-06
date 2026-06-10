import { OpenAITestPanel } from "@/components/OpenAITestPanel";
import { getOpenAIModel, isOpenAIConfigured } from "@/lib/openai";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-kolia-green">AI analysis sandbox</p>
        <h1 className="mt-2 text-3xl font-bold text-kolia-ink">Kiểm tra OpenAI Responses API</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Trang này gọi API route server-side, đọc OPENAI_API_KEY từ biến môi trường Vercel và dùng OpenAI Responses API
          để kiểm tra khả năng phân tích nội dung cho Kolia.
        </p>
      </div>

      <OpenAITestPanel configured={isOpenAIConfigured()} model={getOpenAIModel()} />
    </div>
  );
}
