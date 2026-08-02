import { useState, type ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { useRoles, type AppRole } from "@/hooks/useRoles";
import { useLang } from "@/lib/i18n";

/**
 * Renders `children` only when the account currently operates in `role`.
 * Otherwise shows an inline notice with a one-click switch/activate action.
 * Mirrors the database RLS policies, which enforce the same rules server-side.
 */
export function RoleGate({
  role,
  children,
  description,
  compact = false,
}: {
  role: AppRole;
  children: ReactNode;
  description?: string;
  compact?: boolean;
}) {
  const { activeRole, switchRole, loading } = useRoles();
  const { t } = useLang();
  const [busy, setBusy] = useState(false);

  if (loading) {
    return (
      <div className="grid min-h-[120px] place-items-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (activeRole === role) return <>{children}</>;

  const roleLabel = t(role === "client" ? "role.client" : "role.professional");

  async function activate() {
    setBusy(true);
    try {
      await switchRole(role);
      toast.success(t("role.switched"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  const body = (
    <div className="text-center">
      <ShieldAlert className="mx-auto h-6 w-6 text-muted-foreground" />
      <h3 className="mt-2 font-semibold">
        {t("role.required")} — {roleLabel}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {description ?? t("role.requiredHint")}
      </p>
      <Button size="sm" className="mt-4" onClick={activate} disabled={busy}>
        {busy && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
        {t("role.activate")} — {roleLabel}
      </Button>
    </div>
  );

  return compact ? (
    <div className="rounded-lg border bg-muted/40 p-4">{body}</div>
  ) : (
    <Card className="p-8 shadow-soft">{body}</Card>
  );
}
