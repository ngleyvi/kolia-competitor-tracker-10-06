import { classifyPost } from "@/lib/classifier";
import type { ClassifiedPost, CompetitorSeed, Platform, RawPostInput } from "@/lib/types";
import { calculateEngagementRate, calculateViralityScore, slugify } from "@/lib/utils";

export const competitorSeeds: CompetitorSeed[] = [
  {
    name: "Happy Live",
    platform: "facebook",
    source: "trong_nuoc",
    segmentation: "Bán sách",
    category: "ban_sach",
    channelUrl: "https://web.facebook.com/KBApham"
  },
  {
    name: "Thái Phạm",
    platform: "facebook",
    source: "trong_nuoc",
    segmentation: "KOL đào tạo",
    category: "kol_dao_tao",
    channelUrl: "https://web.facebook.com/happy.live.invest"
  },
  {
    name: "Cú Thông Thái",
    platform: "facebook",
    source: "trong_nuoc",
    segmentation: "KOL đào tạo",
    category: "kol_dao_tao",
    channelUrl: "https://web.facebook.com/CuThongThai.VNInvestor"
  },
  {
    name: "Viện Cổ Phiếu Truongmoney",
    platform: "facebook",
    source: "trong_nuoc",
    segmentation: "KOL đào tạo",
    category: "kol_dao_tao",
    channelUrl: "https://web.facebook.com/viencophieu"
  },
  {
    name: "Đầu Tư Chứng Khoán Cùng Quang Dũng",
    platform: "facebook",
    source: "trong_nuoc",
    segmentation: "KOL đào tạo",
    category: "kol_dao_tao",
    channelUrl: "https://web.facebook.com/profile.php?id=100057330173171"
  },
  {
    name: "AzFin Việt Nam",
    platform: "facebook",
    source: "trong_nuoc",
    segmentation: "KOL đào tạo",
    category: "kol_dao_tao",
    channelUrl: "https://web.facebook.com/AzFinVietNam"
  },
  {
    name: "MInvest",
    platform: "facebook",
    source: "trong_nuoc",
    segmentation: "KOL đào tạo",
    category: "kol_dao_tao",
    channelUrl: "https://web.facebook.com/minvest.vn"
  },
  {
    name: "Duy Nghiêm",
    platform: "tiktok",
    source: "trong_nuoc",
    category: "other",
    topicDescription: "Đầu tư - Tài chính - Kinh tế",
    channelUrl: "https://www.tiktok.com/@duynghiem93"
  },
  {
    name: "Ngân Talk",
    platform: "tiktok",
    source: "trong_nuoc",
    category: "other",
    topicDescription: "Phân tích vàng và bitcoin",
    channelUrl: "https://www.tiktok.com/@ngantalk.29"
  },
  {
    name: "Đào Thịnh Vượng",
    platform: "tiktok",
    source: "trong_nuoc",
    category: "other",
    topicDescription: "Lời khuyên về đầu tư",
    channelUrl: "https://www.tiktok.com/@daothinhvuongofficial255"
  },
  {
    name: "Kiến thức đầu tư",
    platform: "tiktok",
    source: "trong_nuoc",
    category: "other",
    topicDescription: "Học đầu tư chứng khoán, crypto A-Z",
    channelUrl: "https://www.tiktok.com/@nnh.kienthucdautu"
  },
  {
    name: "beyondrvn",
    platform: "tiktok",
    source: "trong_nuoc",
    category: "other",
    topicDescription: "Kỹ năng phân tích giao dịch",
    channelUrl: "https://www.tiktok.com/@beyondrvn"
  },
  {
    name: "truongan.crypto",
    platform: "tiktok",
    source: "trong_nuoc",
    category: "other",
    topicDescription: "Phân tích thị trường crypto",
    channelUrl: "https://www.tiktok.com/@truongan.crypto"
  },
  {
    name: "The Rich Dad Channel",
    platform: "youtube",
    source: "nuoc_ngoai",
    category: "vi_mo",
    channelUrl: "https://www.youtube.com/@TheRichDadChannel/videos"
  },
  {
    name: "The Trading Channel",
    platform: "youtube",
    source: "nuoc_ngoai",
    category: "ky_thuat",
    channelUrl: "https://www.youtube.com/@thetradingchannel/videos"
  },
  {
    name: "Booming Bulls",
    platform: "youtube",
    source: "nuoc_ngoai",
    category: "ky_thuat",
    channelUrl: "https://www.youtube.com/@BoomingBulls/videos"
  },
  {
    name: "The Trading Greek",
    platform: "youtube",
    source: "nuoc_ngoai",
    category: "ca_hai",
    channelUrl: "https://www.youtube.com/@TheTradingGeek/featured"
  },
  {
    name: "TradingLab",
    platform: "youtube",
    source: "nuoc_ngoai",
    category: "ky_thuat",
    channelUrl: "https://www.youtube.com/@TradingLabOfficial/videos"
  },
  {
    name: "Thái Phạm",
    platform: "youtube",
    source: "trong_nuoc",
    category: "vi_mo",
    channelUrl: "https://www.youtube.com/@ThaiPhamHappyLive/videos"
  },
  {
    name: "Rich Nguyen",
    platform: "youtube",
    source: "trong_nuoc",
    category: "vi_mo",
    channelUrl: "https://www.youtube.com/@RICHNGUYEN/videos"
  },
  {
    name: "GoldSilver",
    platform: "youtube",
    source: "nuoc_ngoai",
    category: "vi_mo",
    channelUrl: "https://www.youtube.com/@Goldsilver/videos"
  },
  {
    name: "Craig Percoco",
    platform: "youtube",
    source: "nuoc_ngoai",
    category: "ky_thuat",
    channelUrl: "https://www.youtube.com/@craig_percoco/videos"
  },
  {
    name: "Trading Strategy Testing",
    platform: "youtube",
    source: "nuoc_ngoai",
    category: "ky_thuat",
    channelUrl: "https://www.youtube.com/@TradingStrategyTesting/featured"
  },
  {
    name: "Duy Thanh Nguyen",
    platform: "youtube",
    source: "trong_nuoc",
    category: "vi_mo",
    channelUrl: "https://www.youtube.com/@duythanhish/videos"
  },
  {
    name: "Riley Coleman",
    platform: "youtube",
    source: "nuoc_ngoai",
    category: "ky_thuat",
    channelUrl: "https://www.youtube.com/@RileyColeman/videos"
  },
  {
    name: "Trade with Pat",
    platform: "youtube",
    source: "nuoc_ngoai",
    category: "ky_thuat",
    channelUrl: "https://www.youtube.com/@TradewithPat/videos"
  },
  {
    name: "Con đường thành công",
    platform: "youtube",
    source: "trong_nuoc",
    category: "vi_mo",
    channelUrl: "https://www.youtube.com/@conduongthanhcong247/videos"
  },
  {
    name: "mInvest",
    platform: "youtube",
    source: "trong_nuoc",
    category: "vi_mo",
    channelUrl: "https://www.youtube.com/@minvestvn/videos"
  },
  {
    name: "9 phút kinh doanh",
    platform: "youtube",
    source: "trong_nuoc",
    category: "vi_mo",
    channelUrl: "https://www.youtube.com/@9PhutKinhDoanhotPha/videos"
  },
  {
    name: "Quang Dũng",
    platform: "youtube",
    source: "trong_nuoc",
    category: "vi_mo",
    channelUrl: "https://www.youtube.com/@DauTuChungKhoanCungQuangDung/videos"
  },
  {
    name: "Thuật Tài Vận",
    platform: "youtube",
    source: "trong_nuoc",
    category: "vi_mo",
    channelUrl: "https://www.youtube.com/@THUATTAIVAN/videos"
  },
  {
    name: "TTA Post",
    platform: "youtube",
    source: "nuoc_ngoai",
    category: "vi_mo",
    channelUrl: "https://www.youtube.com/@TTAPost/videos"
  },
  {
    name: "Trọng tài chính",
    platform: "youtube",
    source: "trong_nuoc",
    category: "ca_hai",
    channelUrl: "https://www.youtube.com/@trongtaichinh88/videos"
  },
  {
    name: "Hoàng Vinh",
    platform: "youtube",
    source: "trong_nuoc",
    category: "vi_mo",
    channelUrl: "https://www.youtube.com/@hoangvinhdautubenvung/videos"
  },
  {
    name: "CHẮC CHẮN THÀNH CÔNG",
    platform: "youtube",
    source: "trong_nuoc",
    category: "vi_mo",
    channelUrl: "https://www.youtube.com/@chacchanthanhcong/videos"
  }
];

