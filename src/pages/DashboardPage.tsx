import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, ShoppingCart, Users, Truck, TrendingUp, Package } from "lucide-react";

const recentOrders = [
  { id: "ORD-001", customer: "Alice Mwangi", amount: "KSh 4,500", status: "Delivered", date: "2 hrs ago" },
  { id: "ORD-002", customer: "Brian Ochieng", amount: "KSh 2,300", status: "Pending", date: "3 hrs ago" },
  { id: "ORD-003", customer: "Carol Njeri", amount: "KSh 8,900", status: "In Transit", date: "5 hrs ago" },
  { id: "ORD-004", customer: "David Kimani", amount: "KSh 1,200", status: "Delivered", date: "6 hrs ago" },
  { id: "ORD-005", customer: "Eva Akinyi", amount: "KSh 6,700", status: "Pending", date: "8 hrs ago" },
];

const statusColor: Record<string, string> = {
  Delivered: "bg-success/10 text-success border-0",
  Pending: "bg-warning/10 text-warning border-0",
  "In Transit": "bg-primary/10 text-primary border-0",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value="KSh 1.2M" change="+12.5% from last month" changeType="positive" icon={DollarSign} iconColor="bg-success/10 text-success" />
        <StatCard title="Total Orders" value="3,456" change="+8.2% from last month" changeType="positive" icon={ShoppingCart} iconColor="bg-primary/10 text-primary" />
        <StatCard title="Active Users" value="1,234" change="+3.1% from last month" changeType="positive" icon={Users} iconColor="bg-warning/10 text-warning" />
        <StatCard title="Active Deliveries" value="28" change="5 delayed" changeType="negative" icon={Truck} iconColor="bg-destructive/10 text-destructive" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                      <Package className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{order.customer}</p>
                      <p className="text-xs text-muted-foreground">{order.id} • {order.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-sm text-foreground">{order.amount}</span>
                    <Badge className={statusColor[order.status]}>{order.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Silk Evening Dress", sales: 234, revenue: "KSh 420K" },
                { name: "Classic Leather Bag", sales: 189, revenue: "KSh 340K" },
                { name: "Designer Sunglasses", sales: 156, revenue: "KSh 280K" },
                { name: "Premium Watch", sales: 134, revenue: "KSh 240K" },
              ].map((product, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-muted-foreground w-5">#{i + 1}</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.sales} sales</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-foreground">{product.revenue}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
