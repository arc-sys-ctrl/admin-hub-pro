import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, ShoppingCart, Users, Truck, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const statusColor: Record<string, string> = {
  delivered: "bg-success/10 text-success border-0",
  pending: "bg-warning/10 text-warning border-0",
  in_transit: "bg-primary/10 text-primary border-0",
  processing: "bg-primary/10 text-primary border-0",
};

export default function DashboardPage() {
  const { data: products = [] } = useQuery({
    queryKey: ["products-count"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("id, name, price, stock, status");
      return data || [];
    },
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["orders-recent"],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(5);
      return data || [];
    },
  });

  const totalRevenue = orders.reduce((sum: number, o: any) => sum + Number(o.total_amount || 0), 0);
  const activeProducts = products.filter((p: any) => p.status === "active").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={`KSh ${totalRevenue.toLocaleString()}`} change="Live data" changeType="positive" icon={DollarSign} iconColor="bg-success/10 text-success" />
        <StatCard title="Total Orders" value={orders.length} change="From database" changeType="positive" icon={ShoppingCart} iconColor="bg-primary/10 text-primary" />
        <StatCard title="Active Products" value={activeProducts} change={`${products.length} total`} changeType="neutral" icon={Package} iconColor="bg-warning/10 text-warning" />
        <StatCard title="Active Deliveries" value="0" change="No active deliveries" changeType="neutral" icon={Truck} iconColor="bg-destructive/10 text-destructive" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/50 shadow-sm bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <p className="text-muted-foreground text-sm py-8 text-center">No orders yet.</p>
            ) : (
              <div className="space-y-3">
                {orders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{order.customer_name}</p>
                        <p className="text-xs text-muted-foreground">{order.order_number}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-sm text-foreground">KSh {Number(order.total_amount).toLocaleString()}</span>
                      <Badge className={statusColor[order.status] || "bg-muted text-muted-foreground border-0"}>{order.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <p className="text-muted-foreground text-sm py-8 text-center">Add products to see stats.</p>
            ) : (
              <div className="space-y-4">
                {products.slice(0, 4).map((product: any, i: number) => (
                  <div key={product.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-muted-foreground w-5">#{i + 1}</span>
                      <div>
                        <p className="text-sm font-medium text-foreground">{product.name}</p>
                        <p className="text-xs text-muted-foreground">Stock: {product.stock}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-foreground">KSh {Number(product.price).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
