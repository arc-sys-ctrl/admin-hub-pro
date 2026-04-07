import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Eye, Package, Clock, CheckCircle, Truck } from "lucide-react";

interface Order {
  id: string;
  customer: string;
  email: string;
  items: number;
  amount: string;
  status: "pending" | "processing" | "in_transit" | "delivered" | "cancelled";
  date: string;
  address: string;
}

const mockOrders: Order[] = [
  { id: "ORD-001", customer: "Alice Mwangi", email: "alice@email.com", items: 3, amount: "KSh 4,500", status: "delivered", date: "Apr 7, 2026", address: "Nairobi CBD" },
  { id: "ORD-002", customer: "Brian Ochieng", email: "brian@email.com", items: 1, amount: "KSh 2,300", status: "pending", date: "Apr 7, 2026", address: "Westlands" },
  { id: "ORD-003", customer: "Carol Njeri", email: "carol@email.com", items: 5, amount: "KSh 8,900", status: "in_transit", date: "Apr 6, 2026", address: "Karen" },
  { id: "ORD-004", customer: "David Kimani", email: "david@email.com", items: 2, amount: "KSh 1,200", status: "delivered", date: "Apr 6, 2026", address: "Kilimani" },
  { id: "ORD-005", customer: "Eva Akinyi", email: "eva@email.com", items: 4, amount: "KSh 6,700", status: "pending", date: "Apr 5, 2026", address: "Langata" },
  { id: "ORD-006", customer: "Frank Wafula", email: "frank@email.com", items: 1, amount: "KSh 3,400", status: "processing", date: "Apr 5, 2026", address: "Parklands" },
  { id: "ORD-007", customer: "Grace Wanjiku", email: "grace@email.com", items: 2, amount: "KSh 5,600", status: "cancelled", date: "Apr 4, 2026", address: "South B" },
];

const statusStyles: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-0",
  processing: "bg-primary/10 text-primary border-0",
  in_transit: "bg-primary/10 text-primary border-0",
  delivered: "bg-success/10 text-success border-0",
  cancelled: "bg-destructive/10 text-destructive border-0",
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="h-3.5 w-3.5" />,
  processing: <Package className="h-3.5 w-3.5" />,
  in_transit: <Truck className="h-3.5 w-3.5" />,
  delivered: <CheckCircle className="h-3.5 w-3.5" />,
  cancelled: <Package className="h-3.5 w-3.5" />,
};

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");

  const filtered = mockOrders.filter((o) => {
    const matchSearch = o.customer.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase());
    if (tab === "all") return matchSearch;
    return matchSearch && o.status === tab;
  });

  const counts = {
    all: mockOrders.length,
    pending: mockOrders.filter((o) => o.status === "pending").length,
    processing: mockOrders.filter((o) => o.status === "processing").length,
    in_transit: mockOrders.filter((o) => o.status === "in_transit").length,
    delivered: mockOrders.filter((o) => o.status === "delivered").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Orders</h1>
        <p className="text-muted-foreground">Track and manage all customer orders</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({counts.pending})</TabsTrigger>
          <TabsTrigger value="processing">Processing ({counts.processing})</TabsTrigger>
          <TabsTrigger value="in_transit">In Transit ({counts.in_transit})</TabsTrigger>
          <TabsTrigger value="delivered">Delivered ({counts.delivered})</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search orders..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Order</th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer</th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Items</th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-right p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-medium text-sm text-foreground">{order.id}</td>
                    <td className="p-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">{order.customer}</p>
                        <p className="text-xs text-muted-foreground">{order.address}</p>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{order.date}</td>
                    <td className="p-4 text-sm text-foreground">{order.items}</td>
                    <td className="p-4 text-sm font-semibold text-foreground">{order.amount}</td>
                    <td className="p-4">
                      <Badge className={`${statusStyles[order.status]} flex items-center gap-1 w-fit`}>
                        {statusIcons[order.status]}
                        {order.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
