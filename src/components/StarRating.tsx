import { Star } from "lucide-react";

interface Props {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
  readOnly?: boolean;
}

export function StarRating({ value, onChange, size = 20, readOnly = false }: Props) {
  return (
    <div className="inline-flex items-center gap-0.5" dir="ltr">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= Math.round(value);
        const StarBtn = readOnly ? "span" : "button";
        return (
          <StarBtn
            key={n}
            type={readOnly ? undefined : "button"}
            onClick={readOnly ? undefined : () => onChange?.(n)}
            className={
              readOnly
                ? "inline-flex"
                : "inline-flex cursor-pointer transition hover:scale-110"
            }
            aria-label={`${n} stars`}
          >
            <Star
              style={{ width: size, height: size }}
              className={
                filled
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-transparent text-muted-foreground/40"
              }
            />
          </StarBtn>
        );
      })}
    </div>
  );
}
