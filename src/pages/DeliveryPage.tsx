import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/StatCard";
import { Truck, MapPin, Clock, CheckCircle, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

interface OrderRow {
  id: string;
  order_number: string;
  customer_name: string;
  address?: string | null;
  status: string;
  total_amount?: number | string;
  created_at: string;
  updated_at?: string;
}

const FULFILLMENT_STATUSES = ["processing", "in_transit"] as const;

function progressForStatus(status: string) {
  if (status === "in_transit") return 70;
  if (status === "processing") return 35;
  return 20;
}

export default function DeliveryPage() {
  const { data: orders = [], isLoading, isError } = useQuery<OrderRow[]>({
    queryKey: ["admin-orders-delivery"],
    queryFn: async () => {
      const res = await api.get("/orders");
      return res.data;
    },
  });

  const activeDeliveries = useMemo(
    () => orders.filter((o) => FULFILLMENT_STATUSES.includes(o.status as (typeof FULFILLMENT_STATUSES)[number])),
    [orders]
  );

  const deliveredToday = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return orders.filter((o) => {
      if (o.status !== "delivered") return false;
      const t = new Date(o.updated_at || o.created_at);
      return t >= start;
    }).length;
  }, [orders]);

  const pendingCount = useMemo(() => orders.filter((o) => o.status === "pending").length, [orders]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Delivery Management</h1>
        <p className="text-muted-foreground">Orders in processing or in transit from your store</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="In fulfillment"
          value={String(activeDeliveries.length)}
          icon={Truck}
          iconColor="bg-success/10 text-success"
        />
        <StatCard
          title="Pending payment / new"
          value={String(pendingCount)}
          icon={Clock}
          iconColor="bg-warning/10 text-warning"
        />
        <StatCard
          title="Delivered today"
          value={String(deliveredToday)}
          icon={CheckCircle}
          iconColor="bg-primary/10 text-primary"
        />
        <StatCard
          title="Total orders"
          value={String(orders.length)}
          change="All statuses"
          changeType="neutral"
          icon={MapPin}
          iconColor="bg-muted text-muted-foreground"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm lg:row-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" /> Map
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] bg-secondary rounded-xl flex items-center justify-center relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
              />
              <div className="text-center z-10 px-4">
                <MapPin className="h-12 w-12 text-primary mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground">Live driver map not configured</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Fulfillment is driven by order status (processing → in transit → delivered). Update statuses on the
                  Orders page.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Active fulfillment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-12 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : isError ? (
              <p className="text-sm text-destructive text-center py-8">Could not load orders.</p>
            ) : activeDeliveries.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No orders in processing or in transit. Mark an order from Orders when it ships.
              </p>
            ) : (
              activeDeliveries.map((d) => (
                <div key={d.id} className="p-4 rounded-xl bg-secondary/50 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{d.customer_name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {d.order_number}
                        {d.address ? ` → ${d.address}` : ""}
                      </p>
                  {d.address ? (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(d.address)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-primary underline"
                    >
                      Open in Maps
                    </a>
                  ) : null}
                    </div>
                    <Badge className="bg-primary/10 text-primary border-0 shrink-0 capitalize">{d.status.replace("_", " ")}</Badge>
                  </div>
                  <Progress value={progressForStatus(d.status)} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    KSh {Number(d.total_amount || 0).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Delivery agents</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Courier profiles are not stored in Sophix yet. Use order status and customer shipping details on the
              Orders page to coordinate deliveries.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
