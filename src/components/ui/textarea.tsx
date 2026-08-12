import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-24 w-full rounded-lg border border-input bg-card px-3 py-2 text-base text-foreground transition-colors",
          "placeholder:text-muted-foreground",
          "hover:border-primary/40",
          "focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/25",
          "aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive/25",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
