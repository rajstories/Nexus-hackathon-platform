import { Switch, Route } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { EventStatusBar } from "@/components/EventStatusBar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAnnouncementToasts } from "@/components/AnnouncementToast";
import Home from "@/pages/home";
import Auth from "@/pages/auth";
import Dashboard from "@/pages/dashboard";
import NotFound from "@/pages/not-found";
import { EventLivePage } from "@/pages/event-live";

function Router() {
  const { data: eventData } = useQuery({
    queryKey: ["/api/events/1"],
    enabled: true,
    refetchInterval: 60000 // Refresh every minute
  });

  useAnnouncementToasts();

  return (
    <>
      {eventData && <EventStatusBar eventData={eventData} />}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <div className={eventData ? "pt-14" : ""}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/auth" component={Auth} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/event/:eventId/live" component={EventLivePage} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </>
  );
}

function AppContent() {
  const { data: eventData } = useQuery({
    queryKey: ["/api/events/1"],
    enabled: true,
    refetchInterval: 60000 // Refresh every minute
  });

  useAnnouncementToasts();

  return (
    <>
      {eventData && <EventStatusBar eventData={eventData} />}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <div className={eventData ? "pt-14" : ""}>
        <Router />
      </div>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <AppContent />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
