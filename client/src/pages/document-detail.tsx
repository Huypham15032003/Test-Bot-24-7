import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Download, Star, Clock, FileText, User, MessageSquare,
  Flag, Share2, Loader2, ArrowLeft,
} from "lucide-react";
import { Link } from "wouter";
import type { Document, Comment, UserProfile } from "@shared/schema";
import { useState } from "react";

function StarRating({ rating, onRate, interactive = false }: { rating: number; onRate?: (r: number) => void; interactive?: boolean }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          className={`${interactive ? "cursor-pointer" : "cursor-default"}`}
          onClick={() => onRate?.(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          data-testid={`button-star-${star}`}
        >
          <Star
            className={`h-5 w-5 ${
              (hover || rating) >= star
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground/30"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function timeAgo(date: Date | string | null) {
  if (!date) return "";
  const now = new Date();
  const d = new Date(date);
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes} phut truoc`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} gio truoc`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ngay truoc`;
  return `${Math.floor(days / 30)} thang truoc`;
}

export default function DocumentDetailPage() {
  const params = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [comment, setComment] = useState("");
  const [myRating, setMyRating] = useState(0);

  const { data: doc, isLoading } = useQuery<Document & { uploaderProfile?: UserProfile }>({
    queryKey: ["/api/documents", params.id],
  });

  const { data: comments } = useQuery<(Comment & { userProfile?: UserProfile })[]>({
    queryKey: ["/api/documents", params.id, "comments"],
  });

  const { data: existingRating } = useQuery<{ score: number } | null>({
    queryKey: ["/api/documents", params.id, "my-rating"],
    enabled: isAuthenticated,
  });

  const downloadMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/documents/${params.id}/download`);
      return res.json();
    },
    onSuccess: (data) => {
      if (data.fileUrl) {
        window.open(data.fileUrl, "_blank");
      }
      queryClient.invalidateQueries({ queryKey: ["/api/documents", params.id] });
      toast({ title: "Tai thanh cong" });
    },
    onError: (error: Error) => {
      if (error.message.includes("401")) {
        window.location.href = "/api/login";
        return;
      }
      toast({ title: "Loi", description: error.message, variant: "destructive" });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/documents/${params.id}/comments`, { content: comment });
    },
    onSuccess: () => {
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["/api/documents", params.id, "comments"] });
      toast({ title: "Da gui binh luan" });
    },
    onError: (error: Error) => {
      toast({ title: "Loi", description: error.message, variant: "destructive" });
    },
  });

  const rateMutation = useMutation({
    mutationFn: async (score: number) => {
      await apiRequest("POST", `/api/documents/${params.id}/rate`, { score });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents", params.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents", params.id, "my-rating"] });
      toast({ title: "Da danh gia" });
    },
  });

  const handleRate = (score: number) => {
    if (!isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }
    setMyRating(score);
    rateMutation.mutate(score);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="mx-auto max-w-3xl px-4 py-6">
          <div className="space-y-4">
            <div className="h-8 w-3/4 rounded bg-muted animate-pulse" />
            <div className="h-4 w-1/2 rounded bg-muted animate-pulse" />
            <div className="h-32 rounded bg-muted animate-pulse" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!doc) {
    return (
      <Layout>
        <div className="mx-auto max-w-3xl px-4 py-12 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-40" />
          <h2 className="text-xl font-semibold mb-2">Khong tim thay tai lieu</h2>
          <Link href="/browse">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Quay lai
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-3xl px-4 py-6">
        <Link href="/browse">
          <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back">
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            Quay lai
          </Button>
        </Link>

        <div className="space-y-6">
          <div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              <Badge variant="secondary">{doc.faculty}</Badge>
              <Badge variant="outline">{doc.category}</Badge>
              {doc.subject && <Badge variant="outline">{doc.subject}</Badge>}
              {doc.year && <Badge variant="outline">{doc.year}</Badge>}
            </div>
            <h1 className="text-2xl font-bold" data-testid="text-doc-detail-title">{doc.title}</h1>
            {doc.description && (
              <p className="mt-2 text-muted-foreground leading-relaxed">{doc.description}</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Download className="h-4 w-4" />
              {doc.downloadCount || 0} luot tai
            </span>
            <span className="flex items-center gap-1.5">
              <Star className="h-4 w-4" />
              {doc.averageRating ? (doc.averageRating / 10).toFixed(1) : "0.0"} ({doc.ratingCount || 0} danh gia)
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {timeAgo(doc.createdAt)}
            </span>
          </div>

          {doc.tags && doc.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {doc.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">#{tag}</Badge>
              ))}
            </div>
          )}

          <Card>
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{doc.fileName || "Tai lieu"}</p>
                    {doc.fileSize && (
                      <p className="text-xs text-muted-foreground">
                        {(doc.fileSize / 1048576).toFixed(1)} MB
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  onClick={() => downloadMutation.mutate()}
                  disabled={downloadMutation.isPending}
                  data-testid="button-download"
                >
                  {downloadMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-1.5" />
                  )}
                  Tai xuong
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold mb-3">Danh gia tai lieu</h3>
              <StarRating
                rating={myRating || existingRating?.score || 0}
                onRate={handleRate}
                interactive={isAuthenticated}
              />
              {!isAuthenticated && (
                <p className="text-xs text-muted-foreground mt-2">Dang nhap de danh gia</p>
              )}
            </CardContent>
          </Card>

          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              Binh luan ({comments?.length || 0})
            </h3>

            {isAuthenticated && (
              <div className="mb-4 space-y-2">
                <Textarea
                  placeholder="Viet binh luan..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={2}
                  data-testid="input-comment"
                />
                <Button
                  size="sm"
                  onClick={() => commentMutation.mutate()}
                  disabled={!comment.trim() || commentMutation.isPending}
                  data-testid="button-submit-comment"
                >
                  {commentMutation.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                  ) : null}
                  Gui
                </Button>
              </div>
            )}

            <div className="space-y-3">
              {comments && comments.length > 0 ? (
                comments.map((c) => (
                  <Card key={c.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-xs">
                            {(c.userProfile?.displayName?.[0] || "U").toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">
                              {c.userProfile?.displayName || "Nguoi dung"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {timeAgo(c.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{c.content}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Chua co binh luan nao
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
