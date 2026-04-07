import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, MoreHorizontal, UserCheck, UserX } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Users, UserPlus, ShoppingBag } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  joined: string;
  orders: number;
  spent: string;
  status: "active" | "inactive";
}

const mockUsers: User[] = [
  { id: "1", name: "Alice Mwangi", email: "alice@email.com", joined: "Jan 2026", orders: 12, spent: "KSh 54,000", status: "active" },
  { id: "2", name: "Brian Ochieng", email: "brian@email.com", joined: "Feb 2026", orders: 8, spent: "KSh 23,400", status: "active" },
  { id: "3", name: "Carol Njeri", email: "carol@email.com", joined: "Mar 2026", orders: 15, spent: "KSh 89,000", status: "active" },
  { id: "4", name: "David Kimani", email: "david@email.com", joined: "Mar 2026", orders: 3, spent: "KSh 7,200", status: "inactive" },
  { id: "5", name: "Eva Akinyi", email: "eva@email.com", joined: "Apr 2026", orders: 6, spent: "KSh 34,500", status: "active" },
  { id: "6", name: "Frank Wafula", email: "frank@email.com", joined: "Apr 2026", orders: 1, spent: "KSh 3,400", status: "active" },
];

export default function UsersPage() {
  const [search, setSearch] = useState("");

  const filtered = mockUsers.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Users</h1>
        <p className="text-muted-foreground">Manage registered customers</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Users" value="1,234" change="+48 this month" changeType="positive" icon={Users} />
        <StatCard title="New This Month" value="48" change="+12% vs last month" changeType="positive" icon={UserPlus} iconColor="bg-success/10 text-success" />
        <StatCard title="Avg. Orders/User" value="4.2" change="Steady" changeType="neutral" icon={ShoppingBag} iconColor="bg-warning/10 text-warning" />
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">User</th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Joined</th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Orders</th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Spent</th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-right p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                            {user.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-foreground">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{user.joined}</td>
                    <td className="p-4 text-sm text-foreground">{user.orders}</td>
                    <td className="p-4 text-sm font-semibold text-foreground">{user.spent}</td>
                    <td className="p-4">
                      <Badge className={user.status === "active" ? "bg-success/10 text-success border-0" : "bg-muted text-muted-foreground border-0"}>
                        {user.status === "active" ? <UserCheck className="h-3 w-3 mr-1" /> : <UserX className="h-3 w-3 mr-1" />}
                        {user.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
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
