import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Download, Star, Clock, FileText, FileSpreadsheet, FileImage, Film, Archive } from "lucide-react";
import type { Document } from "@shared/schema";

function getFileIcon(fileType: string | null) {
  if (!fileType) return FileText;
  if (fileType.includes("pdf")) return FileText;
  if (fileType.includes("spreadsheet") || fileType.includes("excel")) return FileSpreadsheet;
  if (fileType.includes("image")) return FileImage;
  if (fileType.includes("video")) return Film;
  if (fileType.includes("zip") || fileType.includes("rar")) return Archive;
  return FileText;
}

function formatFileSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
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
  const months = Math.floor(days / 30);
  return `${months} thang truoc`;
}

interface DocumentCardProps {
  document: Document & { uploaderName?: string };
}

export function DocumentCard({ document }: DocumentCardProps) {
  const FileIcon = getFileIcon(document.fileType);

  return (
    <Link href={`/document/${document.id}`}>
      <Card className="group cursor-pointer transition-all duration-200 hover-elevate" data-testid={`card-document-${document.id}`}>
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <FileIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-medium leading-snug line-clamp-2 text-sm" data-testid={`text-doc-title-${document.id}`}>
                {document.title}
              </h3>
              {document.description && (
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  {document.description}
                </p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <Badge variant="secondary" className="text-xs">
                  {document.faculty}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {document.category}
                </Badge>
              </div>
              <div className="mt-2.5 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Download className="h-3 w-3" />
                  {document.downloadCount || 0}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  {document.averageRating ? (document.averageRating / 10).toFixed(1) : "0.0"}
                </span>
                {document.fileSize && (
                  <span>{formatFileSize(document.fileSize)}</span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {timeAgo(document.createdAt)}
                </span>
              </div>
              {document.tags && document.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {document.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-xs text-primary/70">#{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function DocumentCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-3">
          <div className="h-10 w-10 shrink-0 rounded-md bg-muted animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
            <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
            <div className="flex gap-2">
              <div className="h-5 w-16 rounded-full bg-muted animate-pulse" />
              <div className="h-5 w-16 rounded-full bg-muted animate-pulse" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
