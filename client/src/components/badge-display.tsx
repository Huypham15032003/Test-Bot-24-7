import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  UserPlus, Upload, Award, Crown, Zap, MessageCircle, CheckCircle, Compass,
} from "lucide-react";
import type { Badge as BadgeType, UserBadge } from "@shared/schema";

const iconMap: Record<string, any> = {
  UserPlus, Upload, Award, Crown, Zap, MessageCircle, CheckCircle, Compass,
};

interface BadgeDisplayProps {
  badges: (UserBadge & { badge: BadgeType })[];
  size?: "sm" | "md";
}

export function BadgeDisplay({ badges, size = "sm" }: BadgeDisplayProps) {
  if (!badges || badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1" data-testid="badge-display">
      {badges.map((ub) => {
        const Icon = iconMap[ub.badge.icon] || Award;
        return (
          <Tooltip key={ub.id}>
            <TooltipTrigger asChild>
              <div
                className={`inline-flex items-center gap-1 rounded-full border px-2 ${size === "sm" ? "py-0.5 text-xs" : "py-1 text-sm"}`}
                style={{ borderColor: ub.badge.color, color: ub.badge.color }}
                data-testid={`badge-${ub.badge.name}`}
              >
                <Icon className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />
                <span className="font-medium">{ub.badge.name}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{ub.badge.description}</p>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}

interface BadgeGridProps {
  allBadges: BadgeType[];
  earnedBadgeIds: Set<string>;
}

export function BadgeGrid({ allBadges, earnedBadgeIds }: BadgeGridProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" data-testid="badge-grid">
      {allBadges.map((badge) => {
        const Icon = iconMap[badge.icon] || Award;
        const earned = earnedBadgeIds.has(badge.id);
        return (
          <div
            key={badge.id}
            className={`rounded-lg border p-3 text-center transition-all ${earned ? "border-primary bg-primary/5" : "opacity-50 grayscale"}`}
            data-testid={`badge-card-${badge.id}`}
          >
            <div
              className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: earned ? `${badge.color}20` : undefined, color: earned ? badge.color : undefined }}
            >
              <Icon className="h-5 w-5" />
            </div>
            <p className="font-medium text-sm">{badge.name}</p>
            <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
            {earned && (
              <Badge variant="secondary" className="mt-2 text-xs">Da dat</Badge>
            )}
          </div>
        );
      })}
    </div>
  );
}
