import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { MessageSquare, ThumbsUp, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

interface ReviewRow {
  id: string;
  product_id: string;
  customer_name: string;
  product_name?: string | null;
  rating: number;
  comment?: string | null;
  created_at: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`h-4 w-4 ${i <= rating ? "text-warning fill-warning" : "text-muted"}`} />
      ))}
    </div>
  );
}

function formatReviewDate(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function ReviewsPage() {
  const { data: reviews = [], isLoading, isError } = useQuery<ReviewRow[]>({
    queryKey: ["admin-reviews"],
    queryFn: async () => {
      const res = await api.get("/reviews/admin");
      return res.data;
    },
  });

  const total = reviews.length;
  const avgRating =
    total > 0 ? reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0) / total : 0;
  const positiveRate =
    total > 0
      ? Math.round((reviews.filter((r) => Number(r.rating) >= 4).length / total) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reviews</h1>
        <p className="text-muted-foreground">Customer feedback from the database</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Reviews"
          value={String(total)}
          change="Live from database"
          changeType="positive"
          icon={MessageSquare}
        />
        <StatCard
          title="Avg. Rating"
          value={total ? avgRating.toFixed(1) : "—"}
          change="Out of 5.0"
          changeType="neutral"
          icon={Star}
          iconColor="bg-warning/10 text-warning"
        />
        <StatCard
          title="4★+ share"
          value={total ? `${positiveRate}%` : "—"}
          change="Approx. satisfaction"
          changeType="positive"
          icon={ThumbsUp}
          iconColor="bg-success/10 text-success"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : isError ? (
        <p className="text-center text-destructive text-sm py-8">Could not load reviews.</p>
      ) : reviews.length === 0 ? (
        <p className="text-center text-muted-foreground text-sm py-8">No reviews yet.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                        {(review.customer_name || "?")
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm text-foreground">{review.customer_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {review.product_name || "Product"} • {formatReviewDate(review.created_at)}
                      </p>
                    </div>
                  </div>
                  <StarRating rating={Number(review.rating) || 0} />
                </div>
                {review.comment ? (
                  <p className="text-sm text-foreground/80 leading-relaxed">{review.comment}</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No comment</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
