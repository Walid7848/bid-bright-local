import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { X, Upload, Loader2 } from "lucide-react";
import { SignedImage } from "./SignedImage";
import { toast } from "sonner";

interface Props {
  userId: string;
  paths: string[];
  onChange: (paths: string[]) => void;
  max?: number;
}

export function ImageUpload({ userId, paths, onChange, max = 6 }: Props) {
  const [uploading, setUploading] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const remaining = max - paths.length;
    const list = Array.from(files).slice(0, remaining);
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of list) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name}: الحجم أكبر من 5 ميغا`);
          continue;
        }
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${userId}/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage
          .from("request-images")
          .upload(path, file, { cacheControl: "3600" });
        if (error) {
          toast.error(error.message);
          continue;
        }
        uploaded.push(path);
      }
      if (uploaded.length) onChange([...paths, ...uploaded]);
    } finally {
      setUploading(false);
    }
  }

  async function remove(path: string) {
    await supabase.storage.from("request-images").remove([path]);
    onChange(paths.filter((p) => p !== path));
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {paths.map((p) => (
          <div key={p} className="group relative aspect-square overflow-hidden rounded-lg border">
            <SignedImage path={p} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => remove(p)}
              className="absolute left-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition group-hover:opacity-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {paths.length < max && (
          <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/40 text-muted-foreground transition hover:border-primary hover:bg-primary/5 hover:text-primary">
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <Upload className="h-6 w-6" />
                <span className="text-xs">إضافة صورة</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              disabled={uploading}
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        حد أقصى {max} صور، حتى 5 ميغا لكل صورة
      </p>
    </div>
  );
}
