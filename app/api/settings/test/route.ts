import { NextResponse } from "next/server";
import { getPublicSettings } from "@/lib/settings";

export async function POST() {
  const settings = await getPublicSettings();
  return NextResponse.json({
    ok: true,
    mockMode: settings.mockMode,
    checks: [
      {
        name: "YouTube Data API v3",
        status: settings.hasYoutubeApiKey && !settings.mockMode ? `sẵn sàng (${settings.youtubeApiKeySource})` : "dùng dữ liệu mô phỏng"
      },
      {
        name: "TikTok provider",
        status: settings.hasTikTokProvider && !settings.mockMode ? "sẵn sàng" : "chưa cấu hình"
      },
      {
        name: "Meta Graph API",
        status: settings.hasMetaGraphToken && !settings.mockMode ? "sẵn sàng" : "chưa cấu hình"
      }
    ]
  });
}
