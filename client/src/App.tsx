import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { AuthProvider } from "./contexts/AuthContext";
import { EventStatusBar } from "./components/EventStatusBar";
import { useAnnouncementToasts } from "./components/AnnouncementToast";
import { DevRoleSwitcher } from "./components/DevRoleSwitcher";
import Home from "./pages/home";
import Auth from "./pages/auth";
import Dashboard from "./pages/dashboard";
import RegisterPage from "./pages/register";
import NotFound from "./pages/not-found";
import { EventLivePage } from "./pages/event-live";
import HackathonsPage from "./pages/hackathons";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={Auth} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/hackathons" component={HackathonsPage} />
      <Route path="/register/:hackathonId?" component={RegisterPage} />
      <Route path="/event/:eventId/live" component={EventLivePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  useAnnouncementToasts();

  // Force dark theme on mount
  useEffect(() => {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  }, []);

  return (
    <>
      <DevRoleSwitcher />
      <Router />
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
