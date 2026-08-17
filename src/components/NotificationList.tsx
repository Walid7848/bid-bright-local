import {
  CheckCircle2,
  Inbox,
  PlayCircle,
  Star,
  ThumbsDown,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/i18n";
import { Skeleton } from "@/components/ui/skeleton";
import type { AppNotification, NotificationType } from "@/hooks/useNotifications";

const ICONS: Record<NotificationType, LucideIcon> = {
  bid_received: Inbox,
  bid_accepted: CheckCircle2,
  bid_rejected: ThumbsDown,
  request_started: PlayCircle,
  request_completed: Sparkles,
  review_reminder: Star,
};

// informational = blue, success = green, action/reminder = orange, neutral = muted
const TONES: Record<NotificationType, string> = {
  bid_received: "bg-primary/10 text-primary",
  bid_accepted: "bg-success/10 text-success",
  bid_rejected: "bg-muted text-muted-foreground",
  request_started: "bg-primary/10 text-primary",
  request_completed: "bg-success/10 text-success",
  review_reminder: "bg-secondary/10 text-secondary",
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
    const d = Math.floor(h / 24);
    if (d === 1) return t("notif.time.yesterday");
    return t("notif.time.days").replace("{n}", String(d));
  };
}

export function NotificationSkeleton() {
  return (
    <ul className="divide-y divide-border">
      {[0, 1, 2, 3].map((i) => (
        <li key={i} className="flex items-start gap-3 px-4 py-3">
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2 py-1">
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-3 w-20" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function NotificationList({
  items,
  isLoading,
  emptyText,
  emptyHint,
  onSelect,
}: {
  items: AppNotification[];
  isLoading?: boolean;
  emptyText: string;
  emptyHint?: string;
  onSelect: (n: AppNotification) => void;
}) {
  const { t } = useLang();
  const rel = useRelativeTime();

  if (isLoading) return <NotificationSkeleton />;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-muted text-muted-foreground">
          <Inbox className="h-5 w-5" />
        </span>
        <p className="text-sm font-semibold text-foreground">{emptyText}</p>
        {emptyHint && (
          <p className="max-w-xs text-sm text-muted-foreground">{emptyHint}</p>
        )}
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {items.map((n) => {
        const Icon = ICONS[n.type] ?? Inbox;
        const unread = !n.read_at;
        return (
          <li key={n.id}>
            <button
              type="button"
              onClick={() => onSelect(n)}
              className={cn(
                "flex w-full min-h-[56px] items-start gap-3 px-4 py-3 text-start transition",
                "hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                unread && "bg-primary/[0.04]",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full",
                  TONES[n.type] ?? "bg-muted text-muted-foreground",
                )}
              >
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    "block text-sm leading-snug",
                    unread ? "font-semibold text-foreground" : "font-normal text-foreground/80",
                  )}
                >
                  {t(`notif.type.${n.type}` as never)}
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {rel(n.created_at)}
                </span>
              </span>
              {unread && (
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden />
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
