import { NextResponse } from "next/server";
import { getPublicSettings, updateSettings } from "@/lib/settings";

export async function GET() {
  return NextResponse.json(await getPublicSettings());
}

export async function PUT(request: Request) {
  const body = await request.json();
  const updated = await updateSettings({
    mockMode: Boolean(body.mockMode),
    youtubeApiKey: body.youtubeApiKey,
    tiktokProviderUrl: body.tiktokProviderUrl,
    tiktokProviderToken: body.tiktokProviderToken,
    metaGraphToken: body.metaGraphToken
  });
  return NextResponse.json(updated);
}