const vietnameseTemplates = [
  {
    title: "Giá vàng tuần này có thể biến động mạnh vì Fed và CPI?",
    caption: "Cập nhật thị trường vàng, lãi suất và tâm lý nhà đầu tư. Nội dung chỉ phục vụ nghiên cứu, không phải khuyến nghị đầu tư."
  },
  {
    title: "Đừng FOMO khi VN-Index rung lắc: 3 rủi ro cần nhìn trước",
    caption: "Cẩn thận với các nhịp tăng nóng, quản trị vốn và giữ kỷ luật giao dịch."
  },
  {
    title: "Short 60s: RSI, trendline và breakout dễ hiểu cho người mới",
    caption: "#shorts Ví dụ thực tế về price action cho người mới học đầu tư chứng khoán."
  },
  {
    title: "Case study: một trade vàng từ lỗ sang lãi nhờ quản trị rủi ro",
    caption: "Phân tích điểm vào, điểm thoát và tâm lý giao dịch khi thị trường biến động."
  },
  {
    title: "Livestream tối nay: Fed, vàng, crypto và kịch bản tuần mới",
    caption: "Đăng ký nhận lịch livestream và tham gia cộng đồng để trao đổi thêm góc nhìn thị trường."
  },
  {
    title: "Người mới nên học đầu tư từ đâu? Lộ trình A-Z trong 30 ngày",
    caption: "Giải thích dễ hiểu về tài chính cá nhân, cổ phiếu, vàng và crypto."
  },
  {
    title: "Tin nóng: Bitcoin vượt mốc quan trọng, nhà đầu tư cần bình tĩnh",
    caption: "Reaction tin nóng crypto và lưu ý rủi ro khi thị trường tăng nhanh."
  },
  {
    title: "Webinar miễn phí: đọc báo cáo tài chính và nhận diện doanh nghiệp tốt",
    caption: "Đăng ký webinar, nhận checklist phân tích cơ bản và Q&A cùng chuyên gia."
  },
  {
    title: "Review sách đầu tư: 5 bài học giúp giảm sai lầm phổ biến",
    caption: "Tài liệu tham khảo dành cho nhà đầu tư muốn phát triển tư duy tài chính bền vững."
  },
  {
    title: "Minigame cộng đồng: bạn dự đoán vàng sẽ đi đâu tuần này?",
    caption: "Bình luận kịch bản của bạn, quà tặng là ebook checklist quản trị rủi ro."
  }
];

