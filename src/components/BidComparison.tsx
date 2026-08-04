import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sparkles, TrendingDown, Zap, Star, Award, CheckCircle2 } from "lucide-react";

export type BidStats = {
  rating: number | null;
  reviewsCount: number;
  completedJobs: number;
};

export type ScoredBid = {
  id: string;
  score: number;
  rank: number;
  isBestValue: boolean;
  isCheapest: boolean;
  isFastest: boolean;
  isTopRated: boolean;
  stats: BidStats;
};

const WEIGHTS = { price: 0.4, speed: 0.2, rating: 0.3, experience: 0.1 };

function norm(value: number, min: number, max: number, lowerIsBetter: boolean) {
  if (!isFinite(value)) return 0;
  if (max === min) return 1;
  const t = (value - min) / (max - min);
  return lowerIsBetter ? 1 - t : t;
}

/** Fetches professional reputation data and scores every bid on the request. */
export function useBidScores(bids: any[] | undefined) {
  const proIds = useMemo(
    () => Array.from(new Set((bids ?? []).map((b) => b.professional_id))).sort(),
    [bids],
  );

  const { data: reputation } = useQuery({
    queryKey: ["bid-reputation", proIds],
    enabled: proIds.length > 0,
    queryFn: async () => {
      const [reviewsRes, jobsRes] = await Promise.all([
        supabase.from("reviews").select("professional_id, rating").in("professional_id", proIds),
        supabase
          .from("bids")
          .select("professional_id")
          .in("professional_id", proIds)
          .eq("status", "accepted"),
      ]);
      if (reviewsRes.error) throw reviewsRes.error;
      if (jobsRes.error) throw jobsRes.error;

      const map: Record<string, BidStats> = {};
      for (const id of proIds) map[id] = { rating: null, reviewsCount: 0, completedJobs: 0 };
      const sums: Record<string, number> = {};
      for (const r of reviewsRes.data ?? []) {
        const s = map[r.professional_id];
        if (!s) continue;
        s.reviewsCount += 1;
        sums[r.professional_id] = (sums[r.professional_id] ?? 0) + (r.rating ?? 0);
      }
      for (const id of Object.keys(sums)) {
        const s = map[id];
        if (s && s.reviewsCount > 0) s.rating = sums[id] / s.reviewsCount;
      }
      for (const j of jobsRes.data ?? []) {
        const s = map[j.professional_id];
        if (s) s.completedJobs += 1;
      }
      return map;
    },
  });

  return useMemo<Record<string, ScoredBid>>(() => {
    const list = bids ?? [];
    if (list.length === 0) return {};
    const prices = list.map((b) => Number(b.price));
    const days = list.map((b) => Number(b.duration_days));
    const statsOf = (b: any): BidStats =>
      reputation?.[b.professional_id] ?? { rating: null, reviewsCount: 0, completedJobs: 0 };
    const jobs = list.map((b) => statsOf(b).completedJobs);

    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);
    const minD = Math.min(...days);
    const maxD = Math.max(...days);
    const maxJ = Math.max(...jobs, 1);

    const scored = list.map((b) => {
      const st = statsOf(b);
      const priceScore = norm(Number(b.price), minP, maxP, true);
      const speedScore = norm(Number(b.duration_days), minD, maxD, true);
      // No reviews yet → neutral 0.6 so newcomers are not unfairly buried.
      const ratingScore = st.rating === null ? 0.6 : (st.rating - 1) / 4;
      const expScore = Math.min(st.completedJobs / maxJ, 1);
      const score = Math.round(
        (priceScore * WEIGHTS.price +
          speedScore * WEIGHTS.speed +
          ratingScore * WEIGHTS.rating +
          expScore * WEIGHTS.experience) *
          100,
      );
      return { bid: b, score, stats: st };
    });

    const bestRating = Math.max(...scored.map((s) => s.stats.rating ?? 0));
    const sorted = [...scored].sort((a, b) => b.score - a.score);

    const out: Record<string, ScoredBid> = {};
    sorted.forEach((s, i) => {
      out[s.bid.id] = {
        id: s.bid.id,
        score: s.score,
        rank: i + 1,
        isBestValue: i === 0 && list.length > 1,
        isCheapest: Number(s.bid.price) === minP && maxP !== minP,
        isFastest: Number(s.bid.duration_days) === minD && maxD !== minD,
        isTopRated: bestRating > 0 && (s.stats.rating ?? 0) === bestRating,
        stats: s.stats,
      };
    });
    return out;
  }, [bids, reputation]);
}

