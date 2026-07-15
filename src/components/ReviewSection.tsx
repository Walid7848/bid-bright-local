import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StarRating } from "./StarRating";
import { ImageUpload } from "./ImageUpload";
import { SignedImage } from "./SignedImage";
import { Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { toast } from "sonner";

interface Props {
  requestId: string;
  clientId: string;
  professionalId: string | null;
  isOwner: boolean;
}

export function ReviewSection({ requestId, clientId, professionalId, isOwner }: Props) {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: reviews, isLoading } = useQuery({
    queryKey: ["reviews", requestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*, profiles!reviews_client_id_fkey(full_name)")
        .eq("request_id", requestId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const myReview = reviews?.find((r: any) => r.client_id === user?.id);
  const canReview = isOwner && professionalId && !myReview;

  return (
    <div>
      <h2 className="mb-3 text-lg font-bold">التقييمات</h2>
      {canReview && (
        <ReviewForm
          requestId={requestId}
          clientId={clientId}
          professionalId={professionalId!}
          onDone={() => qc.invalidateQueries({ queryKey: ["reviews", requestId] })}
        />
      )}
      {isLoading ? (
        <div className="h-20 animate-pulse rounded-xl bg-muted" />
      ) : !reviews || reviews.length === 0 ? (
        !canReview && (
          <Card className="p-6 text-center text-sm text-muted-foreground">
            لا يوجد تقييم بعد
          </Card>
        )
      ) : (
        <div className="mt-3 space-y-3">
          {reviews.map((r: any) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewForm({
  requestId,
  clientId,
  professionalId,
  onDone,
}: {
  requestId: string;
  clientId: string;
  professionalId: string;
  onDone: () => void;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1) return toast.error("اختر تقييماً بالنجوم");
    setLoading(true);
    const { error } = await supabase.from("reviews").insert({
      request_id: requestId,
      client_id: clientId,
      professional_id: professionalId,
      rating,
      comment,
      images,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("تم إرسال التقييم");
    setComment("");
    setImages([]);
    onDone();
  }

  return (
    <Card className="p-5 shadow-soft">
      <div className="text-xs font-medium uppercase text-muted-foreground">
        قيّم صاحب المهنة
      </div>
      <form onSubmit={submit} className="mt-3 space-y-3">
        <div className="space-y-1.5">
          <Label>التقييم</Label>
          <StarRating value={rating} onChange={setRating} size={28} />
        </div>
        <div className="space-y-1.5">
          <Label>تعليقك</Label>
          <Textarea
            required
            rows={3}
            maxLength={500}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="كيف كانت تجربتك؟"
          />
        </div>
        <div className="space-y-1.5">
          <Label>صور النتيجة (اختياري)</Label>
          <ImageUpload userId={clientId} paths={images} onChange={setImages} max={4} />
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
          إرسال التقييم
        </Button>
      </form>
    </Card>
  );
}

function ReviewCard({ review }: { review: any }) {
  return (
    <Card className="p-5 shadow-soft">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarFallback className="bg-gradient-primary text-primary-foreground">
            {(review.profiles?.full_name || "؟").slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="font-semibold">{review.profiles?.full_name || "زبون"}</div>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(review.created_at), {
                addSuffix: true,
                locale: ar,
              })}
            </span>
          </div>
          <StarRating value={review.rating} readOnly size={16} />
        </div>
      </div>
      {review.comment && (
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{review.comment}</p>
      )}
      {review.images?.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-1 sm:grid-cols-4">
          {review.images.map((p: string) => (
            <SignedImage
              key={p}
              path={p}
              className="aspect-square w-full rounded object-cover"
            />
          ))}
        </div>
      )}
    </Card>
  );
}
