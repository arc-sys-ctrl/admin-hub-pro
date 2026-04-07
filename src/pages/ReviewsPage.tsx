import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { MessageSquare, ThumbsUp, TrendingUp } from "lucide-react";

const reviews = [
  { id: "1", customer: "Alice Mwangi", product: "Silk Evening Dress", rating: 5, comment: "Absolutely stunning! The quality exceeded my expectations.", date: "Apr 6, 2026" },
  { id: "2", customer: "Brian Ochieng", product: "Classic Leather Bag", rating: 4, comment: "Great bag, love the craftsmanship. Shipping was a bit slow.", date: "Apr 5, 2026" },
  { id: "3", customer: "Carol Njeri", product: "Designer Sunglasses", rating: 5, comment: "Perfect fit and style. Will definitely buy again!", date: "Apr 4, 2026" },
  { id: "4", customer: "David Kimani", product: "Premium Watch", rating: 3, comment: "Watch is nice but the strap feels cheap. Expected more for the price.", date: "Apr 3, 2026" },
  { id: "5", customer: "Eva Akinyi", product: "Casual Sneakers", rating: 5, comment: "Most comfortable sneakers I've ever owned. True to size!", date: "Apr 2, 2026" },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`h-4 w-4 ${i <= rating ? "text-warning fill-warning" : "text-muted"}`} />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reviews</h1>
        <p className="text-muted-foreground">Customer feedback and ratings</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Reviews" value="892" change="+24 this week" changeType="positive" icon={MessageSquare} />
        <StatCard title="Avg. Rating" value="4.6" change="Out of 5.0" changeType="neutral" icon={Star} iconColor="bg-warning/10 text-warning" />
        <StatCard title="Positive Rate" value="94%" change="+2% vs last month" changeType="positive" icon={ThumbsUp} iconColor="bg-success/10 text-success" />
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id} className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                      {review.customer.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm text-foreground">{review.customer}</p>
                    <p className="text-xs text-muted-foreground">{review.product} • {review.date}</p>
                  </div>
                </div>
                <StarRating rating={review.rating} />
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">{review.comment}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
