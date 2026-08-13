import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { MapPin, SlidersHorizontal, Star, UserRound, SearchX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SiteHeader } from "@/components/SiteHeader";
import { ServiceSearchBar } from "@/components/ServiceSearchBar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  reviews: { rating: number }[] | null;
};

function ServicesPage() {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const navigate = useNavigate({ from: "/services" });
  const { q, cat, city, rating } = Route.useSearch();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selected, setSelected] = useState<(ProviderRow & { avg: number; count: number }) | null>(null);


  const setSearch = (patch: Partial<{ q: string; cat: string; city: string; rating: number }>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }) });

  const { data: providers, isLoading } = useQuery({
    queryKey: ["providers", cat, city],
    enabled: !!user,
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select("id, full_name, city, profession, bio, reviews!reviews_professional_profile_fkey(rating)")
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

  const relatedTerms = useMemo(() => (q ? suggestServices(q, lang, 5) : []), [q, lang]);

  const Filters = (
    <div className="grid gap-4">
      <div className="grid gap-1.5">
        <label className="text-sm font-medium">{t("search.service")}</label>
        <Select value={cat || "__all__"} onValueChange={(v) => setSearch({ cat: v === "__all__" ? "" : v })}>
          <SelectTrigger>
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
        <label className="text-sm font-medium">{t("search.city")}</label>
        <Select value={city || "__all__"} onValueChange={(v) => setSearch({ city: v === "__all__" ? "" : v })}>
          <SelectTrigger>
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
        <label className="text-sm font-medium">{t("search.rating")}</label>
        <Select value={String(rating)} onValueChange={(v) => setSearch({ rating: Number(v) })}>
          <SelectTrigger>
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

      <Button
        variant="outline"
        onClick={() => {
          setSearch({ cat: "", city: "", rating: 0 });
          setFiltersOpen(false);
        }}
      >
        {t("search.filtersReset")}
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Search header */}
      <section className="section-tint border-b border-border/60">
        <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
          <h1 className="heading-strong text-2xl md:text-3xl">{t("search.title")}</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">{t("search.subtitle")}</p>
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
                  onClick={() => setSearch({ cat: isActive ? "" : gCat, q: "" })}
                  className={`flex items-center gap-2 rounded-2xl border p-3 text-start text-sm font-medium shadow-soft transition hover:-translate-y-0.5 hover:shadow-elegant ${
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-primary-dark md:text-xl">{t("search.results")}</h2>
            {user && !isLoading && (
              <p className="mt-1 text-sm text-muted-foreground">
                {results.length} {t("search.resultsCount")}
              </p>
            )}
          </div>

          {/* Mobile filters */}
          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2 lg:hidden">
                <SlidersHorizontal className="h-4 w-4" />
                {t("search.filters")}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-3xl">
              <SheetTitle className="mb-4">{t("search.filters")}</SheetTitle>
              {Filters}
              <Button className="mt-4 w-full" onClick={() => setFiltersOpen(false)}>
                {t("search.filtersApply")}
              </Button>
            </SheetContent>
          </Sheet>
        </div>

        <div className="mt-5 grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="hidden lg:block">
            <Card className="p-4">{Filters}</Card>
          </aside>

          <div className="min-w-0">
            {!user ? (
              <Card className="p-8 text-center">
                <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
                  <UserRound className="h-6 w-6" />
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
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-48 animate-pulse rounded-2xl bg-muted" />
                ))}
              </div>
            ) : results.length === 0 ? (
              <Card className="p-10 text-center">
                <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-muted text-muted-foreground">
                  <SearchX className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-primary-dark">{t("search.empty.title")}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{t("search.empty.desc")}</p>
                {relatedTerms.length > 0 && (
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {relatedTerms.map((s) => (
                      <button
                        key={s.label + s.category}
                        type="button"
                        onClick={() => setSearch({ q: s.label, cat: s.category })}
                        className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium transition hover:border-primary hover:text-primary"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
                <Button asChild variant="cta" className="mt-5">
                  <Link to="/requests/new">{t("search.empty.cta")}</Link>
                </Button>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {results.map((p) => (
                  <Card key={p.id} className="flex flex-col gap-3 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate font-bold text-primary-dark">
                          {p.profession ? categoryLabel(p.profession, lang) : t("search.service")}
                        </h3>
                        <p className="truncate text-sm text-muted-foreground">{p.full_name}</p>
                      </div>
                      {p.profession && (
                        <Badge variant="secondary" className="shrink-0">
                          {categoryLabel(p.profession, lang)}
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {p.city}
                      </span>
                      {p.count > 0 ? (
                        <span className="inline-flex items-center gap-1.5">
                          <StarRating value={p.avg} readOnly size={14} />
                          <span className="font-medium text-foreground">{p.avg.toFixed(1)}</span>
                          <span>
                            ({p.count} {t("search.reviews")})
                          </span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          <Star className="h-4 w-4" />
                          {t("search.noRating")}
                        </span>
                      )}
                    </div>

                    <p className="line-clamp-3 text-sm text-foreground/80">{p.bio || t("search.noBio")}</p>

                    <div className="mt-auto flex flex-wrap gap-2 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setSelected(p)}
                      >
                        {t("search.viewProfile")}
                      </Button>

                      <Button asChild variant="cta" size="sm" className="flex-1">
                        <Link to="/requests/new">{t("search.requestBid")}</Link>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-3xl sm:max-w-lg">
          <SheetTitle className="text-primary-dark">
            {selected?.profession ? categoryLabel(selected.profession, lang) : t("search.viewProfile")}
          </SheetTitle>
          {selected && (
            <div className="mt-4 grid gap-4">
              <div>
                <div className="text-base font-semibold">{selected.full_name}</div>
                <div className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {selected.city}
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {selected.count > 0 ? (
                  <>
                    <StarRating value={selected.avg} readOnly size={16} />
                    <span className="font-medium">{selected.avg.toFixed(1)}</span>
                    <span className="text-muted-foreground">
                      ({selected.count} {t("search.reviews")})
                    </span>
                  </>
                ) : (
                  <span className="text-muted-foreground">{t("search.noRating")}</span>
                )}
              </div>
              <div>
                <div className="text-sm font-semibold">{t("search.about")}</div>
                <p className="mt-1 text-sm text-foreground/80">{selected.bio || t("search.noBio")}</p>
              </div>
              <Button asChild variant="cta" className="w-full">
                <Link to="/requests/new">{t("search.requestBid")}</Link>
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>

  );
}
