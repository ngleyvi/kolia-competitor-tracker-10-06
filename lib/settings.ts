import { prisma } from "@/lib/prisma";
import type { PublicSettings } from "@/lib/types";

const settingKeys = [
  "mockMode",
  "youtubeApiKey",
  "tiktokProviderUrl",
  "tiktokProviderToken",
  "metaGraphToken"
] as const;

export type SettingKey = (typeof settingKeys)[number];

export async function getSettingsMap() {
  const rows = await prisma.setting.findMany();
  const values = new Map<SettingKey, string>();
  for (const key of settingKeys) {
    values.set(key, "");
  }
  for (const row of rows) {
    if (settingKeys.includes(row.key as SettingKey)) {
      values.set(row.key as SettingKey, row.value);
    }
  }
  if (!values.get("mockMode")) values.set("mockMode", "true");
  return values;
}

export async function getPublicSettings(): Promise<PublicSettings> {
  const settings = await getSettingsMap();
  const envYoutubeApiKey = process.env.YOUTUBE_API_KEY?.trim();
  const storedYoutubeApiKey = settings.get("youtubeApiKey")?.trim();
  return {
    mockMode: settings.get("mockMode") !== "false",
    hasYoutubeApiKey: Boolean(envYoutubeApiKey || storedYoutubeApiKey),
    youtubeApiKeySource: envYoutubeApiKey ? "env" : storedYoutubeApiKey ? "database" : undefined,
    hasTikTokProvider: Boolean(settings.get("tiktokProviderUrl") && settings.get("tiktokProviderToken")),
    hasMetaGraphToken: Boolean(settings.get("metaGraphToken")),
    tiktokProviderUrl: settings.get("tiktokProviderUrl") || undefined
  };
}

export async function getServerYoutubeApiKey() {
  const envYoutubeApiKey = process.env.YOUTUBE_API_KEY?.trim();
  if (envYoutubeApiKey) return envYoutubeApiKey;

  const row = await prisma.setting.findUnique({ where: { key: "youtubeApiKey" } });
  return row?.value.trim() || "";
}

export async function updateSettings(input: Partial<Record<SettingKey, string | boolean>>) {
  const entries = Object.entries(input).filter(([, value]) => value !== undefined);
  await Promise.all(
    entries.map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        create: { key, value: String(value) },
        update: { value: String(value) }
      })
    )
  );
  return getPublicSettings();
}
