import { NextResponse } from "next/server";
import { deleteDemoCompetitor, isPublicDemoRuntime, updateDemoCompetitor } from "@/lib/demoData";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.json();
  if (isPublicDemoRuntime()) {
    const competitor = updateDemoCompetitor(id, {
      name: body.name,
      platform: body.platform,
      source: body.source,
      segmentation: body.segmentation || null,
      category: body.category || "other",
      topicDescription: body.topicDescription || null,
      channelUrl: body.channelUrl,
      avatarUrl: body.avatarUrl || null
    });
    if (!competitor) return NextResponse.json({ error: "Competitor not found" }, { status: 404 });
    return NextResponse.json({ competitor });
  }

  const competitor = await prisma.competitor.update({
    where: { id },
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
  return NextResponse.json({ competitor });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  if (isPublicDemoRuntime()) {
    deleteDemoCompetitor(id);
    return NextResponse.json({ ok: true });
  }

  await prisma.competitor.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
