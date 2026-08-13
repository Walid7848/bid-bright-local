import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";
import { suggestServices, matchCategory } from "@/lib/service-search";

type Props = {
  initialQuery?: string;
  autoFocus?: boolean;
  className?: string;
};

export function ServiceSearchBar({ initialQuery = "", autoFocus, className = "" }: Props) {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const [q, setQ] = useState(initialQuery);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => setQ(initialQuery), [initialQuery]);

  const suggestions = useMemo(() => suggestServices(q, lang), [q, lang]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function go(query: string, category?: string | null) {
    setOpen(false);
    navigate({
      to: "/services",
      search: {
        q: query,
        cat: category ?? matchCategory(query, lang) ?? "",
        city: "",
        rating: 0,
      },
    });
  }

  return (
    <div ref={boxRef} className={`relative w-full ${className}`}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          go(q.trim());
        }}
        className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:gap-2 sm:rounded-2xl sm:border sm:border-border sm:bg-card sm:p-2 sm:shadow-soft"
      >
        <div className="relative flex min-w-0 flex-1 items-center rounded-xl border border-border bg-card sm:border-0 sm:bg-transparent">
          <Search className="pointer-events-none absolute start-3 h-5 w-5 text-muted-foreground" />
          <input
            type="search"
            value={q}
            autoFocus={autoFocus}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
              setActive(-1);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (!open || suggestions.length === 0) return;
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((i) => (i + 1) % suggestions.length);
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
              } else if (e.key === "Enter" && active >= 0) {
                e.preventDefault();
                const s = suggestions[active];
                go(s.label, s.category);
              } else if (e.key === "Escape") {
                setOpen(false);
              }
            }}
            placeholder={t("search.placeholder")}
            aria-label={t("search.title")}
            className="h-12 w-full min-w-0 bg-transparent ps-11 pe-3 text-base outline-none placeholder:text-muted-foreground/80 md:h-14"
          />
        </div>
        <Button type="submit" variant="cta" size="lg" className="h-12 shrink-0 gap-2 px-6 md:h-14">
          <Search className="h-4 w-4" />
          {t("search.button")}
        </Button>
      </form>

      {open && suggestions.length > 0 && (
        <ul
          role="listbox"
          className="absolute inset-x-0 top-full z-50 mt-2 max-h-72 overflow-y-auto rounded-2xl border border-border bg-card p-1.5 shadow-elegant"
        >
          {suggestions.map((s, i) => (
            <li key={s.label + s.category}>
              <button
                type="button"
                role="option"
                aria-selected={i === active}
                onMouseEnter={() => setActive(i)}
                onClick={() => go(s.label, s.category)}
                className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-start text-sm transition ${
                  i === active ? "bg-accent text-foreground" : "hover:bg-accent/60"
                }`}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate font-medium">{s.label}</span>
                </span>
                <span className="shrink-0 truncate text-xs text-muted-foreground">{s.categoryLabel}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