export function BidScoreBadges({ scored }: { scored?: ScoredBid }) {
  if (!scored) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {scored.isBestValue && (
        <Badge className="gap-1 bg-cta text-cta-foreground hover:bg-cta/90">
          <Sparkles className="h-3 w-3" /> الأفضل قيمة
        </Badge>
      )}
      {scored.isCheapest && (
        <Badge variant="secondary" className="gap-1">
          <TrendingDown className="h-3 w-3" /> الأقل سعراً
        </Badge>
      )}
      {scored.isFastest && (
        <Badge variant="secondary" className="gap-1">
          <Zap className="h-3 w-3" /> الأسرع تنفيذاً
        </Badge>
      )}
      {scored.isTopRated && scored.stats.rating !== null && (
        <Badge variant="secondary" className="gap-1">
          <Star className="h-3 w-3" /> الأعلى تقييماً
        </Badge>
      )}
    </div>
  );
}

/** Owner-only smart comparison table across all bids on a request. */
export function BidComparison({
  bids,
  scores,
  canSelect,
  onAccept,
}: {
  bids: any[];
  scores: Record<string, ScoredBid>;
  canSelect: boolean;
  onAccept: (bidId: string) => void;
}) {
  const rows = useMemo(
    () => [...bids].sort((a, b) => (scores[b.id]?.score ?? 0) - (scores[a.id]?.score ?? 0)),
    [bids, scores],
  );
  if (bids.length < 2) return null;

  const prices = bids.map((b) => Number(b.price));
  const avg = prices.reduce((a, b) => a + b, 0) / prices.length;

  return (
    <Card className="p-5 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-base font-bold">
          <Sparkles className="h-4 w-4 text-cta" />
          المقارنة الذكية للعروض
        </h3>
        <span className="text-xs text-muted-foreground">
          تقييم تلقائي حسب السعر والسرعة والتقييمات والخبرة
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl bg-muted/60 p-3">
          <div className="text-xs text-muted-foreground">أقل سعر</div>
          <div className="font-bold">{Math.min(...prices)} €</div>
        </div>
        <div className="rounded-xl bg-muted/60 p-3">
          <div className="text-xs text-muted-foreground">متوسط العروض</div>
          <div className="font-bold">{Math.round(avg)} €</div>
        </div>
        <div className="rounded-xl bg-muted/60 p-3">
          <div className="text-xs text-muted-foreground">أعلى سعر</div>
          <div className="font-bold">{Math.max(...prices)} €</div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {rows.map((b) => {
          const s = scores[b.id];
          return (
            <div
              key={b.id}
              className={
                "rounded-xl border p-3 " +
                (s?.isBestValue ? "border-cta/50 bg-cta/5" : "border-border")
              }
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {s?.rank ?? "-"}
                  </span>
                  <span className="font-semibold">
                    {b.profiles?.full_name || "صاحب مهنة"}
                  </span>
                  {s?.isBestValue && <Award className="h-4 w-4 text-cta" />}
                </div>
                <div className="text-sm font-bold text-primary">{b.price} €</div>
              </div>

              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>خلال {b.duration_days} يوم</span>
                <span>
                  التقييم:{" "}
                  {s?.stats.rating !== null && s?.stats.rating !== undefined
                    ? `${s.stats.rating.toFixed(1)} ★ (${s.stats.reviewsCount})`
                    : "جديد"}
                </span>
                <span>أعمال منجزة: {s?.stats.completedJobs ?? 0}</span>
              </div>

              <div className="mt-2 flex items-center gap-3">
                <Progress value={s?.score ?? 0} className="h-2 flex-1" />
                <span className="w-10 text-end text-xs font-semibold">{s?.score ?? 0}%</span>
              </div>

              <div className="mt-2">
                <BidScoreBadges scored={s} />
              </div>

              {canSelect && (
                <Button
                  size="sm"
                  variant={s?.isBestValue ? "cta" : "outline"}
                  className="mt-3 w-full gap-1"
                  onClick={() => onAccept(b.id)}
                >
                  <CheckCircle2 className="h-4 w-4" /> اختر هذا العرض
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
