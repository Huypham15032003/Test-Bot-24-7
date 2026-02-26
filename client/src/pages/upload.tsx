import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload as UploadIcon, X, FileText, Loader2 } from "lucide-react";
import { FACULTIES, CATEGORIES, POPULAR_TAGS } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { useEffect } from "react";

export default function UploadPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [faculty, setFaculty] = useState("");
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [year, setYear] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({ title: "Chua dang nhap", description: "Ban can dang nhap de upload tai lieu", variant: "destructive" });
      setTimeout(() => { window.location.href = "/api/login"; }, 500);
    }
  }, [isAuthenticated, authLoading]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const uploadMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("faculty", faculty);
      formData.append("subject", subject);
      formData.append("category", category);
      formData.append("year", year);
      formData.append("tags", JSON.stringify(selectedTags));
      if (file) formData.append("file", file);

      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Upload that bai");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Thanh cong!", description: "Tai lieu da duoc gui va dang cho duyet." });
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      navigate("/");
    },
    onError: (error: Error) => {
      toast({ title: "Loi", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !faculty || !category) {
      toast({ title: "Thieu thong tin", description: "Vui long dien day du cac truong bat buoc", variant: "destructive" });
      return;
    }
    uploadMutation.mutate();
  };

  if (authLoading) return <Layout><div className="p-8 text-center text-muted-foreground">Dang tai...</div></Layout>;

  return (
    <Layout>
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold" data-testid="text-upload-title">Upload tai lieu</h1>
          <p className="text-muted-foreground mt-1">Chia se tai lieu voi cong dong HUMG</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title">Tieu de *</Label>
                <Input
                  id="title"
                  placeholder="VD: Slide bai giang Dia chat dai cuong - Chuong 3"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  data-testid="input-title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mo ta</Label>
                <Textarea
                  id="description"
                  placeholder="Mo ta ngan ve tai lieu..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  data-testid="input-description"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Khoa *</Label>
                  <Select value={faculty} onValueChange={setFaculty}>
                    <SelectTrigger data-testid="select-upload-faculty">
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
                  <Label>Loai tai lieu *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger data-testid="select-upload-category">
                      <SelectValue placeholder="Chon loai" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="subject">Mon hoc</Label>
                  <Input
                    id="subject"
                    placeholder="VD: Dia chat dai cuong"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    data-testid="input-subject"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Nam hoc</Label>
                  <Input
                    id="year"
                    placeholder="VD: 2024-2025"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    data-testid="input-year"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_TAGS.map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer text-xs"
                      onClick={() => toggleTag(tag)}
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>File tai lieu</Label>
                {file ? (
                  <div className="flex items-center gap-2 rounded-md border p-3">
                    <FileText className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-sm truncate flex-1">{file.name}</span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {(file.size / 1048576).toFixed(1)} MB
                    </span>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => setFile(null)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center gap-2 rounded-md border border-dashed p-8 text-center transition-colors hover:border-primary/50 hover:bg-primary/5" data-testid="input-file-dropzone">
                    <UploadIcon className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Nhan de chon file hoac keo tha vao day
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PDF, Word, PPT, ZIP, RAR, hinh anh (toi da 100MB)
                    </p>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.rar,.jpg,.jpeg,.png,.gif,.mp4"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      data-testid="input-file"
                    />
                  </label>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={uploadMutation.isPending || !title || !faculty || !category}
                data-testid="button-submit-upload"
              >
                {uploadMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                    Dang upload...
                  </>
                ) : (
                  <>
                    <UploadIcon className="h-4 w-4 mr-1.5" />
                    Upload tai lieu
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Tai lieu se duoc admin duyet truoc khi hien thi cong khai
              </p>
            </CardContent>
          </Card>
        </form>
      </div>
    </Layout>
  );
}
