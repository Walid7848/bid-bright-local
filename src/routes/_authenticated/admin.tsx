import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { Loader2, ShieldAlert, Users, FileText, Gavel, Star, Search } from "lucide-react";
import { getAdminOverview, isPlatformAdmin } from "@/lib/admin.functions";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "لوحة الإدارة | وصلة" },
      { name: "description", content: "لوحة إدارة داخلية لمنصة وصلة." },
      { property: "og:title", content: "لوحة الإدارة | وصلة" },
      { property: "og:description", content: "لوحة إدارة داخلية لمنصة وصلة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

const STATUS_AR: Record<string, string> = {
  open: "مفتوح",
  awarded: "مُسند",
  in_progress: "قيد التنفيذ",
  completed: "مكتمل",
  closed: "مغلق",
};
const ROLE_AR: Record<string, string> = { client: "عميل", professional: "محترف" };

function fmt(d: string | null) {
  return d ? new Date(d).toLocaleString("ar", { dateStyle: "medium", timeStyle: "short" }) : "—";
}

function AdminPage() {
  const checkAdmin = useServerFn(isPlatformAdmin);
  const fetchOverview = useServerFn(getAdminOverview);
  const [q, setQ] = useState("");

  const admin = useQuery({ queryKey: ["is-admin"], queryFn: () => checkAdmin() });
  const overview = useQuery({
    queryKey: ["admin-overview"],
    enabled: admin.data === true,
    queryFn: () => fetchOverview(),
  });

  const users = useMemo(() => {
    const list = overview.data?.users ?? [];
    const s = q.trim().toLowerCase();
    if (!s) return list;
    return list.filter((u) =>
      [u.email, u.full_name, u.city, u.phone].some((v) => v?.toLowerCase().includes(s)),
    );
  }, [overview.data, q]);

  if (admin.isLoading || (admin.data && overview.isLoading)) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (admin.data !== true || overview.isError) {
    return (
      <div className="mx-auto max-w-md py-24 text-center" dir="rtl">
        <ShieldAlert className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
        <p className="text-muted-foreground">هذه الصفحة متاحة لمسؤولي المنصة فقط.</p>
      </div>
    );
  }

  const d = overview.data!;
  const clients = d.users.filter((u) => u.roles.includes("client")).length;
  const pros = d.users.filter((u) => u.roles.includes("professional")).length;

  return (
    <div className="mx-auto max-w-[1280px] space-y-6 px-4 py-8" dir="rtl">
      <h1 className="text-2xl font-bold text-foreground">لوحة الإدارة</h1>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat icon={Users} label="الحسابات" value={d.users.length} sub={`${clients} عميل · ${pros} محترف`} />
        <Stat icon={FileText} label="الطلبات" value={d.totalRequests} />
        <Stat icon={Gavel} label="العروض" value={d.totalBids} />
        <Stat icon={Star} label="التقييمات" value={d.totalReviews} />
      </div>

      <Card className="p-4">
        <h2 className="mb-3 font-semibold text-foreground">الطلبات حسب الحالة</h2>
        <div className="flex flex-wrap gap-2">
          {Object.keys(STATUS_AR).map((s) => (
            <Badge key={s} variant="secondary">
              {STATUS_AR[s]}: {d.requestsByStatus[s] ?? 0}
            </Badge>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold text-foreground">المسجلون ({users.length})</h2>
          <div className="relative w-full max-w-xs">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث بالاسم أو البريد أو المدينة" className="pr-9" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-muted-foreground">
              <tr className="border-b border-border text-right">
                <th className="p-2 font-medium">الاسم</th>
                <th className="p-2 font-medium">البريد</th>
                <th className="p-2 font-medium">الهاتف</th>
                <th className="p-2 font-medium">المدينة</th>
                <th className="p-2 font-medium">الدور</th>
                <th className="p-2 font-medium">التسجيل</th>
                <th className="p-2 font-medium">آخر دخول</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0">
                  <td className="p-2 text-foreground">{u.full_name || "—"}</td>
                  <td className="p-2" dir="ltr">{u.email ?? "—"}</td>
                  <td className="p-2" dir="ltr">{u.phone ?? "—"}</td>
                  <td className="p-2">{u.city || "—"}</td>
                  <td className="p-2">
                    <div className="flex flex-wrap gap-1">
                      {u.roles.length ? u.roles.map((r) => <Badge key={r} variant="outline">{ROLE_AR[r] ?? r}</Badge>) : <span className="text-muted-foreground">بدون دور</span>}
                    </div>
                  </td>
                  <td className="whitespace-nowrap p-2">{fmt(u.created_at)}</td>
                  <td className="whitespace-nowrap p-2">{fmt(u.last_sign_in_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Stat({ icon: Icon, label, value, sub }: { icon: typeof Users; label: string; value: number; sub?: string }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span className="text-sm">{label}</span>
      </div>
      <div className="mt-2 text-2xl font-bold text-foreground">{value}</div>
      {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
    </Card>
  );
}
