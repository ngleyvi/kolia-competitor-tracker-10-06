import { NextResponse } from "next/server";
import { syncCompetitorData } from "@/lib/sync";
import type { Platform } from "@/lib/types";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const result = await syncCompetitorData(body.platform as Platform | undefined);
  return NextResponse.json(result);
}
