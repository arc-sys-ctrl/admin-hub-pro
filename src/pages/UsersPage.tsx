import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, UserCheck, UserX, ShoppingBag, Loader2 } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Users, UserPlus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

interface User {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: string;
  created_at: string;
  total_orders?: number;
  total_spent?: number;
}

export default function UsersPage() {
  const [search, setSearch] = useState("");

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await api.get("/users");
      return res.data;
    },
  });

  const filtered = users.filter(
    (u) =>
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const thisMonth = users.filter((u) => {
    const joined = new Date(u.created_at);
    const now = new Date();
    return joined.getMonth() === now.getMonth() && joined.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Users</h1>
        <p className="text-muted-foreground">Manage registered customers</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Users"
          value={users.length.toLocaleString()}
          change={`+${thisMonth} this month`}
          changeType="positive"
          icon={Users}
        />
        <StatCard
          title="New This Month"
          value={String(thisMonth)}
          change="Live from database"
          changeType="positive"
          icon={UserPlus}
          iconColor="bg-success/10 text-success"
        />
        <StatCard
          title="Avg. Orders/User"
          value="—"
          change="Coming soon"
          changeType="neutral"
          icon={ShoppingBag}
          iconColor="bg-warning/10 text-warning"
        />
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">User</th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Joined</th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone</th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</th>
                  <th className="text-right p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground text-sm">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((user) => (
                    <tr key={user.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                              {user.full_name?.split(" ").map((n) => n[0]).join("").slice(0, 2) || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-foreground">{user.full_name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString("en-KE", { month: "short", year: "numeric" })}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{user.phone || "—"}</td>
                      <td className="p-4">
                        <Badge className={user.role === "customer" ? "bg-success/10 text-success border-0" : "bg-primary/10 text-primary border-0"}>
                          {user.role === "customer" ? <UserCheck className="h-3 w-3 mr-1" /> : <UserX className="h-3 w-3 mr-1" />}
                          {user.role}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <Button variant="ghost" size="sm" className="h-8 text-xs">
                          View Orders
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
