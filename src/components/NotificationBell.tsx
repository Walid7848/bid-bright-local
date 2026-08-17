import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useLang } from "@/lib/i18n";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationList } from "@/components/NotificationList";

export function NotificationBell() {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, isLoading, isError, retry, markAsRead, markAllAsRead } =
    useNotifications();

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        aria-label={t("notif.open")}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        className="relative h-11 w-11 md:h-10 md:w-10"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 end-1 grid min-w-[18px] max-w-[26px] place-items-center overflow-hidden rounded-full bg-secondary px-1 text-[10px] font-bold leading-[18px] text-secondary-foreground">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
        <span className="sr-only" aria-live="polite">
          {unreadCount > 0 ? t("notif.unreadCount").replace("{n}", String(unreadCount)) : ""}
        </span>
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side={lang === "ar" ? "left" : "right"}
          className="flex w-full flex-col gap-0 p-0 sm:max-w-lg"
        >
          <SheetHeader className="border-b border-border px-4 py-4 text-start">
            <div className="flex items-center justify-between gap-3">
              <SheetTitle className="text-base">{t("notif.title")}</SheetTitle>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-primary hover:text-primary"
                  onClick={() => markAllAsRead()}
                >
                  {t("notif.markAll")}
                </Button>
              )}
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            {isError ? (
              <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
                <p className="text-sm text-muted-foreground">{t("notif.error")}</p>
                <Button variant="outline" size="sm" onClick={retry}>
                  {t("notif.retry")}
                </Button>
              </div>
            ) : (
              <NotificationList
                items={notifications}
                isLoading={isLoading}
                emptyText={t("notif.empty")}
                emptyHint={t("notif.emptyHint")}
                onSelect={(n) => {
                  if (!n.read_at) markAsRead(n.id);
                  setOpen(false);
                  if (n.request_id) {
                    navigate({ to: "/requests/$id", params: { id: n.request_id } });
                  }
                }}
              />
            )}
          </div>

          <div className="border-t border-border p-3">
            <Button asChild variant="outline" className="w-full" onClick={() => setOpen(false)}>
              <Link to="/notifications">{t("notif.viewAll")}</Link>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
