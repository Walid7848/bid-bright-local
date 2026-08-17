import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLang } from "@/lib/i18n";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationList } from "@/components/NotificationList";


export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({
    meta: [
      { title: "الإشعارات | وصلة — Meldingen" },
      {
        name: "description",
        content: "تابع كل التحديثات على طلباتك وعروضك في منصة وصلة: عروض جديدة، اختيار العروض، بدء التنفيذ والإنجاز.",
      },
      { property: "og:title", content: "الإشعارات | وصلة" },
      {
        property: "og:description",
        content: "كل التحديثات على طلباتك وعروضك في مكان واحد على منصة وصلة.",
      },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const { t } = useLang();
  const [tab, setTab] = useState<"all" | "unread">("all");
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications();

  const items = tab === "unread" ? notifications.filter((n) => !n.read_at) : notifications;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("notif.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("notif.pageSubtitle")}</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={() => markAllAsRead()}>
            {t("notif.markAll")}
          </Button>
        )}
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as "all" | "unread")} className="mt-6">
        <TabsList>
          <TabsTrigger value="all">{t("notif.all")}</TabsTrigger>
          <TabsTrigger value="unread">
            {t("notif.unread")}
            {unreadCount > 0 && ` (${unreadCount})`}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
        <NotificationList
          items={items}
          isLoading={isLoading}
          emptyText={tab === "unread" ? t("notif.emptyUnread") : t("notif.empty")}
          onSelect={(n) => {
            if (!n.read_at) markAsRead(n.id);
          }}
        />
      </div>
    </div>
  );
}
