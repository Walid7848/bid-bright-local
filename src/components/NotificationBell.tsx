import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useLang } from "@/lib/i18n";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationList } from "@/components/NotificationList";

export function NotificationBell() {
  const { t, lang } = useLang();
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications();

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        aria-label={t("notif.open")}
        onClick={() => setOpen(true)}
        className="relative h-11 w-11 md:h-10 md:w-10"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 end-1 grid min-w-[18px] place-items-center rounded-full bg-secondary px-1 text-[10px] font-bold leading-[18px] text-secondary-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side={lang === "ar" ? "left" : "right"}
          className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
        >
          <SheetHeader className="border-b border-border px-4 py-4 text-start">
            <SheetTitle className="text-base">{t("notif.title")}</SheetTitle>
          </SheetHeader>

          {unreadCount > 0 && (
            <div className="border-b border-border px-3 py-2">
              <Button variant="ghost" size="sm" onClick={() => markAllAsRead()}>
                {t("notif.markAll")}
              </Button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            <NotificationList
              items={notifications}
              isLoading={isLoading}
              emptyText={t("notif.empty")}
              onSelect={(n) => {
                if (!n.read_at) markAsRead(n.id);
                setOpen(false);
              }}
            />
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
