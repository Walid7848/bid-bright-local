import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRoles } from "@/hooks/useRoles";
import { useLang } from "@/lib/i18n";
import { CITIES } from "@/lib/cities";
import { CATEGORIES } from "@/lib/categories";
import { categoryLabel, matchCategory } from "@/lib/service-search";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SignedImage } from "@/components/SignedImage";
import { QueryError } from "@/components/QueryError";
import { logQueryError } from "@/lib/query-log";
import {
  MapPin,
  Clock,
  Users,
  Image as ImageIcon,
  Search,
  SlidersHorizontal,
  Wallet,
  Briefcase,
  CheckCircle2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar, nl, enUS } from "date-fns/locale";

export const Route = createFileRoute("/_authenticated/requests/")({
  head: () => ({
    meta: [
      { title: "طلبات مناسبة لك — فرص عمل | Wasla" },
      {
        name: "description",
        content:
          "استعرض طلبات العملاء المفتوحة في هولندا، صفِّها حسب المدينة ونوع الخدمة، وقدّم عرضك.",
      },
      { property: "og:title", content: "طلبات مناسبة لك — فرص عمل | Wasla" },
      {
        property: "og:description",
        content: "طلبات عملاء مفتوحة يمكنك تقديم عروضك عليها عبر منصة وصلة.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RequestsIndex,
});

const STATUSES = ["open", "awarded", "in_progress", "completed", "closed"] as const;

function RequestsIndex() {
  const { user } = useAuth();
  const { isClient } = useRoles();
  const { t, lang } = useLang();
  const locale = lang === "nl" ? nl : lang === "en" ? enUS : ar;

  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("open");
  const [withBudget, setWithBudget] = useState(false);
  const [sort, setSort] = useState<"newest" | "budget" | "fewest">("newest");
  const [myCity, setMyCity] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("city, profession")
        .eq("id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  const activeCity = cityFilter || (myCity ? (profile?.city ?? "") : "");

  const { data: requests, isLoading, isError, refetch } = useQuery({
    queryKey: ["requests", activeCity, categoryFilter, statusFilter],
    queryFn: async () => {
      let q = supabase
        .from("requests")
        .select("*, bids!bids_request_id_fkey(count)")
        .order("created_at", { ascending: false });
      if (statusFilter !== "all")
        q = q.eq("status", statusFilter as (typeof STATUSES)[number]);
      if (activeCity) q = q.eq("city", activeCity);
      if (categoryFilter) q = q.eq("category", categoryFilter);
      const { data, error } = await q;
      if (error) {
        logQueryError("requests", error);
        throw error;
      }
      return data;
    },
  });

  // Only my own bids — allowed by existing policies (professional_id = auth.uid())
  const { data: myBidRequestIds } = useQuery({
    queryKey: ["my-bid-request-ids", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("bids")
        .select("request_id")
        .eq("professional_id", user!.id);
      return new Set((data ?? []).map((b) => b.request_id));
    },
  });

  const list = useMemo(() => {
    let rows = requests ?? [];
    const q = search.trim().toLowerCase();
    if (q) {
      const matched = matchCategory(q, lang);
      rows = rows.filter(
        (r: any) =>
          r.title?.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q) ||
          categoryLabel(r.category, lang).toLowerCase().includes(q) ||
          (matched && r.category === matched),
      );
    }
    if (withBudget) rows = rows.filter((r: any) => r.budget_min || r.budget_max);
    const sorted = [...rows];
    if (sort === "budget") {
      sorted.sort(
        (a: any, b: any) => (b.budget_max ?? b.budget_min ?? 0) - (a.budget_max ?? a.budget_min ?? 0),
      );
    } else if (sort === "fewest") {
      sorted.sort((a: any, b: any) => (a.bids?.[0]?.count ?? 0) - (b.bids?.[0]?.count ?? 0));
    }
    return sorted;
  }, [requests, search, withBudget, sort, lang]);

  const activeFilterCount =
    (cityFilter ? 1 : 0) +
    (categoryFilter ? 1 : 0) +
    (statusFilter !== "open" ? 1 : 0) +
    (withBudget ? 1 : 0) +
    (sort !== "newest" ? 1 : 0);

  function clearFilters() {
    setCityFilter("");
    setCategoryFilter("");
    setStatusFilter("open");
    setWithBudget(false);
    setSort("newest");
  }

  const Filters = (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>{t("pro.category")}</Label>
        <Select
          value={categoryFilter || "__all__"}
          onValueChange={(v) => setCategoryFilter(v === "__all__" ? "" : v)}
        >
          <SelectTrigger className="h-11">
            <SelectValue placeholder={t("pro.allCategories")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">{t("pro.allCategories")}</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {categoryLabel(c.id, lang)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>{t("pro.city")}</Label>
        <Select
          value={cityFilter || "__all__"}
          onValueChange={(v) => setCityFilter(v === "__all__" ? "" : v)}
        >
          <SelectTrigger className="h-11">
            <SelectValue placeholder={t("pro.allCities")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">{t("pro.allCities")}</SelectItem>
            {CITIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>{t("pro.status")}</Label>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-11">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("pro.allStatuses")}</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {t(`status.${s}` as Parameters<typeof t>[0])}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>{t("pro.sort")}</Label>
        <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
          <SelectTrigger className="h-11">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">{t("pro.sortNewest")}</SelectItem>
            <SelectItem value="budget">{t("pro.sortBudget")}</SelectItem>
            <SelectItem value="fewest">{t("pro.sortFewestBids")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 p-3">
        <Label htmlFor="withBudget" className="cursor-pointer text-sm font-normal">
          {t("pro.withBudget")}
        </Label>
        <Switch id="withBudget" checked={withBudget} onCheckedChange={setWithBudget} />
      </div>

      {profile?.city && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 p-3">
          <Label htmlFor="myCity" className="cursor-pointer text-sm font-normal">
            {t("pro.myCity")} · {profile.city}
          </Label>
          <Switch
            id="myCity"
            checked={myCity && !cityFilter}
            disabled={!!cityFilter}
            onCheckedChange={setMyCity}
          />
        </div>
      )}

      {activeFilterCount > 0 && (
        <Button variant="outline" className="h-11 w-full" onClick={clearFilters}>
          {t("pro.clearFilters")}
        </Button>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:py-8">
      {/* Header — pro/opportunity tone */}
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-l from-primary/10 via-primary/5 to-transparent p-5 sm:p-7">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Briefcase className="h-3.5 w-3.5" />
          {t("pro.opportunity")}
        </div>
        <h1 className="mt-3 text-2xl font-bold sm:text-3xl">{t("pro.title")}</h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{t("pro.subtitle")}</p>
        {!isLoading && (
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <Badge variant="secondary" className="h-7 px-3">
              {list.length} {t("pro.countLabel")}
            </Badge>
            {activeCity && (
              <Badge variant="outline" className="h-7 gap-1 px-3">
                <MapPin className="h-3.5 w-3.5" />
                {activeCity}
              </Badge>
            )}
            {profile?.profession && (
              <Badge variant="outline" className="h-7 px-3">
                {categoryLabel(profile.profession, lang)}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Search + mobile filters trigger */}
      <div className="mt-5 flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute inset-y-0 my-auto h-4 w-4 text-muted-foreground ltr:left-3 rtl:right-3" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("pro.searchPlaceholder")}
            aria-label={t("pro.searchPlaceholder")}
            className="h-11 ltr:pl-9 rtl:pr-9"
          />
        </div>
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="h-11 gap-2 lg:hidden">
              <SlidersHorizontal className="h-4 w-4" />
              {activeFilterCount > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl">
            <SheetHeader className="text-start">
              <SheetTitle>{t("pro.filters")}</SheetTitle>
            </SheetHeader>
            <div className="mt-4 pb-4">{Filters}</div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* Desktop filters */}
        <aside className="hidden lg:block">
          <Card className="sticky top-24 p-4 shadow-soft">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <SlidersHorizontal className="h-4 w-4" />
              {t("pro.filters")}
              {activeFilterCount > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </div>
            {Filters}
          </Card>
        </aside>

        <div>
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden p-0 shadow-soft">
                  <Skeleton className="h-36 w-full rounded-none" />
                  <div className="space-y-3 p-4">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-4/5" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </Card>
              ))}
            </div>
          ) : isError ? (
            <QueryError onRetry={() => refetch()} />
          ) : list.length === 0 ? (
            <Card className="p-10 text-center shadow-soft sm:p-14">
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-muted">
                <Briefcase className="h-6 w-6 text-muted-foreground" />
              </div>
              <h2 className="text-lg font-bold">{t("pro.emptyTitle")}</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                {t("pro.emptyDesc")}
              </p>
              {(activeFilterCount > 0 || search) && (
                <Button
                  variant="outline"
                  className="mt-5 h-11"
                  onClick={() => {
                    clearFilters();
                    setSearch("");
                  }}
                >
                  {t("pro.clearFilters")}
                </Button>
              )}
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {list.map((r: any) => {
                const bidCount = r.bids?.[0]?.count ?? 0;
                const bidded = myBidRequestIds?.has(r.id);
                return (
                  <Card
                    key={r.id}
                    className="flex flex-col overflow-hidden p-0 shadow-soft transition hover:-translate-y-0.5 hover:shadow-elegant"
                  >
                    <div className="relative h-36 bg-muted">
                      {r.images?.[0] ? (
                        <SignedImage
                          path={r.images[0]}
                          className="h-full w-full object-cover"
                          alt={r.title}
                        />
                      ) : (
                        <div className="grid h-full place-items-center text-muted-foreground">
                          <ImageIcon className="h-9 w-9 opacity-30" />
                        </div>
                      )}
                      <Badge className="absolute top-3 bg-surface text-foreground shadow ltr:right-3 rtl:left-3">
                        {categoryLabel(r.category, lang)}
                      </Badge>
                      {r.status !== "open" && (
                        <Badge
                          variant="outline"
                          className="absolute bottom-3 bg-background/90 ltr:left-3 rtl:right-3"
                        >
                          {t(`status.${r.status}` as Parameters<typeof t>[0])}
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col gap-3 p-4">
                      <h3 className="line-clamp-1 text-base font-bold">{r.title}</h3>
                      <p className="line-clamp-2 text-sm text-muted-foreground">{r.description}</p>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {r.city}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {bidCount > 0 ? `${bidCount} ${t("pro.bidsCount")}` : t("pro.noBidsYet")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDistanceToNow(new Date(r.created_at), {
                            addSuffix: true,
                            locale,
                          })}
                        </span>
                      </div>

                      {(r.budget_min || r.budget_max) && (
                        <div
                          className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1 text-xs font-semibold"
                          dir="ltr"
                        >
                          <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
                          {r.budget_min || 0} – {r.budget_max || "?"} €
                        </div>
                      )}

                      <div className="mt-auto flex gap-2 pt-1">
                        <Button asChild variant="outline" className="h-11 flex-1">
                          <Link to="/requests/$id" params={{ id: r.id }}>
                            {t("pro.view")}
                          </Link>
                        </Button>
                        {bidded ? (
                          <div className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-success/10 px-3 text-sm font-medium text-success">
                            <CheckCircle2 className="h-4 w-4" />
                            {t("pro.alreadyBid")}
                          </div>
                        ) : (
                          !isClient &&
                          r.status === "open" && (
                            <Button asChild variant="cta" className="h-11 flex-1">
                              <Link to="/requests/$id" params={{ id: r.id }}>
                                {t("pro.bid")}
                              </Link>
                            </Button>
                          )
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
