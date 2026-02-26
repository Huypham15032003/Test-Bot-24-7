import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { DocumentCard, DocumentCardSkeleton } from "@/components/document-card";
import { BadgeDisplay, BadgeGrid } from "@/components/badge-display";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Award, Upload, Download, BookOpen, Star, CheckCircle, Trophy, Heart } from "lucide-react";
import type { Document, UserProfile, Badge as BadgeType, UserBadge, Follow } from "@shared/schema";
import { useEffect } from "react";

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = "/api/login";
    }
  }, [isAuthenticated, authLoading]);

  const { data: profile } = useQuery<UserProfile>({
    queryKey: ["/api/profile"],
    enabled: isAuthenticated,
  });

  const { data: myDocs, isLoading: docsLoading } = useQuery<Document[]>({
    queryKey: ["/api/profile", "documents"],
    enabled: isAuthenticated,
  });

  const { data: myDownloads, isLoading: downloadsLoading } = useQuery<Document[]>({
    queryKey: ["/api/profile", "downloads"],
    enabled: isAuthenticated,
  });

  const { data: myBadges } = useQuery<(UserBadge & { badge: BadgeType })[]>({
    queryKey: ["/api/badges", "my"],
    enabled: isAuthenticated,
  });

  const { data: allBadges } = useQuery<BadgeType[]>({
    queryKey: ["/api/badges"],
    enabled: isAuthenticated,
  });

  const { data: myFollows } = useQuery<Follow[]>({
    queryKey: ["/api/follows"],
    enabled: isAuthenticated,
  });

  if (authLoading) {
    return <Layout><div className="p-8 text-center text-muted-foreground">Dang tai...</div></Layout>;
  }

  function getTitle(points: number): string {
    if (points >= 500) return "Huyen thoai";
    if (points >= 200) return "Nguoi dan duong";
    if (points >= 100) return "Chuyen gia";
    if (points >= 50) return "Thanh vien tich cuc";
    if (points >= 10) return "Nguoi chia se";
    return "Thanh vien moi";
  }

  const earnedBadgeIds = new Set((myBadges || []).map(b => b.badgeId));

  return (
    <Layout>
      <div className="mx-auto max-w-3xl px-4 py-6">
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user?.profileImageUrl || undefined} />
                <AvatarFallback className="text-lg">
                  {(user?.firstName?.[0] || user?.email?.[0] || "U").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold" data-testid="text-profile-name">
                    {user?.firstName
                      ? `${user.firstName} ${user.lastName || ""}`
                      : user?.email?.split("@")[0] || "Nguoi dung"}
                  </h1>
                  {profile?.verified && (
                    <CheckCircle className="h-5 w-5 text-primary" data-testid="icon-verified" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {profile?.faculty && (
                    <Badge variant="secondary">{profile.faculty}</Badge>
                  )}
                  {profile?.role && (
                    <Badge variant="outline" className="capitalize">{profile.role}</Badge>
                  )}
                  <Badge variant="default" className="text-xs">
                    <Trophy className="h-3 w-3 mr-1" />
                    {getTitle(profile?.points || 0)}
                  </Badge>
                </div>
                {myBadges && myBadges.length > 0 && (
                  <div className="mt-3">
                    <BadgeDisplay badges={myBadges} size="sm" />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{profile?.points || 0}</div>
                <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <Award className="h-3 w-3" />
                  Diem
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{myDocs?.length || 0}</div>
                <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <Upload className="h-3 w-3" />
                  Da upload
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{myDownloads?.length || 0}</div>
                <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <Download className="h-3 w-3" />
                  Da tai
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="uploads">
          <TabsList className="w-full">
            <TabsTrigger value="uploads" className="flex-1" data-testid="tab-uploads">
              <Upload className="h-3.5 w-3.5 mr-1.5" />
              Tai lieu
            </TabsTrigger>
            <TabsTrigger value="downloads" className="flex-1" data-testid="tab-downloads">
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Da tai
            </TabsTrigger>
            <TabsTrigger value="badges" className="flex-1" data-testid="tab-badges">
              <Star className="h-3.5 w-3.5 mr-1.5" />
              Danh hieu
            </TabsTrigger>
            <TabsTrigger value="follows" className="flex-1" data-testid="tab-follows">
              <Heart className="h-3.5 w-3.5 mr-1.5" />
              Theo doi
            </TabsTrigger>
          </TabsList>

          <TabsContent value="uploads" className="mt-4 space-y-3">
            {docsLoading ? (
              Array.from({ length: 3 }).map((_, i) => <DocumentCardSkeleton key={i} />)
            ) : myDocs && myDocs.length > 0 ? (
              myDocs.map((doc) => (
                <div key={doc.id} className="relative">
                  <DocumentCard document={doc} />
                  <div className="absolute top-3 right-3">
                    <Badge
                      variant={doc.status === "approved" ? "default" : doc.status === "rejected" ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {doc.status === "approved" ? "Da duyet" : doc.status === "rejected" ? "Tu choi" : "Cho duyet"}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Ban chua upload tai lieu nao</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="downloads" className="mt-4 space-y-3">
            {downloadsLoading ? (
              Array.from({ length: 3 }).map((_, i) => <DocumentCardSkeleton key={i} />)
            ) : myDownloads && myDownloads.length > 0 ? (
              myDownloads.map((doc) => (
                <DocumentCard key={doc.id} document={doc} />
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <Download className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Ban chua tai tai lieu nao</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="badges" className="mt-4">
            {allBadges && allBadges.length > 0 ? (
              <BadgeGrid allBadges={allBadges} earnedBadgeIds={earnedBadgeIds} />
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <Star className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Chua co danh hieu nao</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="follows" className="mt-4">
            {myFollows && myFollows.length > 0 ? (
              <div className="space-y-2">
                {myFollows.map((follow) => (
                  <Card key={follow.id}>
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs capitalize">{follow.targetType}</Badge>
                        <span className="text-sm font-medium">{follow.targetValue}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <Heart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Ban chua theo doi khoa hay mon hoc nao</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
