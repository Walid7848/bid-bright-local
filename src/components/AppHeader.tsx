import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { Briefcase, LogOut, Plus, User as UserIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useLang, LanguageSwitch } from "@/lib/i18n";

export function AppHeader() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const router = useRouter();
  const qc = useQueryClient();
  const { t } = useLang();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, city")
        .eq("id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  const { data: roleData } = useQuery({
    queryKey: ["my-role", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  const isClient = roleData?.role === "client";

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
    router.invalidate();
  }

  const initials = (profile?.full_name || user?.email || "؟").slice(0, 2);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-surface/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/requests" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-glow">
            <Briefcase className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">{t("brand.name")}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link
            to="/requests"
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
            activeProps={{ className: "text-foreground bg-accent" }}
          >
            {t("nav.requests")}
          </Link>
          {isClient && (
            <Link
              to="/my-requests"
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
              activeProps={{ className: "text-foreground bg-accent" }}
            >
              {t("nav.myRequests")}
            </Link>
          )}
          {roleData?.role === "professional" && (
            <Link
              to="/my-bids"
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
              activeProps={{ className: "text-foreground bg-accent" }}
            >
              {t("nav.myBids")}
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitch />
          {isClient && (
            <Button asChild size="sm" className="gap-1">
              <Link to="/requests/new">
                <Plus className="h-4 w-4" />
                {t("nav.newRequest")}
              </Link>
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="grid h-9 w-9 place-items-center rounded-full ring-2 ring-transparent transition hover:ring-primary/40">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="font-semibold">{profile?.full_name || user?.email}</div>
                {profile?.city && (
                  <div className="text-xs font-normal text-muted-foreground">{profile.city}</div>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile">
                  <UserIcon className="ml-2 h-4 w-4" />
                  {t("nav.profile")}
                </Link>
              </DropdownMenuItem>
              {roleData?.role === "professional" && (
                <DropdownMenuItem asChild>
                  <Link to="/subscription">
                    <Sparkles className="ml-2 h-4 w-4" />
                    الاشتراك
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-destructive">
                <LogOut className="ml-2 h-4 w-4" />
                {t("nav.signOut")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
