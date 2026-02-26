import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Star,
  Brain,
  FileSpreadsheet,
  Code,
  GraduationCap,
  Palette,
  ShoppingBag,
  Coins,
  Clock,
} from "lucide-react";
import type { ShopItem, ShopPurchase, UserProfile } from "@shared/schema";

const iconMap: Record<string, any> = {
  Star,
  Brain,
  FileSpreadsheet,
  Code,
  GraduationCap,
  Palette,
  ShoppingBag,
};

export default function ShopPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [confirmItem, setConfirmItem] = useState<ShopItem | null>(null);

  const { data: profile, isLoading: profileLoading } = useQuery<UserProfile>({
    queryKey: ["/api/profile"],
  });

  const { data: items, isLoading: itemsLoading } = useQuery<ShopItem[]>({
    queryKey: ["/api/shop"],
  });

  const { data: purchases, isLoading: purchasesLoading } = useQuery<ShopPurchase[]>({
    queryKey: ["/api/shop", "purchases"],
  });

  const purchaseMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const res = await apiRequest("POST", "/api/shop/purchase", { itemId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shop", "purchases"] });
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({
        title: "Mua thanh cong!",
        description: "San pham da duoc them vao tai khoan cua ban.",
      });
      setConfirmItem(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Loi",
        description: error.message,
        variant: "destructive",
      });
      setConfirmItem(null);
    },
  });

  const userPoints = profile?.points ?? 0;

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-shop-title">
              Cua hang
            </h1>
            <p className="text-muted-foreground mt-1">
              Doi diem thuong lay san pham hap dan
            </p>
          </div>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                <Coins className="h-5 w-5 text-primary" />
              </div>
              <div>
                {profileLoading ? (
                  <Skeleton className="h-7 w-16" />
                ) : (
                  <div className="text-2xl font-bold" data-testid="text-user-points">
                    {userPoints}
                  </div>
                )}
                <div className="text-xs text-muted-foreground">Diem cua ban</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="products">
          <TabsList className="mb-6">
            <TabsTrigger value="products" data-testid="tab-products">
              <ShoppingBag className="h-4 w-4 mr-1.5" />
              San pham
            </TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">
              <Clock className="h-4 w-4 mr-1.5" />
              Lich su mua
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            {itemsLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6 space-y-4">
                      <Skeleton className="h-10 w-10 rounded-md" />
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-9 w-16" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : items && items.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => {
                  const IconComponent = iconMap[item.icon || ""] || ShoppingBag;
                  const canAfford = userPoints >= item.cost;

                  return (
                    <Card key={item.id} data-testid={`card-shop-item-${item.id}`}>
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                            <IconComponent className="h-5 w-5 text-primary" />
                          </div>
                          <Badge variant="secondary" data-testid={`badge-type-${item.id}`}>
                            {item.type}
                          </Badge>
                        </div>
                        <div>
                          <h3 className="font-semibold" data-testid={`text-item-name-${item.id}`}>
                            {item.name}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1" data-testid={`text-item-desc-${item.id}`}>
                            {item.description}
                          </p>
                        </div>
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <Coins className="h-4 w-4 text-primary" />
                            <span className="font-bold" data-testid={`text-item-cost-${item.id}`}>
                              {item.cost} diem
                            </span>
                          </div>
                          <Button
                            size="sm"
                            disabled={!canAfford || purchaseMutation.isPending}
                            onClick={() => setConfirmItem(item)}
                            data-testid={`button-buy-${item.id}`}
                          >
                            Mua
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <ShoppingBag className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Chua co san pham nao trong cua hang</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history">
            {purchasesLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-5 w-24" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : purchases && purchases.length > 0 ? (
              <div className="space-y-3">
                {purchases.map((purchase, index) => (
                  <Card key={purchase.id} data-testid={`card-purchase-${purchase.id}`}>
                    <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                          <ShoppingBag className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium" data-testid={`text-purchase-item-${purchase.id}`}>
                            {purchase.itemId}
                          </div>
                          <div className="text-xs text-muted-foreground" data-testid={`text-purchase-date-${purchase.id}`}>
                            {purchase.purchasedAt
                              ? new Date(purchase.purchasedAt).toLocaleDateString("vi-VN")
                              : ""}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Coins className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium" data-testid={`text-purchase-points-${purchase.id}`}>
                          -{purchase.pointsSpent} diem
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Ban chua mua san pham nao</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={!!confirmItem} onOpenChange={(open) => !open && setConfirmItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xac nhan mua hang</AlertDialogTitle>
            <AlertDialogDescription>
              Ban co chac muon mua {confirmItem?.name} voi {confirmItem?.cost} diem?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-purchase">Huy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmItem && purchaseMutation.mutate(confirmItem.id)}
              disabled={purchaseMutation.isPending}
              data-testid="button-confirm-purchase"
            >
              {purchaseMutation.isPending ? "Dang xu ly..." : "Xac nhan"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
