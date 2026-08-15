import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { categoryLabel } from "@/lib/service-search";
import { useLang } from "@/lib/i18n";
import { Star, MapPin, Clock } from "lucide-react";

export type BidStats = {
  rating: number | null;
  reviewsCount: number;
};

/** Fetches real review data (rating + count) for every professional who bid. */
export function useBidStats(bids: any[] | undefined) {
  const proIds = useMemo(
    () => Array.from(new Set((bids ?? []).map((b) => b.professional_id))).sort(),
    [bids],
  );

  const { data: reputation } = useQuery({
    queryKey: ["bid-reputation", proIds],
    enabled: proIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("professional_id, rating")
        .in("professional_id", proIds);
      if (error) throw error;

      const map: Record<string, BidStats> = {};
      for (const id of proIds) map[id] = { rating: null, reviewsCount: 0 };
      const sums: Record<string, number> = {};
      for (const r of data ?? []) {
        const s = map[r.professional_id];
        if (!s) continue;
        s.reviewsCount += 1;
        sums[r.professional_id] = (sums[r.professional_id] ?? 0) + (r.rating ?? 0);
      }
      for (const id of Object.keys(sums)) {
        const s = map[id];
        if (s && s.reviewsCount > 0) s.rating = sums[id]! / s.reviewsCount;
      }
      return map;
    },
  });

  return useMemo<Record<string, BidStats>>(() => {
    const out: Record<string, BidStats> = {};
    for (const b of bids ?? []) {
      out[b.id] = reputation?.[b.professional_id] ?? { rating: null, reviewsCount: 0 };
    }
    return out;
  }, [bids, reputation]);
}

export function RatingInline({ stats }: { stats?: BidStats }) {
  const { t } = useLang();
  if (!stats || stats.rating === null) {
    return <span className="text-xs text-muted-foreground">{t("bc.noRating")}</span>;
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium">
      <Star className="h-3.5 w-3.5 fill-secondary text-secondary" />
      {stats.rating.toFixed(1)}
      <span className="text-muted-foreground">
        ({stats.reviewsCount} {t("bc.reviewsCount")})
      </span>
    </span>
  );
}

/**
 * Owner-only side-by-side comparison. Desktop only (mobile relies on the
 * stacked bid cards below). No ranking, no recommendations — plain facts.
 */
export function BidComparison({
  bids,
  stats,
  canSelect,
  onSelect,
}: {
  bids: any[];
  stats: Record<string, BidStats>;
  canSelect: boolean;
  onSelect: (bid: any) => void;
}) {
  const { t, lang } = useLang();
  if (bids.length < 2) return null;

  return (
    <Card className="hidden p-5 shadow-soft lg:block">
      <h3 className="text-base font-bold">{t("bc.title")}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{t("bc.subtitle")}</p>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-start text-xs uppercase text-muted-foreground">
              <th className="p-2 text-start font-medium">{t("bc.provider")}</th>
              <th className="p-2 text-start font-medium">{t("bc.price")}</th>
              <th className="p-2 text-start font-medium">{t("bc.duration")}</th>
              <th className="p-2 text-start font-medium">{t("bc.rating")}</th>
              <th className="p-2 text-start font-medium">{t("bc.city")}</th>
              <th className="p-2" />
            </tr>
          </thead>
          <tbody>
            {bids.map((b) => (
              <tr key={b.id} className="border-t border-border">
                <td className="p-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      {b.profiles?.avatar_url && (
                        <AvatarImage src={b.profiles.avatar_url} alt="" />
                      )}
                      <AvatarFallback className="bg-gradient-primary text-xs text-primary-foreground">
                        {(b.profiles?.full_name || "?").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="truncate font-semibold">
                        {b.profiles?.full_name || t("bc.provider")}
                      </div>
                      {b.profiles?.profession && (
                        <div className="truncate text-xs text-muted-foreground">
                          {categoryLabel(b.profiles.profession, lang)}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="p-2 font-bold text-primary" dir="ltr">
                  {b.price} €
                </td>
                <td className="p-2">
                  {b.duration_days ? `${b.duration_days} ${t("rd.days")}` : "—"}
                </td>
                <td className="p-2">
                  <RatingInline stats={stats[b.id]} />
                </td>
                <td className="p-2">{b.profiles?.city || "—"}</td>
                <td className="p-2">
                  <div className="flex justify-end gap-2">
                    <Button asChild variant="outline" size="sm" className="h-9">
                      <Link to="/providers/$id" params={{ id: b.professional_id }}>
                        {t("rd.viewProfile")}
                      </Link>
                    </Button>
                    {canSelect && (
                      <Button
                        size="sm"
                        variant="cta"
                        className="h-9"
                        onClick={() => onSelect(b)}
                      >
                        {t("rd.selectBid")}
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/** Compact facts row reused inside bid cards on mobile. */
export function BidFacts({ bid, stats }: { bid: any; stats?: BidStats }) {
  const { t } = useLang();
  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
      {bid.duration_days ? (
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {bid.duration_days} {t("rd.days")}
        </span>
      ) : null}
      {bid.profiles?.city && (
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          {bid.profiles.city}
        </span>
      )}
      <RatingInline stats={stats} />
    </div>
  );
}
