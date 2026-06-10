import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";

const prismaDir = join(process.cwd(), "prisma");
mkdirSync(prismaDir, { recursive: true });

const db = new DatabaseSync(join(prismaDir, "dev.db"));

db.exec(`
PRAGMA foreign_keys = OFF;

DROP TABLE IF EXISTS "Post";
DROP TABLE IF EXISTS "InsightReport";
DROP TABLE IF EXISTS "Setting";
DROP TABLE IF EXISTS "Competitor";

CREATE TABLE "Competitor" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "platform" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "segmentation" TEXT,
  "category" TEXT NOT NULL,
  "topicDescription" TEXT,
  "channelUrl" TEXT NOT NULL,
  "avatarUrl" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "Post" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "competitorId" TEXT NOT NULL,
  "platform" TEXT NOT NULL,
  "postUrl" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "caption" TEXT NOT NULL,
  "publishedAt" DATETIME NOT NULL,
  "thumbnailUrl" TEXT,
  "format" TEXT NOT NULL,
  "contentPillar" TEXT NOT NULL,
  "promotionType" TEXT NOT NULL,
  "toneOfVoice" TEXT NOT NULL,
  "hookType" TEXT NOT NULL,
  "mainTopic" TEXT NOT NULL,
  "views" INTEGER NOT NULL DEFAULT 0,
  "likes" INTEGER NOT NULL DEFAULT 0,
  "comments" INTEGER NOT NULL DEFAULT 0,
  "shares" INTEGER NOT NULL DEFAULT 0,
  "engagementRate" REAL NOT NULL DEFAULT 0,
  "viralityScore" REAL NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "Post_competitorId_fkey" FOREIGN KEY ("competitorId") REFERENCES "Competitor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "InsightReport" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "platform" TEXT NOT NULL,
  "periodStart" DATETIME NOT NULL,
  "periodEnd" DATETIME NOT NULL,
  "summary" TEXT NOT NULL,
  "topFormats" TEXT NOT NULL,
  "topTopics" TEXT NOT NULL,
  "contentGaps" TEXT NOT NULL,
  "suggestedContentLines" TEXT NOT NULL,
  "suggestedPrograms" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Setting" (
  "key" TEXT NOT NULL PRIMARY KEY,
  "value" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE INDEX "Competitor_platform_idx" ON "Competitor"("platform");
CREATE INDEX "Competitor_source_idx" ON "Competitor"("source");
CREATE INDEX "Post_platform_idx" ON "Post"("platform");
CREATE INDEX "Post_contentPillar_idx" ON "Post"("contentPillar");
CREATE INDEX "Post_publishedAt_idx" ON "Post"("publishedAt");

PRAGMA foreign_keys = ON;
`);

db.close();

console.log("SQLite schema initialized at prisma/dev.db");
