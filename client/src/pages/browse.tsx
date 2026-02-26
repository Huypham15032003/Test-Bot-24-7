import { useQuery } from "@tanstack/react-query";
import { useLocation, useSearch } from "wouter";
import { Layout } from "@/components/layout";
import { DocumentCard, DocumentCardSkeleton } from "@/components/document-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Filter, SortAsc } from "lucide-react";
import type { Document } from "@shared/schema";
import { FACULTIES, CATEGORIES } from "@shared/schema";
import { useState, useEffect } from "react";

export default function BrowsePage() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);

  const [faculty, setFaculty] = useState(params.get("faculty") || "all");
  const [category, setCategory] = useState(params.get("category") || "all");
  const [sort, setSort] = useState(params.get("sort") || "recent");

  const queryParams = new URLSearchParams();
  if (faculty !== "all") queryParams.set("faculty", faculty);
  if (category !== "all") queryParams.set("category", category);
  queryParams.set("sort", sort);

  const { data: documents, isLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents", `?${queryParams.toString()}`],
  });

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold" data-testid="text-browse-title">Tai lieu</h1>
          <p className="text-muted-foreground mt-1">Duyet qua kho tai lieu cua cong dong HUMG</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            Loc:
          </div>
          <Select value={faculty} onValueChange={setFaculty}>
            <SelectTrigger className="w-[200px]" data-testid="select-faculty">
              <SelectValue placeholder="Chon khoa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tat ca khoa</SelectItem>
              {FACULTIES.map((f) => (
                <SelectItem key={f} value={f}>{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[200px]" data-testid="select-category">
              <SelectValue placeholder="Chon loai" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tat ca loai</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[160px]" data-testid="select-sort">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Moi nhat</SelectItem>
              <SelectItem value="popular">Pho bien nhat</SelectItem>
              <SelectItem value="rating">Danh gia cao</SelectItem>
            </SelectContent>
          </Select>

          {(faculty !== "all" || category !== "all") && (
            <Button variant="ghost" size="sm" onClick={() => { setFaculty("all"); setCategory("all"); }} data-testid="button-clear-filters">
              Xoa bo loc
            </Button>
          )}
        </div>

        {(faculty !== "all" || category !== "all") && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {faculty !== "all" && (
              <Badge variant="secondary" className="gap-1">
                {faculty}
                <button onClick={() => setFaculty("all")} className="ml-1 text-xs opacity-60">x</button>
              </Badge>
            )}
            {category !== "all" && (
              <Badge variant="outline" className="gap-1">
                {category}
                <button onClick={() => setCategory("all")} className="ml-1 text-xs opacity-60">x</button>
              </Badge>
            )}
          </div>
        )}

        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <DocumentCardSkeleton key={i} />)
          ) : documents && documents.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground mb-3">{documents.length} tai lieu</p>
              {documents.map((doc) => (
                <DocumentCard key={doc.id} document={doc} />
              ))}
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="font-medium">Khong tim thay tai lieu</p>
                <p className="text-sm mt-1">Thu thay doi bo loc hoac tim kiem voi tu khoa khac</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
