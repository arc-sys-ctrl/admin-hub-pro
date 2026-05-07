import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function SettingsPage() {
  const { toast } = useToast();
  const [form, setForm] = useState<any>(null);
  const { isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const r = await api.get("/settings/admin");
      setForm(r.data);
      return r.data;
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      await api.put("/settings/admin", form);
    },
    onSuccess: () => toast({ title: "Settings saved" }),
    onError: (e: any) => toast({ title: "Save failed", description: e?.message, variant: "destructive" }),
  });

  if (isLoading || !form) {
    return <div className="text-sm text-muted-foreground">Loading settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your admin preferences</p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Store Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Store Name</Label>
            <Input value={form.storeName || ""} onChange={(e) => setForm({ ...form, storeName: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Contact Email</Label>
            <Input value={form.contactEmail || ""} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>Save Changes</Button>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">New order alerts</p>
              <p className="text-xs text-muted-foreground">Get notified when a new order is placed</p>
            </div>
            <Switch checked={!!form.notifications?.newOrders} onCheckedChange={(v) => setForm({ ...form, notifications: { ...form.notifications, newOrders: v } })} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Low stock alerts</p>
              <p className="text-xs text-muted-foreground">Notify when product stock is below 5</p>
            </div>
            <Switch checked={!!form.notifications?.lowStock} onCheckedChange={(v) => setForm({ ...form, notifications: { ...form.notifications, lowStock: v } })} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">New review alerts</p>
              <p className="text-xs text-muted-foreground">Get notified for new customer reviews</p>
            </div>
            <Switch checked={!!form.notifications?.newReviews} onCheckedChange={(v) => setForm({ ...form, notifications: { ...form.notifications, newReviews: v } })} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Home Hero (App)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Show hero card</Label>
            <Switch checked={!!form.hero?.enabled} onCheckedChange={(v) => setForm({ ...form, hero: { ...form.hero, enabled: v } })} />
          </div>
          <div className="space-y-2">
            <Label>Badge</Label>
            <Input value={form.hero?.badge || ""} onChange={(e) => setForm({ ...form, hero: { ...form.hero, badge: e.target.value } })} />
          </div>
          <div className="space-y-2">
            <Label>Title</Label>
            <Textarea value={form.hero?.title || ""} onChange={(e) => setForm({ ...form, hero: { ...form.hero, title: e.target.value } })} />
          </div>
          <div className="space-y-2">
            <Label>CTA Text</Label>
            <Input value={form.hero?.ctaText || ""} onChange={(e) => setForm({ ...form, hero: { ...form.hero, ctaText: e.target.value } })} />
          </div>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>Save Hero Content</Button>
        </CardContent>
      </Card>
    </div>
  );
}
