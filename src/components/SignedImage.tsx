import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ImageIcon } from "lucide-react";

interface Props {
  path: string;
  className?: string;
  alt?: string;
}

export function SignedImage({ path, className, alt = "" }: Props) {
  const { data: url } = useQuery({
    queryKey: ["signed-image", path],
    staleTime: 55 * 60 * 1000,
    queryFn: async () => {
      const { data } = await supabase.storage
        .from("request-images")
        .createSignedUrl(path, 60 * 60);
      return data?.signedUrl ?? null;
    },
  });

  if (!url) {
    return (
      <div
        className={
          "grid place-items-center bg-muted text-muted-foreground " + (className ?? "")
        }
      >
        <ImageIcon className="h-6 w-6 opacity-40" />
      </div>
    );
  }
  return <img src={url} alt={alt} className={className} loading="lazy" />;
}
