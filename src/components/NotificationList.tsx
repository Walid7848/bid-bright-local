import { useNavigate } from "@tanstack/react-router";
import {
  CheckCircle2,
  HandCoins,
  Hourglass,
  PartyPopper,
  Star,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/i18n";
import { Skeleton } from "@/components/ui/skeleton";
import type { AppNotification, NotificationType } from "@/hooks/useNotifications";

const ICONS: Record<NotificationType, LucideIcon> = {
  bid_received: HandCoins,
  bid_accepted: CheckCircle2,
  bid_rejected: XCircle,
  request_started: Hourglass,
  request_completed: PartyPopper,
  review_reminder: Star,
};

const TONES: Record<NotificationType, string> = {
  bid_received: "bg-primary/10 text-primary",
  bid_accepted: "bg-success/10 text-success",
  bid_rejected: "bg-muted text-muted-foreground",
  request_started: "bg-primary/10 text-primary",
  request_completed: "bg-success/10 text-success",
  review_reminder: "bg-secondary/15 text-secondary",
};

export function useRelativeTime() {
  const { t } = useLang();
  return (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return t("notif.time.now");
    if (m < 60) return t("notif.time.minutes").replace("{n}", String(m));
    const h = Math.floor(m / 60);
    if (h < 24) return t("notif.time.hours").replace("{n}", String(h));
    return t("notif.time.days").replace("{n}", String(Math.floor(h / 24)));
  };
}

export function NotificationList({
  items,
  isLoading,
  emptyText,
  onSelect,
}: {
  items: AppNotification[];
  isLoading?: boolean;
  emptyText: string;
  onSelect: (n: AppNotification) => void;
}) {
  const { t } = useLang();
  const rel = useRelativeTime();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-2 p-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return <p className="px-4 py-10 text-center text-sm text-muted-foreground">{emptyText}</p>;
  }

  return (
    <ul className="divide-y divide-border">
      {items.map((n) => {
        const Icon = ICONS[n.type] ?? HandCoins;
        const unread = !n.read_at;
        return (
          <li key={n.id}>
            <button
              type="button"
              onClick={() => {
                onSelect(n);
                if (n.request_id) navigate({ to: "/requests/$id", params: { id: n.request_id } });
              }}
              className={cn(
                "flex w-full min-h-[56px] items-start gap-3 px-4 py-3 text-start transition hover:bg-accent",
                unread && "bg-primary/5",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full",
                  TONES[n.type] ?? "bg-muted text-muted-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    "block truncate-none text-sm leading-snug",
                    unread ? "font-semibold text-foreground" : "text-muted-foreground",
                  )}
                >
                  {t(`notif.type.${n.type}` as never)}
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {rel(n.created_at)}
                </span>
              </span>
              {unread && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
