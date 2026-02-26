import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { useAuth } from "@/hooks/use-auth";
import LandingPage from "@/pages/landing";
import HomePage from "@/pages/home";
import BrowsePage from "@/pages/browse";
import SearchPage from "@/pages/search";
import UploadPage from "@/pages/upload";
import DocumentDetailPage from "@/pages/document-detail";
import ProfilePage from "@/pages/profile";
import AdminPage from "@/pages/admin";
import ForumPage from "@/pages/forum";
import ShopPage from "@/pages/shop";
import NotFound from "@/pages/not-found";

function AuthenticatedHome() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 mx-auto rounded-md bg-primary animate-pulse" />
          <p className="text-sm text-muted-foreground">Dang tai...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return <HomePage />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={AuthenticatedHome} />
      <Route path="/browse" component={BrowsePage} />
      <Route path="/search" component={SearchPage} />
      <Route path="/upload" component={UploadPage} />
      <Route path="/document/:id" component={DocumentDetailPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/forum" component={ForumPage} />
      <Route path="/forum/:id" component={ForumPage} />
      <Route path="/shop" component={ShopPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