const foreignTemplates = [
  {
    title: "Why Gold Could Break $3,000 After the Next Fed Decision",
    caption: "Macro tension, inflation data and a simple framework for gold investors."
  },
  {
    title: "RSI Breakout Strategy: 5 Rules I Use Before Entering a Trade",
    caption: "Price action, indicator confirmation, trendline retest and risk control."
  },
  {
    title: "60s Short: The Biggest Mistake New Traders Make During a Market Crash",
    caption: "#shorts Warning about panic selling, position sizing and emotional discipline."
  },
  {
    title: "Case Study: Turning a Losing Crypto Trade Into a Managed Exit",
    caption: "Market structure, BTC volatility and a step-by-step trade review."
  },
  {
    title: "How Inflation, CPI and GDP Shape the Next Stock Market Cycle",
    caption: "Simple explanation of macro signals for long-term investors."
  },
  {
    title: "60s Short: This Trendline Breakout Setup Is Everywhere",
    caption: "#shorts Technical analysis, visual proof and a clear CTA to subscribe."
  },
  {
    title: "Before/After: What Changed When I Stopped Chasing FOMO Trades",
    caption: "Trading psychology, risk plan and practical discipline for beginners."
  },
  {
    title: "Live Webinar Replay: Macro, GoldSilver and the Recession Playbook",
    caption: "Webinar format with market tension, data proof and community Q&A."
  }
];

const tiktokTemplates = [
  {
    title: "Giá vàng tăng 2%: vì sao người mới không nên vào lệnh vội?",
    caption: "Giải thích thị trường vàng dễ hiểu trong 60s, cẩn thận FOMO."
  },
  {
    title: "3 sai lầm khiến nhà đầu tư crypto mất tiền khi BTC biến động",
    caption: "Cảnh báo rủi ro, quản trị vốn và tâm lý khi thị trường nóng."
  },
  {
    title: "RSI là gì? Một ví dụ breakout cực dễ hiểu cho người mới",
    caption: "Học phân tích kỹ thuật A-Z, price action và indicator cơ bản."
  },
  {
    title: "Reaction tin nóng Fed: lãi suất ảnh hưởng vàng và chứng khoán ra sao?",
    caption: "CPI, inflation và góc nhìn vĩ mô ngắn gọn."
  },
  {
    title: "Mini case study: trade XAUUSD này đáng học ở điểm nào?",
    caption: "Case study giao dịch, điểm vào, điểm thoát và kỷ luật."
  }
];

const facebookTemplates = [
  {
    title: "Cập nhật thị trường sáng nay: vàng, VN-Index và dòng tiền",
    caption: "Một vài dữ kiện đáng chú ý để nhà đầu tư tự xây kịch bản. Không phải khuyến nghị đầu tư cá nhân."
  },
  {
    title: "Đừng để FOMO phá vỡ kế hoạch đầu tư của bạn",
    caption: "Cẩn thận với các nhịp tăng nóng. Hãy bình luận câu hỏi để đội ngũ giải đáp trong livestream."
  },
  {
    title: "Carousel: 5 bước đọc báo cáo tài chính cho người mới",
    caption: "Lưu lại checklist và đăng ký nhận tài liệu miễn phí."
  },
  {
    title: "Webinar quý này: kịch bản vàng và crypto trước dữ liệu CPI",
    caption: "Đăng ký webinar miễn phí, số lượng ghế giới hạn cho cộng đồng."
  },
  {
    title: "Tham gia room cộng đồng để cập nhật livestream và Q&A hằng tuần",
    caption: "CTA tham gia cộng đồng, trao đổi kiến thức minh bạch và trung lập."
  }
];

