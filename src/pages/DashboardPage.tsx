import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Package,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/StatCard";

const statusColor: Record<string, string> = {
  delivered: "bg-success/10 text-success border-0",
  pending: "bg-warning/10 text-warning border-0",
  cancelled: "bg-destructive/10 text-destructive border-0",
};

export default function DashboardPage() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    revenue: 0,
    customers: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiHealth, setApiHealth] = useState<{ ok: boolean; message: string }>({ ok: false, message: "Checking…" });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [productsRes, ordersRes, healthRes] = await Promise.all([
        api.get("/products/admin"),
        api.get("/orders"),
        api.get("/health").catch(() => null),
      ]);

      if (healthRes?.data?.status === "OK") {
        setApiHealth({ ok: true, message: "Reachable" });
      } else {
        setApiHealth({ ok: false, message: "No response" });
      }

      const products = productsRes.data || [];
      const orders = ordersRes.data || [];

      const revenue = orders
        .filter((o: any) => o.status !== 'cancelled')
        .reduce((acc: number, o: any) => acc + Number(o.total_amount || 0), 0);

      setStats({
        products: products.length,
        orders: orders.length,
        revenue: revenue,
        customers: [...new Set(orders.map((o: any) => o.customer_email))].length
      });

      setRecentOrders(orders.slice(0, 5));
    } catch (error) {
      console.error("Dashboard Fetch Error:", error);
      setApiHealth({ ok: false, message: "Error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Revenue" 
          value={`KSh ${stats.revenue.toLocaleString()}`} 
          change="Live data" 
          changeType="positive" 
          icon={DollarSign} 
          iconColor="bg-success/10 text-success" 
        />
        <StatCard 
          title="Total Orders" 
          value={stats.orders.toString()} 
          change="From database" 
          changeType="positive" 
          icon={ShoppingCart} 
          iconColor="bg-primary/10 text-primary" 
        />
        <StatCard 
          title="Active Products" 
          value={stats.products.toString()} 
          change="Catalog size" 
          changeType="neutral" 
          icon={Package} 
          iconColor="bg-warning/10 text-warning" 
        />
        <StatCard 
          title="Customers" 
          value={stats.customers.toString()} 
          change="Unique buyers" 
          changeType="positive" 
          icon={Users} 
          iconColor="bg-blue-500/10 text-blue-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/50 shadow-sm bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
               <div className="py-8 text-center text-muted-foreground text-sm">Loading orders...</div>
            ) : recentOrders.length === 0 ? (
              <p className="text-muted-foreground text-sm py-8 text-center">No orders yet.</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order: any) => (
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
                    <div className="text-right">
                      <p className="font-bold text-sm">KSh {Number(order.total_amount).toLocaleString()}</p>
                      <Badge className={`${statusColor[order.status] || ""} text-[10px] px-2 py-0`}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="border-border/50 shadow-sm bg-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">API health</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div
              className={`h-16 w-16 rounded-full flex items-center justify-center text-2xl font-bold ${
                apiHealth.ok ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
              }`}
            >
              {apiHealth.ok ? "✓" : "!"}
            </div>
            <div>
              <p className="font-medium text-foreground">
                {apiHealth.ok ? "Backend OK" : "Backend issue"}
              </p>
              <p className="text-xs text-muted-foreground">GET /api/health — {apiHealth.message}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Dashboard metrics load from your database via the same API the storefront uses.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
