import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { DocumentCard, DocumentCardSkeleton } from "@/components/document-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, Upload, TrendingUp, Clock, BookOpen, Star, MessageSquare, Eye, MessageCircle } from "lucide-react";
import type { Document, ForumThread } from "@shared/schema";
import { FACULTIES, CATEGORIES } from "@shared/schema";

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
  const months = Math.floor(days / 30);
  return `${months} thang truoc`;
}

export default function HomePage() {
  const { user } = useAuth();

  const { data: recentDocs, isLoading: recentLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents", "recent"],
  });

  const { data: popularDocs, isLoading: popularLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents", "popular"],
  });

  const { data: stats } = useQuery<{
    totalDocuments: number;
    totalDownloads: number;
    totalUsers: number;
  }>({
    queryKey: ["/api/stats"],
  });

  const { data: forumThreads } = useQuery<ForumThread[]>({
    queryKey: ["/api/forum", "threads"],
  });

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-welcome">
              Xin chao, {user?.firstName || user?.email?.split("@")[0] || "ban"}!
            </h1>
            <p className="text-muted-foreground mt-1">Kham pha tai lieu moi nhat tu cong dong HUMG</p>
          </div>
          <Link href="/upload">
            <Button data-testid="button-upload-cta">
              <Upload className="h-4 w-4 mr-1.5" />
              Upload tai lieu
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          {[
            { label: "Tai lieu", value: stats?.totalDocuments || 0, icon: BookOpen, color: "text-primary" },
            { label: "Luot tai", value: stats?.totalDownloads || 0, icon: TrendingUp, color: "text-chart-2" },
            { label: "Thanh vien", value: stats?.totalUsers || 0, icon: Star, color: "text-chart-3" },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Tai lieu moi nhat
                </h2>
                <Link href="/browse">
                  <Button variant="ghost" size="sm">
                    Xem tat ca <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
              <div className="space-y-3">
                {recentLoading ? (
                  Array.from({ length: 4 }).map((_, i) => <DocumentCardSkeleton key={i} />)
                ) : recentDocs && recentDocs.length > 0 ? (
                  recentDocs.slice(0, 5).map((doc) => (
                    <DocumentCard key={doc.id} document={doc} />
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                      <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Chua co tai lieu nao. Hay la nguoi dau tien upload!</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Tai lieu pho bien
                </h2>
                <Link href="/browse?sort=popular">
                  <Button variant="ghost" size="sm">
                    Xem tat ca <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
              <div className="space-y-3">
                {popularLoading ? (
                  Array.from({ length: 3 }).map((_, i) => <DocumentCardSkeleton key={i} />)
                ) : popularDocs && popularDocs.length > 0 ? (
                  popularDocs.slice(0, 4).map((doc) => (
                    <DocumentCard key={doc.id} document={doc} />
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                      <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Chua co tai lieu pho bien</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Thao luan moi
                </h3>
                <Link href="/forum">
                  <Button variant="ghost" size="sm">
                    Xem tat ca <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
              <div className="space-y-2">
                {forumThreads && forumThreads.length > 0 ? (
                  forumThreads.slice(0, 5).map((thread) => (
                    <Link key={thread.id} href={`/forum/${thread.id}`}>
                      <Card className="cursor-pointer hover:bg-muted/50 transition-colors" data-testid={`card-thread-${thread.id}`}>
                        <CardContent className="p-3">
                          <p className="text-sm font-medium line-clamp-2">{thread.title}</p>
                          <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {thread.viewCount || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="h-3 w-3" />
                              {thread.replyCount || 0}
                            </span>
                            <span>{timeAgo(thread.createdAt)}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-4 text-center text-sm text-muted-foreground">
                      Chua co thao luan nao
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Khoa</h3>
              <div className="flex flex-wrap gap-1.5">
                {FACULTIES.map((faculty) => (
                  <Link key={faculty} href={`/browse?faculty=${encodeURIComponent(faculty)}`}>
                    <Badge variant="secondary" className="cursor-pointer text-xs">
                      {faculty}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Loai tai lieu</h3>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((cat) => (
                  <Link key={cat} href={`/browse?category=${encodeURIComponent(cat)}`}>
                    <Badge variant="outline" className="cursor-pointer text-xs">
                      {cat}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
