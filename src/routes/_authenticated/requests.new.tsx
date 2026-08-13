import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CITIES } from "@/lib/cities";
import { CATEGORIES } from "@/lib/categories";
import { categoryLabel, suggestServices } from "@/lib/service-search";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/ImageUpload";
import {
  Loader2,
  Search,
  Check,
  ChevronLeft,
  ChevronRight,
  MapPin,
  ImagePlus,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useRoles } from "@/hooks/useRoles";
import { useLang } from "@/lib/i18n";

type Search = { category?: string; from?: string };

export const Route = createFileRoute("/_authenticated/requests/new")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    category: typeof search.category === "string" ? search.category : undefined,
    from: typeof search.from === "string" ? search.from : undefined,
  }),
  component: NewRequest,
});

const STEP_KEYS = ["nr.step1", "nr.step2", "nr.step3", "nr.step4"] as const;

function NewRequest() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { category: presetCategory, from } = Route.useSearch();
  const { t, lang } = useLang();
  const { roles, hasRole, switchRole, loading: rolesLoading } = useRoles();
  const rtl = lang === "ar";

  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(presetCategory ?? "");
  const [city, setCity] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState("");
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || rolesLoading) return;
    if (roles.length === 0) {
      navigate({ to: "/onboarding" });
      return;
    }
    if (!hasRole("client")) {
      setAllowed(false);
      return;
    }
    (async () => {
      const { data: p } = await supabase
        .from("profiles")
        .select("city")
        .eq("id", user.id)
        .maybeSingle();
      if (p?.city) setCity(p.city);
      setAllowed(true);
    })();
  }, [user, navigate, rolesLoading, roles.length, hasRole]);

  const suggestions = useMemo(() => suggestServices(query, lang, 6), [query, lang]);

  const errors = {
    category: !category ? t("nr.errCategory") : "",
    title: title.trim().length < 3 ? t("nr.errTitle") : "",
    description: description.trim().length < 10 ? t("nr.errDesc") : "",
    city: !city ? t("nr.errCity") : "",
    budget:
      budgetMin && budgetMax && Number(budgetMax) < Number(budgetMin)
        ? t("nr.errBudget")
        : "",
  };

  const stepFields: string[][] = [
    ["category"],
    ["title", "description", "budget"],
    ["city"],
    [],
  ];

  function stepValid(i: number) {
    return stepFields[i].every((f) => !errors[f as keyof typeof errors]);
  }

  function show(field: keyof typeof errors) {
    return touched[field] && errors[field] ? errors[field] : "";
  }

  function goNext() {
    const fields = stepFields[step];
    setTouched((prev) => ({ ...prev, ...Object.fromEntries(fields.map((f) => [f, true])) }));
    if (!stepValid(step)) return;
    setStep((s) => Math.min(s + 1, 3));
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || loading) return;
    setTouched({ category: true, title: true, description: true, city: true, budget: true });
    if (![0, 1, 2].every(stepValid)) {
      setStep([0, 1, 2].find((i) => !stepValid(i)) ?? 0);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("requests")
        .insert({
          client_id: user.id,
          title,
          description,
          category,
          city,
          budget_min: budgetMin ? Number(budgetMin) : null,
          budget_max: budgetMax ? Number(budgetMax) : null,
          images,
        })
        .select("id")
        .single();
      if (error) throw error;
      setCreatedId(data.id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "خطأ في النشر");
    } finally {
      setLoading(false);
    }
  }

  if (allowed === false) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-xl font-bold">{t("role.client")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("role.enableHint")}</p>
        <Button
          className="mt-4"
          onClick={async () => {
            try {
              await switchRole("client");
              setAllowed(true);
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Error");
            }
          }}
        >
          {t("role.switch")}
        </Button>
      </div>
    );
  }

  if (allowed === null || !user) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (createdId) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success/10">
          <CheckCircle2 className="h-9 w-9 text-success" />
        </div>
        <h1 className="mt-5 text-2xl font-bold">{t("nr.successTitle")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("nr.successDesc")}</p>
        <div className="mt-7 flex flex-col gap-3">
          <Button asChild size="lg" variant="cta" className="min-h-11 w-full">
            <Link to="/requests/$id" params={{ id: createdId }}>
              {t("nr.viewRequest")}
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="min-h-11 w-full">
            <Link to="/">{t("nr.goHome")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  const Next = rtl ? ChevronLeft : ChevronRight;
  const Prev = rtl ? ChevronRight : ChevronLeft;

  return (
    <div ref={topRef} className="mx-auto w-full max-w-2xl px-4 py-8 pb-28 sm:pb-10">
      <header className="text-center sm:text-start">
        <h1 className="text-2xl font-bold sm:text-3xl">{t("nr.title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("nr.subtitle")}</p>
      </header>

      {/* Progress */}
      <ol className="mt-6 flex items-center gap-2" aria-label={t("nr.stepOf")}>
        {STEP_KEYS.map((k, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <li key={k} className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span
                className={
                  "h-1.5 w-full rounded-full transition-colors " +
                  (done || active ? "bg-primary" : "bg-border")
                }
              />
              <span
                className={
                  "flex items-center gap-1 truncate text-[11px] font-medium sm:text-xs " +
                  (active ? "text-primary" : "text-muted-foreground")
                }
                aria-current={active ? "step" : undefined}
              >
                {done ? <Check className="h-3 w-3 shrink-0" /> : <span>{`0${i + 1}`}</span>}
                <span className="truncate">{t(k)}</span>
              </span>
            </li>
          );
        })}
      </ol>

      <form onSubmit={submit} noValidate>
        <Card className="mt-5 p-5 shadow-soft sm:p-6">
          {/* Step 1 — service */}
          {step === 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">{t("nr.serviceQ")}</h2>
              {presetCategory && from === "provider" && (
                <p className="rounded-xl bg-primary/5 px-3 py-2 text-xs text-primary">
                  {t("nr.fromProvider")}
                </p>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="svc-search">{t("nr.searchService")}</Label>
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground ltr:left-3 rtl:right-3" />
                  <Input
                    id="svc-search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t("nr.searchService")}
                    className="min-h-11 ltr:pl-9 rtl:pr-9"
                    autoComplete="off"
                  />
                </div>
                {query.trim() && (
                  <div className="mt-2 space-y-1">
                    {suggestions.length === 0 && (
                      <p className="text-xs text-muted-foreground">{t("nr.noMatch")}</p>
                    )}
                    {suggestions.map((s) => (
                      <button
                        key={s.label + s.category}
                        type="button"
                        onClick={() => {
                          setCategory(s.category);
                          setTouched((p) => ({ ...p, category: true }));
                          setQuery("");
                        }}
                        className="flex min-h-11 w-full items-center justify-between gap-2 rounded-xl border border-border px-3 text-start text-sm transition hover:border-primary hover:bg-primary/5"
                      >
                        <span className="truncate">{s.label}</span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {s.categoryLabel}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <fieldset className="space-y-2">
                <legend className="mb-2 text-sm font-medium">{t("nr.pickCategory")}</legend>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((c) => {
                    const selected = category === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => {
                          setCategory(c.id);
                          setTouched((p) => ({ ...p, category: true }));
                        }}
                        className={
                          "flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-start text-sm transition " +
                          (selected
                            ? "border-primary bg-primary/10 font-semibold text-primary"
                            : "border-border hover:border-primary/50 hover:bg-muted/50")
                        }
                      >
                        {selected && <Check className="h-4 w-4 shrink-0" />}
                        <span className="truncate">{categoryLabel(c.id, lang)}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
              <FieldError message={show("category")} />
            </section>
          )}

          {/* Step 2 — details */}
          {step === 1 && (
            <section className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="req-title">{t("nr.titleQ")}</Label>
                <Input
                  id="req-title"
                  value={title}
                  maxLength={120}
                  className="min-h-11"
                  placeholder={t("nr.titlePh")}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={() => setTouched((p) => ({ ...p, title: true }))}
                  aria-invalid={!!show("title")}
                />
                <FieldError message={show("title")} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="req-desc">{t("nr.descQ")}</Label>
                <Textarea
                  id="req-desc"
                  rows={6}
                  maxLength={2000}
                  value={description}
                  placeholder={t("nr.descPh")}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={() => setTouched((p) => ({ ...p, description: true }))}
                  aria-invalid={!!show("description")}
                />
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground">{t("nr.descHint")}</p>
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    {description.length}/2000
                  </span>
                </div>
                <FieldError message={show("description")} />
              </div>

              <div className="space-y-1.5">
                <Label>{t("nr.budget")}</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="bmin" className="text-xs text-muted-foreground">
                      {t("nr.from")} (€)
                    </Label>
                    <Input
                      id="bmin"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      className="min-h-11"
                      value={budgetMin}
                      onChange={(e) => setBudgetMin(e.target.value)}
                      onBlur={() => setTouched((p) => ({ ...p, budget: true }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="bmax" className="text-xs text-muted-foreground">
                      {t("nr.to")} (€)
                    </Label>
                    <Input
                      id="bmax"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      className="min-h-11"
                      value={budgetMax}
                      onChange={(e) => setBudgetMax(e.target.value)}
                      onBlur={() => setTouched((p) => ({ ...p, budget: true }))}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{t("nr.budgetHint")}</p>
                <FieldError message={show("budget")} />
              </div>
            </section>
          )}

          {/* Step 3 — location + photos */}
          {step === 2 && (
            <section className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="req-city" className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {t("nr.locationQ")}
                </Label>
                <Select
                  value={city}
                  onValueChange={(v) => {
                    setCity(v);
                    setTouched((p) => ({ ...p, city: true }));
                  }}
                >
                  <SelectTrigger id="req-city" className="min-h-11" aria-invalid={!!show("city")}>
                    <SelectValue placeholder={t("nr.pickCity")} />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {CITIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError message={show("city")} />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <ImagePlus className="h-4 w-4 text-muted-foreground" />
                  {t("nr.photos")}
                </Label>
                <p className="text-xs text-muted-foreground">{t("nr.photosHint")}</p>
                <ImageUpload userId={user.id} paths={images} onChange={setImages} />
              </div>
            </section>
          )}

          {/* Step 4 — review */}
          {step === 3 && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">{t("nr.reviewTitle")}</h2>
              <ReviewRow label={t("nr.category")} onEdit={() => setStep(0)} editLabel={t("nr.edit")}>
                {categoryLabel(category, lang)}
              </ReviewRow>
              <ReviewRow label={t("nr.titleQ")} onEdit={() => setStep(1)} editLabel={t("nr.edit")}>
                {title}
              </ReviewRow>
              <ReviewRow label={t("nr.descQ")} onEdit={() => setStep(1)} editLabel={t("nr.edit")}>
                <span className="whitespace-pre-wrap">{description}</span>
              </ReviewRow>
              <ReviewRow label={t("nr.budget")} onEdit={() => setStep(1)} editLabel={t("nr.edit")}>
                {budgetMin || budgetMax
                  ? `${budgetMin || "—"} € — ${budgetMax || "—"} €`
                  : t("nr.noBudget")}
              </ReviewRow>
              <ReviewRow label={t("nr.city")} onEdit={() => setStep(2)} editLabel={t("nr.edit")}>
                {city}
              </ReviewRow>
              <ReviewRow label={t("nr.photos")} onEdit={() => setStep(2)} editLabel={t("nr.edit")}>
                {images.length ? `${images.length} ${t("nr.photosCount")}` : "—"}
              </ReviewRow>
            </section>
          )}
        </Card>

        {/* Actions */}
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 p-3 backdrop-blur sm:static sm:mt-5 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
          <div className="mx-auto flex max-w-2xl items-center gap-3">
            {step > 0 && (
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="min-h-11"
                onClick={goBack}
              >
                <Prev className="h-4 w-4" />
                {t("nr.back")}
              </Button>
            )}
            {step < 3 ? (
              <Button type="button" size="lg" className="min-h-11 flex-1" onClick={goNext}>
                {t("nr.next")}
                <Next className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                size="lg"
                variant="cta"
                className="min-h-11 flex-1"
                disabled={loading}
                aria-busy={loading}
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? t("nr.submitting") : t("nr.submit")}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

function FieldError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="flex items-center gap-1.5 text-xs font-medium text-destructive">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      {message}
    </p>
  );
}

function ReviewRow({
  label,
  children,
  onEdit,
  editLabel,
}: {
  label: string;
  children: React.ReactNode;
  onEdit: () => void;
  editLabel: string;
}) {
  return (
    <div className="rounded-xl border border-border p-3">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <button
          type="button"
          onClick={onEdit}
          className="shrink-0 text-xs font-semibold text-primary underline-offset-4 hover:underline"
        >
          {editLabel}
        </button>
      </div>
      <div className="mt-1 break-words text-sm">{children}</div>
    </div>
  );
}
