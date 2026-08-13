import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { MapPin, SlidersHorizontal, Star, UserRound, SearchX, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SiteHeader } from "@/components/SiteHeader";
import { ServiceSearchBar } from "@/components/ServiceSearchBar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StarRating } from "@/components/StarRating";
import { CITIES } from "@/lib/cities";
import { CATEGORIES } from "@/lib/categories";
import { useLang } from "@/lib/i18n";
import { SERVICE_GROUPS, categoryLabel, suggestServices } from "@/lib/service-search";

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
  cat: fallback(z.string(), "").default(""),
  city: fallback(z.string(), "").default(""),
  rating: fallback(z.number(), 0).default(0),
});

export const Route = createFileRoute("/services")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "ابحث عن مقدم الخدمة المناسب | Wasla — Diensten zoeken" },
      {
        name: "description",
        content:
          "ابحث عن كهربائي، سباك، محاسب، مترجم، محامي ومهنيين آخرين في هولندا عبر وصلة، وقارن التقييمات واطلب عرض سعر بسهولة.",
      },
      { property: "og:title", content: "ابحث عن مقدم الخدمة المناسب | Wasla" },
      {
        property: "og:description",
        content: "Zoek professionals in Nederland: elektricien, loodgieter, boekhouder, vertaler en meer.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ServicesPage,
});

type ProviderRow = {
  id: string;
  full_name: string;
  city: string;
  profession: string | null;
  bio: string | null;
  avatar_url: string | null;
  reviews: { rating: number }[] | null;
};

type ProviderCard = ProviderRow & { avg: number; count: number };

const PAGE_SIZE = 12;

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function ResultSkeleton() {
  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-start gap-3">
        <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-3 w-1/3" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>
      <div className="mt-auto flex gap-2 pt-1">
        <Skeleton className="h-9 flex-1 rounded-xl" />
        <Skeleton className="h-9 flex-1 rounded-xl" />
      </div>
    </Card>
  );
}

