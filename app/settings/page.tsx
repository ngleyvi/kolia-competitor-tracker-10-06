import { SettingsDataSourceForm } from "@/components/SettingsDataSourceForm";
import { prisma } from "@/lib/prisma";
import { getPublicSettings } from "@/lib/settings";

export default async function SettingsPage() {
  const [competitors, settings] = await Promise.all([
    prisma.competitor.findMany({ orderBy: [{ platform: "asc" }, { name: "asc" }] }),
    getPublicSettings()
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-kolia-green">Quản trị nguồn dữ liệu</p>
        <h1 className="mt-2 text-3xl font-bold text-kolia-ink">Cấu hình nguồn dữ liệu</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Quản lý đối thủ, nhập API key/token ở phía server và bật/tắt chế độ dữ liệu mô phỏng cho bản demo local.
        </p>
      </div>
      <SettingsDataSourceForm
        settings={settings}
        competitors={competitors.map((competitor) => ({
          ...competitor,
          createdAt: competitor.createdAt.toISOString(),
          updatedAt: competitor.updatedAt.toISOString()
        }))}
      />
    </div>
  );
}
