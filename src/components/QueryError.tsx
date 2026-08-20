import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useLang } from "@/lib/i18n";

export function QueryError({ onRetry, className }: { onRetry: () => void; className?: string }) {
  const { t } = useLang();
  return (
    <Card className={"p-8 text-center shadow-soft " + (className ?? "")} role="alert">
      <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-5 w-5 text-destructive" />
      </div>
      <h3 className="font-semibold">{t("common.loadError")}</h3>
      <Button variant="outline" className="mt-4 h-11" onClick={onRetry}>
        {t("common.retry")}
      </Button>
    </Card>
  );
}
