import { useState, useEffect } from "react";
import {
  Search,
  Eye,
  Package,
  Clock,
  CheckCircle,
  Truck,
  Loader2,
  Plus,
  Globe,
  Smartphone,
  Store,
  MonitorSmartphone,
} from "lucide-react";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreateOrderDialog } from "./CreateOrderDialog";

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  items: any[];
  total_amount: number;
  status: "pending" | "processing" | "in_transit" | "delivered" | "cancelled";
  source?: "customer" | "admin_crm";
  channel?: "website" | "app" | "in_store";
  payment_method?: string;
  notes?: string;
  created_at: string;
  address: string;
}

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

const channelConfig: Record<string, { icon: React.ReactNode; label: string; style: string }> = {
  website: {
    icon: <Globe className="h-3 w-3" />,
    label: "Web",
    style: "bg-blue-500/10 text-blue-500 border-0",
  },
  app: {
    icon: <Smartphone className="h-3 w-3" />,
    label: "App",
    style: "bg-violet-500/10 text-violet-500 border-0",
  },
  in_store: {
    icon: <Store className="h-3 w-3" />,
    label: "In-Store",
    style: "bg-amber-500/10 text-amber-500 border-0",
  },
};

const sourceConfig: Record<string, { label: string; style: string }> = {
  customer: { label: "Customer", style: "bg-muted text-muted-foreground border-0" },
  admin_crm: { label: "CRM", style: "bg-primary/10 text-primary border-0" },
};

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get("/orders");
      setOrders(response.data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, status: Order["status"]) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      setOrders(orders.map((o) => (o.id === orderId ? { ...o, status } : o)));
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.order_number.toLowerCase().includes(search.toLowerCase());
    if (tab === "all") return matchSearch;
    if (tab === "crm") return matchSearch && o.source === "admin_crm";
    return matchSearch && o.status === tab;
  });

  const counts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    processing: orders.filter((o) => o.status === "processing").length,
    in_transit: orders.filter((o) => o.status === "in_transit").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    crm: orders.filter((o) => o.source === "admin_crm").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground">Track and manage all customer orders</p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Create Order
        </Button>
      </div>

      {/* Status tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-card border border-border flex-wrap h-auto gap-1">
          <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({counts.pending})</TabsTrigger>
          <TabsTrigger value="processing">Processing ({counts.processing})</TabsTrigger>
          <TabsTrigger value="in_transit">In Transit ({counts.in_transit})</TabsTrigger>
          <TabsTrigger value="delivered">Delivered ({counts.delivered})</TabsTrigger>
          <TabsTrigger value="crm" className="text-primary data-[state=active]:bg-primary/10">
            <MonitorSmartphone className="h-3.5 w-3.5 mr-1" />
            CRM ({counts.crm})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search orders..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Orders table */}
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
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Channel</th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-right p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground text-sm">
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((order) => {
                    const ch = channelConfig[order.channel || "website"] || channelConfig.website;
                    const src = sourceConfig[order.source || "customer"] || sourceConfig.customer;
                    return (
                      <tr
                        key={order.id}
                        className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        {/* Order number + source badge */}
                        <td className="p-4">
                          <p className="font-medium text-sm text-foreground">{order.order_number}</p>
                          <Badge className={`text-[10px] mt-1 ${src.style}`}>{src.label}</Badge>
                        </td>

                        {/* Customer */}
                        <td className="p-4">
                          <p className="text-sm font-medium text-foreground">{order.customer_name}</p>
                          <p className="text-xs text-muted-foreground">{order.address || order.customer_email}</p>
                        </td>

                        {/* Date */}
                        <td className="p-4 text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>

                        {/* Items count */}
                        <td className="p-4 text-sm text-foreground">{order.items?.length || 0}</td>

                        {/* Amount */}
                        <td className="p-4 text-sm font-semibold text-foreground">
                          KES {Number(order.total_amount).toLocaleString()}
                        </td>

                        {/* Channel badge */}
                        <td className="p-4">
                          <Badge className={`flex items-center gap-1 w-fit text-[10px] ${ch.style}`}>
                            {ch.icon}
                            {ch.label}
                          </Badge>
                        </td>

                        {/* Status badge */}
                        <td className="p-4">
                          <Badge className={`${statusStyles[order.status]} flex items-center gap-1 w-fit`}>
                            {statusIcons[order.status]}
                            {order.status.replace("_", " ")}
                          </Badge>
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setDetailOrder(order)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <select
                              className="text-xs bg-background border border-border rounded px-1 h-8 focus:outline-none focus:ring-1 focus:ring-primary"
                              value={order.status}
                              onChange={(e) => updateStatus(order.id, e.target.value as any)}
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="in_transit">In Transit</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create Order Dialog */}
      <CreateOrderDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={fetchOrders}
      />

      {/* Order Detail Dialog */}
      <Dialog open={!!detailOrder} onOpenChange={(o) => !o && setDetailOrder(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Order {detailOrder?.order_number}</DialogTitle>
          </DialogHeader>
          {detailOrder && (
            <div className="space-y-4 text-sm">
              {/* Customer info */}
              <div className="rounded-xl border border-border p-4 space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">Customer</p>
                <p className="font-semibold text-foreground">{detailOrder.customer_name}</p>
                <p className="text-muted-foreground">{detailOrder.customer_email}</p>
                {detailOrder.customer_phone && (
                  <p className="text-muted-foreground">{detailOrder.customer_phone}</p>
                )}
                <p className="text-muted-foreground">{detailOrder.address}</p>
              </div>

              {/* Items */}
              {detailOrder.items && detailOrder.items.length > 0 && (
                <div className="rounded-xl border border-border p-4 space-y-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Items</p>
                  {detailOrder.items.map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between">
                      <span>
                        {item.product_name || item.name}
                        {item.size && <span className="text-muted-foreground ml-1">({item.size})</span>}
                        {" × "}{item.quantity}
                      </span>
                      <span className="font-semibold">
                        KES {(item.unit_price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-border pt-2 flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-primary">KES {Number(detailOrder.total_amount).toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* Meta */}
              <div className="rounded-xl border border-border p-4 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">Source</p>
                  <Badge className={`${sourceConfig[detailOrder.source || "customer"]?.style} text-[11px]`}>
                    {sourceConfig[detailOrder.source || "customer"]?.label}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">Channel</p>
                  {(() => {
                    const ch = channelConfig[detailOrder.channel || "website"] || channelConfig.website;
                    return (
                      <Badge className={`flex items-center gap-1 w-fit text-[11px] ${ch.style}`}>
                        {ch.icon}{ch.label}
                      </Badge>
                    );
                  })()}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">Payment</p>
                  <p className="capitalize font-medium">{(detailOrder.payment_method || "mpesa").replace("_", " ")}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">Date</p>
                  <p className="font-medium">{new Date(detailOrder.created_at).toLocaleString()}</p>
                </div>
                {detailOrder.notes && (
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">Notes</p>
                    <p className="italic text-muted-foreground">{detailOrder.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
