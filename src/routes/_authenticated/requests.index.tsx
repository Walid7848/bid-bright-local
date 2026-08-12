import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CITIES } from "@/lib/cities";
import { CATEGORIES, CATEGORY_MAP } from "@/lib/categories";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SignedImage } from "@/components/SignedImage";
import { MapPin, Clock, Users, Image as ImageIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

export const Route = createFileRoute("/_authenticated/requests/")({
  component: RequestsIndex,
});

function RequestsIndex() {
  const { user } = useAuth();
  const [cityFilter, setCityFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("city")
        .eq("id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  const activeCity = cityFilter || profile?.city || "";

  const { data: requests, isLoading } = useQuery({
    queryKey: ["requests", activeCity, categoryFilter],
    queryFn: async () => {
      let q = supabase
        .from("requests")
        .select("*, profiles!requests_client_profile_fkey(full_name), bids(count)")
        .eq("status", "open")
        .order("created_at", { ascending: false });
      if (activeCity) q = q.eq("city", activeCity);
      if (categoryFilter) q = q.eq("category", categoryFilter);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">الطلبات المتاحة</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            طلبات مفتوحة {activeCity && `في ${activeCity}`}
          </p>
        </div>
      </div>

      <div className="mb-6 grid gap-3 rounded-xl border bg-card p-4 shadow-soft sm:grid-cols-2">
        <Select value={cityFilter || "__all__"} onValueChange={(v) => setCityFilter(v === "__all__" ? "" : v)}>
          <SelectTrigger>
            <SelectValue placeholder="كل المدن" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">كل المدن</SelectItem>
            {CITIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={categoryFilter || "__all__"}
          onValueChange={(v) => setCategoryFilter(v === "__all__" ? "" : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="كل الفئات" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">كل الفئات</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : !requests || requests.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-muted">
            <ImageIcon className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-semibold">لا توجد طلبات مطابقة</h3>
          <p className="mt-1 text-sm text-muted-foreground">جرب تغيير الفلاتر أو تحقق لاحقاً</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {requests.map((r: any) => (
            <Link
              key={r.id}
              to="/requests/$id"
              params={{ id: r.id }}
              className="group overflow-hidden rounded-xl border bg-card shadow-soft transition hover:-translate-y-0.5 hover:shadow-elegant"
            >
              <div className="relative h-40 bg-muted">
                {r.images?.[0] ? (
                  <SignedImage
                    path={r.images[0]}
                    className="h-full w-full object-cover"
                    alt={r.title}
                  />
                ) : (
                  <div className="grid h-full place-items-center text-muted-foreground">
                    <ImageIcon className="h-10 w-10 opacity-30" />
                  </div>
                )}
                <Badge className="absolute right-3 top-3 bg-surface text-foreground shadow">
                  {CATEGORY_MAP[r.category] || r.category}
                </Badge>
              </div>
              <div className="space-y-3 p-4">
                <h3 className="line-clamp-1 text-base font-bold group-hover:text-primary">
                  {r.title}
                </h3>
                <p className="line-clamp-2 text-sm text-muted-foreground">{r.description}</p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {r.city}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {r.bids?.[0]?.count ?? 0} عرض
                  </span>
                  <span className="mr-auto flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDistanceToNow(new Date(r.created_at), {
                      addSuffix: true,
                      locale: ar,
                    })}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
