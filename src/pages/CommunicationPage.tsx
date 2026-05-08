import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

export default function CommunicationPage() {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const { data: stats } = useQuery({
    queryKey: ["communication-stats"],
    queryFn: async () => {
      const r = await api.get("/communications/stats");
      return r.data as { totalUsers: number; registeredDevices: number };
    },
  });

  const canSend = useMemo(() => title.trim().length > 0 && body.trim().length > 0, [title, body]);

  const sendMutation = useMutation({
    mutationFn: async () => {
      const r = await api.post("/communications/broadcast", { title: title.trim(), body: body.trim() });
      return r.data as { targetedUsers: number; deliveredUsers: number };
    },
    onSuccess: (d) => {
      toast({
        title: "Notification broadcast sent",
        description: `Targeted ${d.targetedUsers} users, delivered to ${d.deliveredUsers}.`,
      });
      setTitle("");
      setBody("");
    },
    onError: (e: any) => {
      toast({
        title: "Broadcast failed",
        description: e?.response?.data?.message || e?.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Communication</h1>
        <p className="text-muted-foreground">Send in-app push notifications to your users.</p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Audience</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-secondary/50 p-4">
            <p className="text-muted-foreground">Total users</p>
            <p className="text-xl font-semibold">{stats?.totalUsers ?? "-"}</p>
          </div>
          <div className="rounded-lg bg-secondary/50 p-4">
            <p className="text-muted-foreground">Users with registered devices</p>
            <p className="text-xl font-semibold">{stats?.registeredDevices ?? "-"}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Broadcast Message</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              placeholder="e.g. Happy New Year from Sophix!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea
              placeholder="Write your message to all app users..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
            />
          </div>
          <Button disabled={!canSend || sendMutation.isPending} onClick={() => sendMutation.mutate()}>
            {sendMutation.isPending ? "Sending..." : "Send Notification"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

