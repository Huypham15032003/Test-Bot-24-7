import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Plus,
  Pin,
  Eye,
  MessageSquare,
  Clock,
  Lock,
  ArrowLeft,
  Send,
  Award,
  MessageCircle,
} from "lucide-react";
import type { ForumThread, ForumReply, UserProfile } from "@shared/schema";
import { FACULTIES, COURSE_CODES } from "@shared/schema";

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

type ThreadWithAuthor = ForumThread & { author?: UserProfile | null };
type ReplyWithUser = ForumReply & { user?: UserProfile | null };

function ThreadListView() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [faculty, setFaculty] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [sort, setSort] = useState("recent");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newFaculty, setNewFaculty] = useState("");
  const [newCourseCode, setNewCourseCode] = useState("");

  const { data: threads, isLoading } = useQuery<ThreadWithAuthor[]>({
    queryKey: ["/api/forum", "threads", faculty, courseCode, sort],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (faculty) params.set("faculty", faculty);
      if (courseCode) params.set("courseCode", courseCode);
      if (sort) params.set("sort", sort);
      const res = await fetch(`/api/forum/threads?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/forum/threads", {
        title: newTitle,
        content: newContent,
        faculty: newFaculty || undefined,
        courseCode: newCourseCode || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum", "threads"] });
      setDialogOpen(false);
      setNewTitle("");
      setNewContent("");
      setNewFaculty("");
      setNewCourseCode("");
      toast({ title: "Tao bai thanh cong!" });
    },
    onError: () => {
      toast({ title: "Loi khi tao bai", variant: "destructive" });
    },
  });

  const sortedThreads = threads
    ? [...threads].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return 0;
      })
    : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold" data-testid="text-forum-title">
          Dien dan thao luan
        </h1>
        {isAuthenticated && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-thread">
                <Plus className="h-4 w-4 mr-1.5" />
                Tao bai moi
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tao bai thao luan moi</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="thread-title">Tieu de *</Label>
                  <Input
                    id="thread-title"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Nhap tieu de bai viet"
                    data-testid="input-thread-title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="thread-content">Noi dung *</Label>
                  <Textarea
                    id="thread-content"
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Nhap noi dung chi tiet"
                    rows={5}
                    data-testid="input-thread-content"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Khoa</Label>
                  <Select value={newFaculty} onValueChange={setNewFaculty}>
                    <SelectTrigger data-testid="select-thread-faculty">
                      <SelectValue placeholder="Chon khoa" />
                    </SelectTrigger>
                    <SelectContent>
                      {FACULTIES.map((f) => (
                        <SelectItem key={f} value={f}>{f}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="thread-coursecode">Ma mon hoc</Label>
                  <Input
                    id="thread-coursecode"
                    value={newCourseCode}
                    onChange={(e) => setNewCourseCode(e.target.value)}
                    placeholder="VD: CTT101"
                    data-testid="input-thread-coursecode"
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={() => createMutation.mutate()}
                  disabled={!newTitle.trim() || !newContent.trim() || createMutation.isPending}
                  data-testid="button-submit-thread"
                >
                  {createMutation.isPending ? "Dang tao..." : "Tao bai"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Select value={faculty} onValueChange={setFaculty}>
          <SelectTrigger className="w-[200px]" data-testid="select-filter-faculty">
            <SelectValue placeholder="Tat ca khoa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tat ca</SelectItem>
            {FACULTIES.map((f) => (
              <SelectItem key={f} value={f}>{f}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={courseCode} onValueChange={setCourseCode}>
          <SelectTrigger className="w-[160px]" data-testid="select-filter-coursecode">
            <SelectValue placeholder="Ma mon hoc" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tat ca</SelectItem>
            {COURSE_CODES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-1">
          {[
            { value: "recent", label: "Moi nhat" },
            { value: "popular", label: "Xem nhieu" },
            { value: "unanswered", label: "Chua tra loi" },
          ].map((option) => (
            <Button
              key={option.value}
              variant={sort === option.value ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setSort(option.value)}
              data-testid={`button-sort-${option.value}`}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : sortedThreads.length > 0 ? (
          sortedThreads.map((thread) => (
            <Link key={thread.id} href={`/forum/${thread.id}`}>
              <Card
                className="group cursor-pointer transition-all duration-200 hover-elevate"
                data-testid={`card-thread-${thread.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <MessageCircle className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {thread.isPinned && (
                          <Badge variant="secondary" className="text-xs">
                            <Pin className="h-3 w-3 mr-1" />
                            Ghim
                          </Badge>
                        )}
                        {thread.isLocked && (
                          <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                        <h3
                          className="font-medium leading-snug line-clamp-2 text-sm"
                          data-testid={`text-thread-title-${thread.id}`}
                        >
                          {thread.title}
                        </h3>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {thread.faculty && (
                          <Badge variant="secondary" className="text-xs">
                            {thread.faculty}
                          </Badge>
                        )}
                        {thread.courseCode && (
                          <Badge variant="outline" className="text-xs">
                            {thread.courseCode}
                          </Badge>
                        )}
                      </div>
                      <div className="mt-2.5 flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {thread.viewCount || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {thread.replyCount || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {timeAgo(thread.createdAt)}
                        </span>
                        {thread.author?.displayName && (
                          <span data-testid={`text-thread-author-${thread.id}`}>
                            {thread.author.displayName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Chua co bai thao luan nao. Hay la nguoi dau tien tao bai!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function ThreadDetailView({ id }: { id: string }) {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [replyContent, setReplyContent] = useState("");

  const { data: thread, isLoading: threadLoading } = useQuery<ThreadWithAuthor>({
    queryKey: ["/api/forum/threads", id],
  });

  const { data: replies, isLoading: repliesLoading } = useQuery<ReplyWithUser[]>({
    queryKey: ["/api/forum/threads", id, "replies"],
  });

  const replyMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/forum/threads/${id}/replies`, {
        content: replyContent,
        threadId: id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/threads", id, "replies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/forum/threads", id] });
      setReplyContent("");
      toast({ title: "Tra loi thanh cong!" });
    },
    onError: () => {
      toast({ title: "Loi khi gui tra loi", variant: "destructive" });
    },
  });

  if (threadLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <p>Khong tim thay bai viet</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Link href="/forum">
        <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back-forum">
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Quay lai dien dan
        </Button>
      </Link>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarFallback className="text-sm">
                {(thread.author?.displayName?.[0] || "U").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                {thread.isPinned && (
                  <Badge variant="secondary" className="text-xs">
                    <Pin className="h-3 w-3 mr-1" />
                    Ghim
                  </Badge>
                )}
                {thread.isLocked && (
                  <Badge variant="destructive" className="text-xs">
                    <Lock className="h-3 w-3 mr-1" />
                    Da khoa
                  </Badge>
                )}
              </div>
              <h1 className="text-xl font-bold mt-1" data-testid="text-thread-detail-title">
                {thread.title}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {thread.faculty && (
                  <Badge variant="secondary" className="text-xs">{thread.faculty}</Badge>
                )}
                {thread.courseCode && (
                  <Badge variant="outline" className="text-xs">{thread.courseCode}</Badge>
                )}
              </div>
              <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                <span data-testid="text-thread-detail-author">
                  {thread.author?.displayName || "Nguoi dung"}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {timeAgo(thread.createdAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {thread.viewCount || 0} luot xem
                </span>
              </div>
              <div className="mt-4 text-sm whitespace-pre-wrap" data-testid="text-thread-detail-content">
                {thread.content}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mb-4">
        <h2 className="font-semibold flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          Cau tra loi ({replies?.length || 0})
        </h2>
      </div>

      <div className="space-y-3 mb-6">
        {repliesLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : replies && replies.length > 0 ? (
          replies.map((reply) => (
            <Card key={reply.id} data-testid={`card-reply-${reply.id}`}>
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="text-xs">
                      {(reply.user?.displayName?.[0] || "U").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium" data-testid={`text-reply-author-${reply.id}`}>
                        {reply.user?.displayName || "Nguoi dung"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {timeAgo(reply.createdAt)}
                      </span>
                      {reply.isBestAnswer && (
                        <Badge variant="default" className="text-xs">
                          <Award className="h-3 w-3 mr-1" />
                          Cau tra loi tot nhat
                        </Badge>
                      )}
                    </div>
                    <div className="mt-2 text-sm whitespace-pre-wrap" data-testid={`text-reply-content-${reply.id}`}>
                      {reply.content}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <MessageSquare className="h-6 w-6 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Chua co cau tra loi nao</p>
            </CardContent>
          </Card>
        )}
      </div>

      {thread.isLocked ? (
        <Card>
          <CardContent className="p-4 text-center text-muted-foreground">
            <Lock className="h-5 w-5 mx-auto mb-1 opacity-50" />
            <p className="text-sm">Bai viet da bi khoa, khong the tra loi</p>
          </CardContent>
        </Card>
      ) : isAuthenticated ? (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Nhap cau tra loi cua ban..."
                rows={3}
                data-testid="input-reply-content"
              />
              <div className="flex justify-end">
                <Button
                  onClick={() => replyMutation.mutate()}
                  disabled={!replyContent.trim() || replyMutation.isPending}
                  data-testid="button-submit-reply"
                >
                  <Send className="h-4 w-4 mr-1.5" />
                  {replyMutation.isPending ? "Dang gui..." : "Gui tra loi"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4 text-center text-muted-foreground">
            <p className="text-sm">
              <a href="/api/login" className="text-primary underline" data-testid="link-login-to-reply">
                Dang nhap
              </a>{" "}
              de tra loi bai viet
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function ForumPage() {
  const params = useParams<{ id: string }>();

  return (
    <Layout>
      {params.id ? (
        <ThreadDetailView id={params.id} />
      ) : (
        <ThreadListView />
      )}
    </Layout>
  );
}
