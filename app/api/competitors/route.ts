import { NextResponse } from "next/server";
import { createDemoCompetitor, getDemoCompetitors, isPublicDemoRuntime } from "@/lib/demoData";
import { prisma } from "@/lib/prisma";

export async function GET() {
  if (isPublicDemoRuntime()) {
    return NextResponse.json({ competitors: getDemoCompetitors() });
  }

  const competitors = await prisma.competitor.findMany({
    orderBy: [{ platform: "asc" }, { source: "asc" }, { name: "asc" }]
  });
  return NextResponse.json({ competitors });
}

export async function POST(request: Request) {
  const body = await request.json();
  if (isPublicDemoRuntime()) {
    const competitor = createDemoCompetitor({
      name: body.name,
      platform: body.platform,
      source: body.source,
      segmentation: body.segmentation || null,
      category: body.category || "other",
      topicDescription: body.topicDescription || null,
      channelUrl: body.channelUrl,
      avatarUrl: body.avatarUrl || null
    });
    return NextResponse.json({ competitor }, { status: 201 });
  }

  const competitor = await prisma.competitor.create({
    data: {
      name: body.name,
      platform: body.platform,
      source: body.source,
      segmentation: body.segmentation || null,
      category: body.category || "other",
      topicDescription: body.topicDescription || null,
      channelUrl: body.channelUrl,
      avatarUrl: body.avatarUrl || null
    }
  });
  return NextResponse.json({ competitor }, { status: 201 });
}
