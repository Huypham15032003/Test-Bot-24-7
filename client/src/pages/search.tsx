import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { DocumentCard, DocumentCardSkeleton } from "@/components/document-card";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search as SearchIcon, BookOpen, TrendingUp } from "lucide-react";
import type { Document } from "@shared/schema";
import { POPULAR_TAGS } from "@shared/schema";
import { useState } from "react";
import { Link } from "wouter";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const handleSearch = (val: string) => {
    setQuery(val);
    clearTimeout((window as any).__searchTimeout);
    (window as any).__searchTimeout = setTimeout(() => {
      setDebouncedQuery(val);
    }, 300);
  };

  const { data: results, isLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents/search", `?q=${encodeURIComponent(debouncedQuery)}`],
    enabled: debouncedQuery.length >= 2,
  });

  return (
    <Layout>
      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold mb-2" data-testid="text-search-title">Tim kiem tai lieu</h1>
          <p className="text-muted-foreground">Tim kiem theo ten, mon hoc, tag hoac tu khoa</p>
        </div>

        <div className="relative mb-6">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Nhap tu khoa tim kiem..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 h-11"
            data-testid="input-search"
          />
        </div>

        {!debouncedQuery && (
          <div className="mb-8">
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              Tag pho bien
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_TAGS.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer text-xs"
                  onClick={() => handleSearch(tag)}
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {debouncedQuery.length >= 2 && (
          <div className="space-y-3">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <DocumentCardSkeleton key={i} />)
            ) : results && results.length > 0 ? (
              <>
                <p className="text-sm text-muted-foreground">{results.length} ket qua cho "{debouncedQuery}"</p>
                {results.map((doc) => (
                  <DocumentCard key={doc.id} document={doc} />
                ))}
              </>
            ) : (
              <Card>
                <CardContent className="p-12 text-center text-muted-foreground">
                  <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p className="font-medium">Khong tim thay ket qua</p>
                  <p className="text-sm mt-1">Thu tim voi tu khoa khac</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
