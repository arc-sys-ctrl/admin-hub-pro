import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatCard } from "@/components/StatCard";
import { Truck, MapPin, Clock, Star, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface DeliveryAgent {
  id: string;
  name: string;
  phone: string;
  status: "available" | "on_delivery" | "offline";
  completedToday: number;
  rating: number;
  currentOrder?: string;
  location?: string;
}

const agents: DeliveryAgent[] = [
  { id: "1", name: "James Kamau", phone: "+254 712 345 678", status: "on_delivery", completedToday: 8, rating: 4.8, currentOrder: "ORD-003", location: "Ngong Road" },
  { id: "2", name: "Peter Otieno", phone: "+254 723 456 789", status: "available", completedToday: 12, rating: 4.9 },
  { id: "3", name: "Samuel Maina", phone: "+254 734 567 890", status: "on_delivery", completedToday: 6, rating: 4.5, currentOrder: "ORD-008", location: "Mombasa Road" },
  { id: "4", name: "John Mutua", phone: "+254 745 678 901", status: "offline", completedToday: 0, rating: 4.3 },
  { id: "5", name: "Moses Kiprop", phone: "+254 756 789 012", status: "available", completedToday: 10, rating: 4.7 },
];

const statusStyles: Record<string, string> = {
  available: "bg-success/10 text-success border-0",
  on_delivery: "bg-primary/10 text-primary border-0",
  offline: "bg-muted text-muted-foreground border-0",
};

const activeDeliveries = [
  { orderId: "ORD-003", customer: "Carol Njeri", destination: "Karen", agent: "James Kamau", eta: "15 min", progress: 75 },
  { orderId: "ORD-008", customer: "Hannah Wambui", destination: "South B", agent: "Samuel Maina", eta: "32 min", progress: 40 },
  { orderId: "ORD-010", customer: "Lucy Adhiambo", destination: "Lavington", agent: "Moses Kiprop", eta: "8 min", progress: 90 },
];

export default function DeliveryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Delivery Management</h1>
        <p className="text-muted-foreground">Track agents and live deliveries</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Agents" value="3" icon={Truck} iconColor="bg-success/10 text-success" />
        <StatCard title="Active Deliveries" value="3" icon={MapPin} iconColor="bg-primary/10 text-primary" />
        <StatCard title="Avg. Delivery Time" value="28 min" icon={Clock} iconColor="bg-warning/10 text-warning" />
        <StatCard title="Today's Deliveries" value="36" change="+5 vs yesterday" changeType="positive" icon={CheckCircle} iconColor="bg-success/10 text-success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map placeholder */}
        <Card className="border-0 shadow-sm lg:row-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" /> Live Map
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] bg-secondary rounded-xl flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-30" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }} />
              <div className="text-center z-10">
                <MapPin className="h-12 w-12 text-primary mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground">Real-time map will be integrated here</p>
                <p className="text-xs text-muted-foreground mt-1">Connect with Google Maps or Mapbox for live tracking</p>
              </div>
              {/* Simulated delivery dots */}
              <div className="absolute top-[30%] left-[40%] h-4 w-4 bg-primary rounded-full animate-pulse shadow-lg" />
              <div className="absolute top-[60%] left-[65%] h-4 w-4 bg-success rounded-full animate-pulse shadow-lg" />
              <div className="absolute top-[45%] left-[25%] h-4 w-4 bg-warning rounded-full animate-pulse shadow-lg" />
            </div>
          </CardContent>
        </Card>

        {/* Active deliveries */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Active Deliveries</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeDeliveries.map((d) => (
              <div key={d.orderId} className="p-4 rounded-xl bg-secondary/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm text-foreground">{d.customer}</p>
                    <p className="text-xs text-muted-foreground">{d.orderId} → {d.destination}</p>
                  </div>
                  <Badge className="bg-primary/10 text-primary border-0">
                    <Clock className="h-3 w-3 mr-1" /> {d.eta}
                  </Badge>
                </div>
                <Progress value={d.progress} className="h-2" />
                <p className="text-xs text-muted-foreground">Agent: {d.agent}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Agents list */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Delivery Agents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {agents.map((agent) => (
              <div key={agent.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                      {agent.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-foreground">{agent.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Star className="h-3 w-3 text-warning fill-warning" /> {agent.rating}
                      <span>•</span>
                      <span>{agent.completedToday} today</span>
                    </div>
                  </div>
                </div>
                <Badge className={statusStyles[agent.status]}>
                  {agent.status.replace("_", " ")}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
