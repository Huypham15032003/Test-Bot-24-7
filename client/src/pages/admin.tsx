import { useQuery, useMutation } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  CheckCircle, XCircle, Clock, FileText, Shield, Users, BookOpen, Loader2,
} from "lucide-react";
import type { Document } from "@shared/schema";
import { useState, useEffect } from "react";

function timeAgo(date: Date | string | null) {
  if (!date) return "";
  const now = new Date();
  const d = new Date(date);
  const diff = now.getTime() - d.getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return `${hours} gio truoc`;
  return `${Math.floor(hours / 24)} ngay truoc`;
}

function AdminDocCard({ doc, showActions }: { doc: Document; showActions: boolean }) {
  const { toast } = useToast();
  const [rejectionReason, setRejectionReason] = useState("");
  const [showReject, setShowReject] = useState(false);

  const approveMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/admin/documents/${doc.id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin"] });
      toast({ title: "Da duyet tai lieu" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () =>
      apiRequest("POST", `/api/admin/documents/${doc.id}/reject`, { reason: rejectionReason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin"] });
      setShowReject(false);
      toast({ title: "Da tu choi tai lieu" });
    },
  });

  return (
    <Card data-testid={`card-admin-doc-${doc.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-medium text-sm">{doc.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {doc.faculty} - {doc.category} - {timeAgo(doc.createdAt)}
                </p>
              </div>
              <Badge
                variant={
                  doc.status === "approved" ? "default" : doc.status === "rejected" ? "destructive" : "secondary"
                }
                className="shrink-0 text-xs"
              >
                {doc.status === "approved" ? "Da duyet" : doc.status === "rejected" ? "Tu choi" : "Cho duyet"}
              </Badge>
            </div>

            {doc.description && (
              <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{doc.description}</p>
            )}

            {showActions && doc.status === "pending" && (
              <div className="mt-3 space-y-2">
                {showReject ? (
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Ly do tu choi..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={2}
                      data-testid={`input-reject-reason-${doc.id}`}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => rejectMutation.mutate()}
                        disabled={rejectMutation.isPending}
                        data-testid={`button-confirm-reject-${doc.id}`}
                      >
                        {rejectMutation.isPending && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                        Xac nhan tu choi
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setShowReject(false)}>
                        Huy
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => approveMutation.mutate()}
                      disabled={approveMutation.isPending}
                      data-testid={`button-approve-${doc.id}`}
                    >
                      {approveMutation.isPending ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      )}
                      Duyet
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setShowReject(true)}
                      data-testid={`button-reject-${doc.id}`}
                    >
                      <XCircle className="h-3 w-3 mr-1" />
                      Tu choi
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({ title: "Chua dang nhap", variant: "destructive" });
      setTimeout(() => { window.location.href = "/api/login"; }, 500);
    }
  }, [isAuthenticated, authLoading]);

  const { data: pendingDocs, isLoading: pendingLoading } = useQuery<Document[]>({
    queryKey: ["/api/admin", "pending"],
    enabled: isAuthenticated,
  });

  const { data: allDocs, isLoading: allLoading } = useQuery<Document[]>({
    queryKey: ["/api/admin", "all"],
    enabled: isAuthenticated,
  });

  const { data: stats } = useQuery<{
    pending: number;
    approved: number;
    rejected: number;
    totalUsers: number;
  }>({
    queryKey: ["/api/admin", "stats"],
    enabled: isAuthenticated,
  });

  if (authLoading) {
    return <Layout><div className="p-8 text-center text-muted-foreground">Dang tai...</div></Layout>;
  }

  return (
    <Layout>
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-admin-title">
            <Shield className="h-6 w-6 text-primary" />
            Quan tri
          </h1>
          <p className="text-muted-foreground mt-1">Duyet va quan ly tai lieu</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-4 mb-6">
          {[
            { label: "Cho duyet", value: stats?.pending || 0, icon: Clock, variant: "text-yellow-500" },
            { label: "Da duyet", value: stats?.approved || 0, icon: CheckCircle, variant: "text-primary" },
            { label: "Tu choi", value: stats?.rejected || 0, icon: XCircle, variant: "text-destructive" },
            { label: "Thanh vien", value: stats?.totalUsers || 0, icon: Users, variant: "text-chart-2" },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <stat.icon className={`h-5 w-5 ${stat.variant}`} />
                <div>
                  <div className="text-xl font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending" data-testid="tab-admin-pending">
              <Clock className="h-3.5 w-3.5 mr-1.5" />
              Cho duyet ({stats?.pending || 0})
            </TabsTrigger>
            <TabsTrigger value="all" data-testid="tab-admin-all">
              <BookOpen className="h-3.5 w-3.5 mr-1.5" />
              Tat ca
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-4 space-y-3">
            {pendingLoading ? (
              <div className="text-center py-8 text-muted-foreground">Dang tai...</div>
            ) : pendingDocs && pendingDocs.length > 0 ? (
              pendingDocs.map((doc) => (
                <AdminDocCard key={doc.id} doc={doc} showActions />
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Khong co tai lieu nao can duyet</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="all" className="mt-4 space-y-3">
            {allLoading ? (
              <div className="text-center py-8 text-muted-foreground">Dang tai...</div>
            ) : allDocs && allDocs.length > 0 ? (
              allDocs.map((doc) => (
                <AdminDocCard key={doc.id} doc={doc} showActions={false} />
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Chua co tai lieu nao</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
