import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mountain, BookOpen, Users, Award, ArrowRight, Shield, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-14 items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                <Mountain className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">HUMG Share</span>
            </div>
            <div className="flex items-center gap-2">
              <a href="/api/login">
                <Button variant="ghost" size="sm" data-testid="button-landing-login">
                  Dang nhap
                </Button>
              </a>
              <a href="/api/login">
                <Button size="sm" data-testid="button-landing-register">
                  Bat dau ngay
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/3" />
        <div className="absolute top-20 right-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-10 left-10 h-48 w-48 rounded-full bg-primary/8 blur-2xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:py-28 lg:py-36">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <Mountain className="h-3 w-3" />
                Dai hoc Mo - Dia chat Ha Noi
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                <span className="text-foreground">Kho tai nguyen </span>
                <span className="text-primary">hoc tap</span>
                <span className="text-foreground"> cua sinh vien </span>
                <span className="text-primary">HUMG</span>
              </h1>
              <p className="max-w-lg text-lg text-muted-foreground leading-relaxed">
                Chia se va tim kiem tai lieu chuyen nganh Mo, Dia chat, Dau khi, Moi truong va nhieu linh vuc khac. Mien phi, de dang, va duoc dong gop boi cong dong sinh vien.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="/api/login">
                  <Button size="lg" data-testid="button-hero-start">
                    Bat dau chia se
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                </a>
                <a href="/browse">
                  <Button variant="outline" size="lg" data-testid="button-hero-browse">
                    Kham pha tai lieu
                  </Button>
                </a>
              </div>
              <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Shield className="h-3 w-3 text-primary" />
                  Mien phi 100%
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-primary" />
                  Tai lieu da duoc duyet
                </span>
              </div>
            </div>

            <div className="hidden lg:flex items-center justify-center">
              <div className="relative">
                <div className="absolute -inset-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 blur-xl" />
                <div className="relative rounded-xl bg-card border p-8 space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b">
                    <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Dia chat dai cuong</div>
                      <div className="text-xs text-muted-foreground">Slide bai giang - Khoa Dia chat</div>
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    {["Co hoc dat da - Chuong 5.pdf", "De thi giua ky 2024.docx", "Bai tap lon GIS.zip"].map((file, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2 text-xs">
                        <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center shrink-0">
                          <BookOpen className="h-3 w-3 text-primary" />
                        </div>
                        <span className="truncate">{file}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>245 tai lieu</span>
                    <span>1,200+ luot tai</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t bg-card/50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold sm:text-3xl">Tai sao chon HUMG Share?</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Nen tang duoc thiet ke rieng cho sinh vien Dai hoc Mo - Dia chat
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: BookOpen,
                title: "Tai lieu chuyen nganh",
                desc: "Slide, de thi, do an, luan van tu cac khoa Mo, Dia chat, Dau khi, Moi truong, Trac dia va nhieu hon nua.",
              },
              {
                icon: Users,
                title: "Cong dong sinh vien",
                desc: "Chia se va tim kiem tai lieu tu sinh vien, giang vien va cuu sinh vien HUMG. Binh luan, danh gia va ho tro lan nhau.",
              },
              {
                icon: Award,
                title: "He thong diem thuong",
                desc: "Upload tai lieu chat luong de nhan diem. Dung diem de tai tai lieu premium va mo khoa noi dung doc quyen.",
              },
            ].map((feature, i) => (
              <Card key={i} className="hover-elevate">
                <CardContent className="p-6 space-y-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
          <div className="grid gap-8 sm:grid-cols-4 text-center">
            {[
              { value: "500+", label: "Tai lieu" },
              { value: "1,200+", label: "Luot tai" },
              { value: "300+", label: "Thanh vien" },
              { value: "10+", label: "Chuyen nganh" },
            ].map((stat) => (
              <div key={stat.label} className="space-y-1">
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2">
              <Mountain className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">HUMG Share</span>
            </div>
            <p className="text-xs text-muted-foreground">Dai hoc Mo - Dia chat Ha Noi</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