function hashNumber(input: string) {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function metricBase(platform: Platform) {
  if (platform === "youtube") return { views: 52000, likes: 2100, comments: 180, shares: 240 };
  if (platform === "tiktok") return { views: 84000, likes: 5200, comments: 420, shares: 700 };
  return { views: 18000, likes: 1200, comments: 150, shares: 210 };
}

function buildMetrics(seed: string, platform: Platform, index: number) {
  const base = metricBase(platform);
  const hash = hashNumber(`${seed}-${index}`);
  const multiplier = 0.45 + (hash % 170) / 100;
  const spike = index % 5 === 0 ? 1.55 : 1;
  return {
    views: Math.round(base.views * multiplier * spike + (hash % 9000)),
    likes: Math.round(base.likes * multiplier * spike + (hash % 700)),
    comments: Math.round(base.comments * multiplier + (hash % 90)),
    shares: Math.round(base.shares * multiplier + (hash % 130))
  };
}

function postUrlFor(competitor: CompetitorSeed, index: number, batchKey: string) {
  const id = `${hashNumber(`${competitor.name}-${index}-${batchKey}`)}`;
  const slug = slugify(competitor.name);

  if (competitor.platform === "youtube") {
    return `https://www.youtube.com/watch?v=${slug.slice(0, 8)}${id.slice(0, 6)}`;
  }

  if (competitor.platform === "tiktok") {
    const handle = competitor.channelUrl.split("@")[1]?.replace(/\/$/, "") ?? slug;
    return `https://www.tiktok.com/@${handle}/video/${id.padEnd(19, "0").slice(0, 19)}`;
  }

  return `https://web.facebook.com/${slug}/posts/${id}`;
}

function thumbnailFor(platform: Platform, seed: string) {
  const palette = platform === "youtube" ? "102033/C89A2D" : platform === "tiktok" ? "0A1422/DFF4ED" : "0F8C6F/FFF5D8";
  return `https://placehold.co/640x360/${palette}.png?text=${encodeURIComponent(seed.slice(0, 22))}`;
}

function templateFor(competitor: CompetitorSeed, index: number, syncMode: boolean) {
  const templates =
    competitor.platform === "tiktok"
      ? tiktokTemplates
      : competitor.platform === "facebook"
        ? facebookTemplates
        : competitor.source === "nuoc_ngoai"
          ? foreignTemplates
          : vietnameseTemplates;
  const template = templates[index % templates.length];
  if (!syncMode) return template;
  return {
    title: `${template.title} | cập nhật ${new Date().toLocaleDateString("vi-VN")}`,
    caption: `${template.caption} Bản ghi đồng bộ mô phỏng mới nhất để demo automation.`
  };
}

export function enrichRawPost(rawPost: RawPostInput): RawPostInput & ClassifiedPost & { engagementRate: number; viralityScore: number } {
  const classified = classifyPost(rawPost.title, rawPost.caption, rawPost.platform);
  const format = rawPost.format ?? classified.format;
  const engagementRate = calculateEngagementRate(rawPost);
  const viralityScore = calculateViralityScore(rawPost);
  return {
    ...rawPost,
    ...classified,
    format,
    engagementRate,
    viralityScore
  };
}

export function generateMockPostsForCompetitor(
  competitor: CompetitorSeed,
  count: number,
  options?: { syncMode?: boolean; batchKey?: string; startOffsetDays?: number }
) {
  const batchKey = options?.batchKey ?? "seed";
  const syncMode = options?.syncMode ?? false;
  const startOffsetDays = options?.startOffsetDays ?? 1;

  return Array.from({ length: count }, (_, index) => {
    const displayIndex = syncMode ? index + hashNumber(batchKey) : index;
    const template = templateFor(competitor, displayIndex, syncMode);
    const metrics = buildMetrics(competitor.name, competitor.platform, displayIndex);
    const publishedAt = new Date();
    publishedAt.setDate(publishedAt.getDate() - (startOffsetDays + index * 3 + (hashNumber(competitor.name) % 5)));

    return enrichRawPost({
      platform: competitor.platform,
      postUrl: postUrlFor(competitor, displayIndex, batchKey),
      title: template.title,
      caption: template.caption,
      publishedAt,
      thumbnailUrl: thumbnailFor(competitor.platform, competitor.name),
      ...metrics
    });
  });
}

export function seedPostCountForPlatform(platform: Platform) {
  if (platform === "youtube") return 3;
  return 5;
}
