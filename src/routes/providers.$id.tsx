import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, MapPin, CalendarDays, Briefcase, Star, UserRound, SearchX } from "lucide-react";
import { format } from "date-fns";
import { ar as arLocale, nl as nlLocale, enUS } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarRating } from "@/components/StarRating";
import { useLang } from "@/lib/i18n";
import { categoryLabel } from "@/lib/service-search";

export const Route = createFileRoute("/providers/$id")({
  head: () => ({
    meta: [
      { title: "ملف مقدم الخدمة | Wasla — Profiel van de professional" },
      {
        name: "description",
        content:
          "اطّلع على ملف مقدم الخدمة في وصلة: نوع الخدمة، المدينة، النبذة والتقييمات، ثم اطلب عرض سعر مباشرة.",
      },
      { property: "og:title", content: "ملف مقدم الخدمة | Wasla" },
      {
        property: "og:description",
        content: "Bekijk het profiel van de professional: dienst, stad, omschrijving en beoordelingen.",
      },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProviderProfilePage,
});

type ReviewRow = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles: { full_name: string | null; avatar_url: string | null } | null;
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function ProviderProfilePage() {
  const { id } = Route.useParams();
  const { t, lang } = useLang();
  const { user, loading: authLoading } = useAuth();
  const dateLocale = lang === "ar" ? arLocale : lang === "nl" ? nlLocale : enUS;

  const { data, isLoading } = useQuery({
    queryKey: ["provider", id],
    enabled: !!user,
    queryFn: async () => {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("id, full_name, city, profession, bio, avatar_url, created_at")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      if (!profile) return null;
      const { data: reviews } = await supabase
        .from("reviews")
        .select("id, rating, comment, created_at, profiles!reviews_client_profile_fkey(full_name, avatar_url)")
        .eq("professional_id", id)
        .order("created_at", { ascending: false });
      return { profile, reviews: (reviews ?? []) as unknown as ReviewRow[] };
    },
  });

  const reviews = data?.reviews ?? [];
  const count = reviews.length;
  const avg = count ? reviews.reduce((a, r) => a + r.rating, 0) / count : 0;

  const cta = (
    <Button asChild variant="cta" className="h-12 w-full text-base">
      <Link
        to={user ? "/requests/new" : "/auth"}
        search={
          user && data?.profile.profession
            ? { category: data.profile.profession, from: "provider" }
            : undefined
        }
      >
        {t("search.requestBid")}
      </Link>
    </Button>
  );

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-0">
      <SiteHeader />

      <div className="mx-auto max-w-7xl px-4 py-6 md:py-10">
        <Link
          to="/services"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <ArrowRight className="h-4 w-4 rtl:rotate-0 ltr:rotate-180" aria-hidden />
          {t("profile.back")}
        </Link>

        {authLoading || (user && isLoading) ? (
          <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-4">
              <Card className="flex items-center gap-4 p-6">
                <Skeleton className="h-20 w-20 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </Card>
              <Card className="space-y-3 p-6">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
              </Card>
            </div>
            <Skeleton className="hidden h-56 rounded-2xl lg:block" />
          </div>
        ) : !user ? (
          <Card className="mt-5 p-8 text-center">
            <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
              <UserRound className="h-6 w-6" aria-hidden />
            </div>
            <h1 className="text-lg font-bold text-primary-dark">{t("search.signInTitle")}</h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{t("search.signInDesc")}</p>
            <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
              <Button asChild variant="cta" className="h-11">
                <Link to="/auth">{t("nav.start")}</Link>
              </Button>
              <Button asChild variant="outline" className="h-11">
                <Link to="/services">{t("profile.back")}</Link>
              </Button>
            </div>
          </Card>
        ) : !data?.profile ? (
          <Card className="mt-5 p-8 text-center md:p-12">
            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary">
              <SearchX className="h-7 w-7" aria-hidden />
            </div>
            <h1 className="text-lg font-bold text-primary-dark md:text-xl">{t("profile.notFound")}</h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{t("profile.notFoundDesc")}</p>
            <Button asChild variant="cta" className="mt-5 h-11">
              <Link to="/services">{t("profile.back")}</Link>
            </Button>
          </Card>
        ) : (
          <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="min-w-0 space-y-5">
              {/* Header */}
              <Card className="p-6">
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                  <Avatar className="h-20 w-20 shrink-0 border border-border sm:h-24 sm:w-24">
                    {data.profile.avatar_url && (
                      <AvatarImage src={data.profile.avatar_url} alt={t("results.avatarAlt")} />
                    )}
                    <AvatarFallback className="bg-primary/10 text-xl font-bold text-primary">
                      {initials(data.profile.full_name || "") || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <h1 className="heading-strong text-xl md:text-2xl">{data.profile.full_name}</h1>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {data.profile.profession && (
                        <Badge variant="secondary" className="max-w-full truncate">
                          {categoryLabel(data.profile.profession, lang)}
                        </Badge>
                      )}
                      <span className="inline-flex min-w-0 items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 shrink-0" aria-hidden />
                        <span className="truncate">{data.profile.city}</span>
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                      {count > 0 ? (
                        <>
                          <StarRating value={avg} readOnly size={16} />
                          <span className="font-semibold">{avg.toFixed(1)}</span>
                          <span className="text-muted-foreground">
                            ({count} {count === 1 ? t("results.reviewsOne") : t("search.reviews")})
                          </span>
                        </>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <Star className="h-4 w-4" aria-hidden />
                          {t("search.noRating")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-5 lg:hidden">{cta}</div>
              </Card>

              {/* About */}
              <Card className="p-6">
                <h2 className="text-base font-bold text-primary-dark">{t("profile.about")}</h2>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
                  {data.profile.bio || t("profile.noBio")}
                </p>
              </Card>

              {/* Service info */}
              <Card className="p-6">
                <h2 className="text-base font-bold text-primary-dark">{t("profile.info")}</h2>
                <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                  {data.profile.profession && (
                    <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-card/60 p-3">
                      <Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                      <div className="min-w-0">
                        <dt className="text-xs text-muted-foreground">{t("profile.serviceType")}</dt>
                        <dd className="truncate text-sm font-medium">
                          {categoryLabel(data.profile.profession, lang)}
                        </dd>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-card/60 p-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <div className="min-w-0">
                      <dt className="text-xs text-muted-foreground">{t("profile.city")}</dt>
                      <dd className="truncate text-sm font-medium">{data.profile.city}</dd>
                    </div>
                  </div>
                  {data.profile.created_at && (
                    <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-card/60 p-3">
                      <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                      <div className="min-w-0">
                        <dt className="text-xs text-muted-foreground">{t("profile.memberSince")}</dt>
                        <dd className="truncate text-sm font-medium">
                          {format(new Date(data.profile.created_at), "MMMM yyyy", { locale: dateLocale })}
                        </dd>
                      </div>
                    </div>
                  )}
                </dl>
              </Card>

              {/* Reviews */}
              <Card className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-base font-bold text-primary-dark">{t("profile.reviewsTitle")}</h2>
                  {count > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <StarRating value={avg} readOnly size={14} />
                      <span className="font-semibold">{avg.toFixed(1)}</span>
                      <span className="text-muted-foreground">
                        ({count} {count === 1 ? t("results.reviewsOne") : t("search.reviews")})
                      </span>
                    </div>
                  )}
                </div>
                {count === 0 ? (
                  <p className="mt-3 text-sm text-muted-foreground">{t("profile.noReviews")}</p>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {reviews.map((r) => (
                      <li key={r.id} className="rounded-xl border border-border/70 p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 shrink-0 border border-border">
                            {r.profiles?.avatar_url && (
                              <AvatarImage src={r.profiles.avatar_url} alt={t("results.avatarAlt")} />
                            )}
                            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                              {initials(r.profiles?.full_name || "") || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="truncate text-sm font-semibold">
                                {r.profiles?.full_name || t("profile.reviewer")}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(r.created_at), "d MMM yyyy", { locale: dateLocale })}
                              </span>
                            </div>
                            <StarRating value={r.rating} readOnly size={14} />
                          </div>
                        </div>
                        {r.comment && (
                          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
                            {r.comment}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>

            {/* Sidebar */}
            <aside className="hidden lg:block">
              <Card className="sticky top-24 p-5">
                <h2 className="text-sm font-bold text-primary-dark">{t("profile.summary")}</h2>
                <div className="mt-3 space-y-2 text-sm">
                  {data.profile.profession && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                      <span className="truncate">{categoryLabel(data.profile.profession, lang)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <span className="truncate">{data.profile.city}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {count > 0 ? (
                      <>
                        <StarRating value={avg} readOnly size={14} />
                        <span className="font-semibold">{avg.toFixed(1)}</span>
                        <span className="text-muted-foreground">({count})</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">{t("search.noRating")}</span>
                    )}
                  </div>
                </div>
                <div className="mt-4">{cta}</div>
              </Card>
            </aside>
          </div>
        )}
      </div>

      {/* Mobile sticky CTA */}
      {user && data?.profile && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 backdrop-blur lg:hidden">
          <div className="mx-auto max-w-2xl">{cta}</div>
        </div>
      )}
    </div>
  );
}
