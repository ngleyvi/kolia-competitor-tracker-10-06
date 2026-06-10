"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PlugZap, Save, Trash2 } from "lucide-react";
import type { PublicSettings } from "@/lib/types";

type CompetitorForm = {
  id?: string;
  name: string;
  platform: string;
  source: string;
  segmentation: string;
  category: string;
  topicDescription: string;
  channelUrl: string;
  avatarUrl: string;
};

type CompetitorRow = {
  id: string;
  name: string;
  platform: string;
  source: string;
  segmentation: string | null;
  category: string;
  topicDescription: string | null;
  channelUrl: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

const emptyCompetitor: CompetitorForm = {
  name: "",
  platform: "youtube",
  source: "trong_nuoc",
  segmentation: "",
  category: "other",
  topicDescription: "",
  channelUrl: "",
  avatarUrl: ""
};

export function SettingsDataSourceForm({
  competitors,
  settings
}: {
  competitors: CompetitorRow[];
  settings: PublicSettings;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedId, setSelectedId] = useState("");
  const [form, setForm] = useState<CompetitorForm>(emptyCompetitor);
  const [settingsForm, setSettingsForm] = useState({
    mockMode: settings.mockMode,
    youtubeApiKey: "",
    tiktokProviderUrl: settings.tiktokProviderUrl ?? "",
    tiktokProviderToken: "",
    metaGraphToken: ""
  });
  const [status, setStatus] = useState("");

  const grouped = useMemo(
    () =>
      competitors.reduce<Record<string, CompetitorRow[]>>((acc, competitor) => {
        acc[competitor.platform] = acc[competitor.platform] ?? [];
        acc[competitor.platform].push(competitor);
        return acc;
      }, {}),
    [competitors]
  );

  const selectCompetitor = (id: string) => {
    setSelectedId(id);
    const competitor = competitors.find((item) => item.id === id);
    if (competitor) {
      setForm({
        id: competitor.id,
        name: competitor.name,
        platform: competitor.platform,
        source: competitor.source,
        segmentation: competitor.segmentation ?? "",
        category: competitor.category,
        topicDescription: competitor.topicDescription ?? "",
        channelUrl: competitor.channelUrl,
        avatarUrl: competitor.avatarUrl ?? ""
      });
    } else {
      setForm(emptyCompetitor);
    }
  };

  const saveCompetitor = () => {
    startTransition(async () => {
      const method = form.id ? "PUT" : "POST";
      const url = form.id ? `/api/competitors/${form.id}` : "/api/competitors";
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      setStatus(form.id ? "Đã cập nhật đối thủ" : "Đã thêm đối thủ mới");
      router.refresh();
    });
  };

  const deleteCompetitor = () => {
    if (!form.id) return;
    startTransition(async () => {
      await fetch(`/api/competitors/${form.id}`, { method: "DELETE" });
      setForm(emptyCompetitor);
      setSelectedId("");
      setStatus("Đã xóa đối thủ");
      router.refresh();
    });
  };

  const saveSettings = () => {
    startTransition(async () => {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsForm)
      });
      setStatus("Đã lưu cấu hình data sources");
      router.refresh();
    });
  };

  const testConnection = () => {
    startTransition(async () => {
      const response = await fetch("/api/settings/test", { method: "POST" });
      const result = await response.json();
      setStatus(
        result.checks
          .map((item: { name: string; status: string }) => `${item.name}: ${item.status}`)
          .join(" · ")
      );
    });
  };

  const inputClass = "mt-2 h-10 w-full rounded border border-kolia-line px-3 text-sm outline-none focus:border-kolia-green focus:ring-2 focus:ring-kolia-mint";

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
      <section className="rounded border border-kolia-line bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-kolia-ink">Danh sách đối thủ đang theo dõi</h2>
            <p className="text-sm text-slate-500">Seed sẵn theo YouTube, TikTok, Facebook; có thể thêm/sửa/xóa cho demo local.</p>
          </div>
          <select value={selectedId} onChange={(event) => selectCompetitor(event.target.value)} className="h-10 rounded border border-kolia-line px-3 text-sm">
            <option value="">Thêm đối thủ mới</option>
            {competitors.map((competitor) => (
              <option key={competitor.id} value={competitor.id}>
                {competitor.platform} · {competitor.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          {Object.entries(grouped).map(([platform, rows]) => (
            <div key={platform} className="rounded border border-kolia-line bg-slate-50 p-4">
              <h3 className="font-bold capitalize text-kolia-ink">{platform}</h3>
              <div className="mt-3 space-y-2">
                {rows.map((competitor) => (
                  <button
                    type="button"
                    key={competitor.id}
                    onClick={() => selectCompetitor(competitor.id ?? "")}
                    className="block w-full rounded border border-transparent bg-white p-3 text-left text-sm hover:border-kolia-green"
                  >
                    <span className="font-semibold text-kolia-ink">{competitor.name}</span>
                    <span className="mt-1 block text-xs text-slate-500">{competitor.source} · {competitor.category}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded border border-kolia-line bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-kolia-ink">{form.id ? "Sửa đối thủ" : "Thêm đối thủ"}</h2>
        <div className="mt-4 space-y-4">
          <Field label="Tên đối thủ" value={form.name} onChange={(value) => setForm({ ...form, name: value })} className={inputClass} />
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm font-semibold text-slate-700">
              Nền tảng
              <select value={form.platform} onChange={(event) => setForm({ ...form, platform: event.target.value })} className={inputClass}>
                <option value="youtube">YouTube</option>
                <option value="tiktok">TikTok</option>
                <option value="facebook">Facebook</option>
              </select>
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Nguồn
              <select value={form.source} onChange={(event) => setForm({ ...form, source: event.target.value })} className={inputClass}>
                <option value="trong_nuoc">Trong nước</option>
                <option value="nuoc_ngoai">Nước ngoài</option>
              </select>
            </label>
          </div>
          <Field label="Segmentation" value={form.segmentation} onChange={(value) => setForm({ ...form, segmentation: value })} className={inputClass} />
          <Field label="Category" value={form.category} onChange={(value) => setForm({ ...form, category: value })} className={inputClass} />
          <Field label="Topic description" value={form.topicDescription} onChange={(value) => setForm({ ...form, topicDescription: value })} className={inputClass} />
          <Field label="Channel URL" value={form.channelUrl} onChange={(value) => setForm({ ...form, channelUrl: value })} className={inputClass} />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={saveCompetitor}
              disabled={isPending || !form.name || !form.channelUrl}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded bg-kolia-green px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              Lưu
            </button>
            <button
              type="button"
              onClick={deleteCompetitor}
              disabled={isPending || !form.id}
              className="inline-flex items-center justify-center rounded border border-red-200 px-4 py-2 text-sm font-bold text-red-700 disabled:opacity-40"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-8 border-t border-kolia-line pt-5">
          <h2 className="text-lg font-bold text-kolia-ink">API keys / provider tokens</h2>
          <p className="mt-1 text-sm text-slate-500">Token được gửi lên API route server-side, không hardcode vào frontend.</p>
          <div className="mt-4 space-y-4">
            <label className="flex items-center gap-3 rounded border border-kolia-line p-3 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={settingsForm.mockMode}
                onChange={(event) => setSettingsForm({ ...settingsForm, mockMode: event.target.checked })}
              />
                Bật chế độ dữ liệu mô phỏng
            </label>
            <Field label="YouTube API key" type="password" value={settingsForm.youtubeApiKey} onChange={(value) => setSettingsForm({ ...settingsForm, youtubeApiKey: value })} className={inputClass} placeholder={settings.hasYoutubeApiKey ? "Đã lưu key" : "Chưa cấu hình"} />
            <Field label="TikTok data provider URL" value={settingsForm.tiktokProviderUrl} onChange={(value) => setSettingsForm({ ...settingsForm, tiktokProviderUrl: value })} className={inputClass} />
            <Field label="TikTok data provider token" type="password" value={settingsForm.tiktokProviderToken} onChange={(value) => setSettingsForm({ ...settingsForm, tiktokProviderToken: value })} className={inputClass} placeholder={settings.hasTikTokProvider ? "Đã lưu token" : "Chưa cấu hình"} />
            <Field label="Meta Graph API token" type="password" value={settingsForm.metaGraphToken} onChange={(value) => setSettingsForm({ ...settingsForm, metaGraphToken: value })} className={inputClass} placeholder={settings.hasMetaGraphToken ? "Đã lưu token" : "Chưa cấu hình"} />
            <div className="flex gap-2">
              <button type="button" onClick={saveSettings} disabled={isPending} className="flex-1 rounded bg-kolia-ink px-4 py-2 text-sm font-bold text-white">
                Lưu cấu hình
              </button>
              <button type="button" onClick={testConnection} disabled={isPending} className="inline-flex items-center gap-2 rounded border border-kolia-line px-4 py-2 text-sm font-bold text-kolia-ink">
                <PlugZap className="h-4 w-4" />
                Test Connection
              </button>
            </div>
            {status ? <p className="rounded bg-kolia-mint p-3 text-sm font-semibold text-kolia-green">{status}</p> : null}
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  className,
  type = "text",
  placeholder
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className={className} placeholder={placeholder} />
    </label>
  );
}