function ServicesPage() {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const navigate = useNavigate({ from: "/services" });
  const { q, cat, city, rating } = Route.useSearch();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const setSearch = (patch: Partial<{ q: string; cat: string; city: string; rating: number }>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }) });

  const { data: providers, isLoading } = useQuery({
    queryKey: ["providers", cat, city],
    enabled: !!user,
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select(
          "id, full_name, city, profession, bio, avatar_url, reviews!reviews_professional_profile_fkey(rating)",
        )
        .not("profession", "is", null)
        .neq("profession", "")
        .order("full_name");
      if (cat) query = query.eq("profession", cat);
      if (city) query = query.eq("city", city);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as unknown as ProviderRow[];
    },
  });

  const results = useMemo(() => {
    const rows = (providers ?? []).map((p) => {
      const ratings = (p.reviews ?? []).map((r) => r.rating);
      const count = ratings.length;
      const avg = count ? ratings.reduce((a, b) => a + b, 0) / count : 0;
      return { ...p, avg, count };
    });
    const needle = q.trim().toLowerCase();
    return rows
      .filter((p) => (rating ? p.avg >= rating : true))
      .filter((p) => {
        if (!needle || cat) return true;
        const catLabel = p.profession ? categoryLabel(p.profession, lang).toLowerCase() : "";
        return (
          p.full_name.toLowerCase().includes(needle) ||
          catLabel.includes(needle) ||
          (p.bio ?? "").toLowerCase().includes(needle) ||
          p.city.toLowerCase().includes(needle)
        );
      })
      .sort((a, b) => b.avg - a.avg || b.count - a.count);
  }, [providers, rating, q, cat, lang]);

  useEffect(() => setVisible(PAGE_SIZE), [q, cat, city, rating]);

  const shown = results.slice(0, visible);
  const relatedTerms = useMemo(() => suggestServices(q || "", lang, 6), [q, lang]);
  const activeFilters = (cat ? 1 : 0) + (city ? 1 : 0) + (rating ? 1 : 0);

  const headline = cat
    ? `${categoryLabel(cat, lang)} — ${t("results.inNL")}`
    : q
      ? `${t("results.forQuery")} “${q}”`
      : t("results.sub");

  const Filters = (
    <div className="grid gap-4">
      <div className="grid gap-1.5">
        <label htmlFor="filter-service" className="text-sm font-medium">
          {t("search.service")}
        </label>
        <Select value={cat || "__all__"} onValueChange={(v) => setSearch({ cat: v === "__all__" ? "" : v })}>
          <SelectTrigger id="filter-service" aria-label={t("search.service")}>
            <SelectValue placeholder={t("search.allServices")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">{t("search.allServices")}</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {categoryLabel(c.id, lang)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="filter-city" className="text-sm font-medium">
          {t("search.city")}
        </label>
        <Select value={city || "__all__"} onValueChange={(v) => setSearch({ city: v === "__all__" ? "" : v })}>
          <SelectTrigger id="filter-city" aria-label={t("search.city")}>
            <SelectValue placeholder={t("search.allCities")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">{t("search.allCities")}</SelectItem>
            {CITIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="filter-rating" className="text-sm font-medium">
          {t("search.rating")}
        </label>
        <Select value={String(rating)} onValueChange={(v) => setSearch({ rating: Number(v) })}>
          <SelectTrigger id="filter-rating" aria-label={t("search.rating")}>
            <SelectValue placeholder={t("search.anyRating")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">{t("search.anyRating")}</SelectItem>
            {[3, 4, 4.5].map((r) => (
              <SelectItem key={r} value={String(r)}>
                {r} ★ {t("search.ratingPlus")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {activeFilters > 0 && (
        <Button
          variant="ghost"
          className="justify-start gap-2 text-sm text-muted-foreground hover:text-foreground"
          onClick={() => {
            setSearch({ cat: "", city: "", rating: 0 });
            setFiltersOpen(false);
          }}
        >
          <X className="h-4 w-4" aria-hidden />
          {t("results.clearFilters")}
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Results header */}
      <section className="section-tint border-b border-border/60">
        <div className="mx-auto max-w-7xl px-4 py-7 md:py-11">
          <h1 className="heading-strong text-2xl md:text-3xl">{t("results.heading")}</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">{headline}</p>
          {user && !isLoading && (
            <p className="mt-1 text-sm font-medium text-primary-dark">
              {results.length} {t("search.resultsCount")}
            </p>
          )}
          <div className="mt-5 max-w-3xl">
            <ServiceSearchBar initialQuery={q} />
          </div>

          {/* category cards */}
          <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
            {SERVICE_GROUPS.map((g) => {
              const gCat = g.categories[0];
              const isActive = g.categories.includes(cat);
              return (
                <button
                  key={g.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setSearch({ cat: isActive ? "" : gCat, q: "" })}
                  className={`flex min-h-11 items-center gap-2 rounded-2xl border p-3 text-start text-sm font-medium shadow-soft transition hover:-translate-y-0.5 hover:shadow-elegant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    isActive ? "border-primary bg-primary/10 text-primary-dark" : "border-border bg-card"
                  }`}
                >
                  <span aria-hidden className="text-lg leading-none">
                    {g.emoji}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{g[lang]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[248px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-border/70 bg-card/60 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary-dark">
                <SlidersHorizontal className="h-4 w-4" aria-hidden />
                {t("search.filters")}
              </div>
              {Filters}
            </div>
          </aside>

          <div className="min-w-0">
            {/* Mobile filter bar */}
            <div className="mb-4 flex items-center justify-between gap-3 lg:hidden">
              <h2 className="text-base font-bold text-primary-dark">{t("search.results")}</h2>
              <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="h-11 gap-2">
                    <SlidersHorizontal className="h-4 w-4" aria-hidden />
                    {t("search.filters")}
                    {activeFilters > 0 && ` (${activeFilters})`}
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-3xl">
                  <SheetTitle className="mb-4">{t("search.filters")}</SheetTitle>
                  {Filters}
                  <Button className="mt-4 h-11 w-full" onClick={() => setFiltersOpen(false)}>
                    {t("search.filtersApply")}
                  </Button>
                </SheetContent>
              </Sheet>
            </div>

            {!user ? (
              <Card className="p-8 text-center">
                <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
                  <UserRound className="h-6 w-6" aria-hidden />
                </div>
                <h3 className="text-lg font-bold text-primary-dark">{t("search.signInTitle")}</h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{t("search.signInDesc")}</p>
                <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
                  <Button asChild variant="cta">
                    <Link to="/auth">{t("nav.start")}</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/auth">{t("nav.signIn")}</Link>
                  </Button>
                </div>
              </Card>
            ) : isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ResultSkeleton key={i} />
                ))}
              </div>
            ) : results.length === 0 ? (
              <Card className="p-8 text-center md:p-12">
                <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary">
                  <SearchX className="h-7 w-7" aria-hidden />
                </div>
                <h3 className="text-lg font-bold text-primary-dark md:text-xl">{t("search.empty.title")}</h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{t("results.empty.desc")}</p>

                {relatedTerms.length > 0 && (
                  <div className="mt-5">
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {t("results.suggestions")}
                    </div>
                    <div className="mt-3 flex flex-wrap justify-center gap-2">
                      {relatedTerms.map((s) => (
                        <button
                          key={s.label + s.category}
                          type="button"
                          onClick={() => setSearch({ q: s.label, cat: s.category })}
                          className="min-h-9 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
                  <Button
                    variant="outline"
                    className="h-11"
                    onClick={() => setSearch({ q: "", cat: "", city: "", rating: 0 })}
                  >
                    {t("results.showAll")}
                  </Button>
                  <Button asChild variant="cta" className="h-11">
                    <Link to="/requests/new">{t("search.empty.cta")}</Link>
                  </Button>
                </div>
              </Card>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {shown.map((p) => (
                    <Card
                      key={p.id}
                      className="flex flex-col gap-3 p-5 transition hover:-translate-y-0.5 hover:shadow-elegant"
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-12 w-12 shrink-0 border border-border">
                          {p.avatar_url && <AvatarImage src={p.avatar_url} alt={t("results.avatarAlt")} />}
                          <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                            {initials(p.full_name) || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate font-bold text-primary-dark">{p.full_name}</h3>
                          {p.profession && (
                            <Badge variant="secondary" className="mt-1 max-w-full truncate">
                              {categoryLabel(p.profession, lang)}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                        <span className="inline-flex min-w-0 items-center gap-1">
                          <MapPin className="h-4 w-4 shrink-0" aria-hidden />
                          <span className="truncate">{p.city}</span>
                        </span>
                        {p.count > 0 ? (
                          <span className="inline-flex items-center gap-1.5">
                            <StarRating value={p.avg} readOnly size={14} />
                            <span className="font-semibold text-foreground">{p.avg.toFixed(1)}</span>
                            <span>
                              ({p.count} {p.count === 1 ? t("results.reviewsOne") : t("search.reviews")})
                            </span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1">
                            <Star className="h-4 w-4" aria-hidden />
                            {t("search.noRating")}
                          </span>
                        )}
                      </div>

                      <p className="line-clamp-3 text-sm text-foreground/80">{p.bio || t("search.noBio")}</p>

                      <div className="mt-auto grid grid-cols-2 gap-2 pt-1">
                        <Button
                          asChild
                          variant="outline"
                          className="h-10 w-full"
                        >
                          <Link
                            to="/providers/$id"
                            params={{ id: p.id }}
                            aria-label={`${t("search.viewProfile")} — ${p.full_name}`}
                          >
                            {t("search.viewProfile")}
                          </Link>
                        </Button>
                        <Button asChild variant="cta" className="h-10 w-full">
                          <Link to="/requests/new">{t("search.requestBid")}</Link>
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>

                {visible < results.length && (
                  <div className="mt-8 flex flex-col items-center gap-2">
                    <p className="text-xs text-muted-foreground">
                      {shown.length} {t("results.showingOf")} {results.length}
                    </p>
                    <Button
                      variant="outline"
                      className="h-11 px-8"
                      onClick={() => setVisible((v) => v + PAGE_SIZE)}
                    >
                      {t("results.loadMore")}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
