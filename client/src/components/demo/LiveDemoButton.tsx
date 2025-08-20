import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Rocket, Loader2 } from "lucide-react";
import { useLocation } from "wouter";

export function LiveDemoButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const startLiveDemo = async () => {
    setIsLoading(true);
    
    try {
      // Step 1: Reset demo data via public endpoint
      const resetResponse = await fetch('/api/demo/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const resetData = await resetResponse.json();
      
      if (!resetData.success) {
        throw new Error(resetData.message || 'Failed to start demo');
      }
      
      const eventId = resetData.data.event.id;
      
      toast({
        title: "Demo Started! 🚀",
        description: `Demo data loaded: ${resetData.data.stats.participants} participants, ${resetData.data.stats.teams} teams, ${resetData.data.stats.submissions} submissions`,
      });
      
      // Step 2: Open judge views in new tabs
      setTimeout(() => {
        // Open organizer dashboard
        window.open(`/dashboard?demo=organizer&eventId=${eventId}`, '_blank');
      }, 1000);
      
      setTimeout(() => {
        // Open judge dashboard
        window.open(`/dashboard?demo=judge1&eventId=${eventId}`, '_blank');
      }, 1500);
      
      setTimeout(() => {
        // Open participant dashboard
        window.open(`/dashboard?demo=participant&eventId=${eventId}`, '_blank');
      }, 2000);
      
      // Step 3: Trigger live updates via WebSocket
      setTimeout(() => {
        try {
          const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
          const wsUrl = `${protocol}//${window.location.host}/ws`;
          const announcementSocket = new WebSocket(wsUrl);
          
          announcementSocket.onopen = () => {
            // Send welcome announcement
            announcementSocket.send(JSON.stringify({
              type: 'announcement',
              eventId: eventId,
              title: 'Welcome to Demo Hackathon 2024!',
              message: 'The judging phase has begun. Good luck to all teams!',
              priority: 'high'
            }));
            
            // Send deadline reminder
            setTimeout(() => {
              announcementSocket.send(JSON.stringify({
                type: 'announcement',
                eventId: eventId,
                title: 'Submission Deadline Approaching',
                message: 'You have 30 minutes left to submit your projects!',
                priority: 'medium'
              }));
            }, 3000);
            
            // Send leaderboard update
            setTimeout(() => {
              announcementSocket.send(JSON.stringify({
                type: 'leaderboard-update',
                eventId: eventId,
                message: 'Leaderboard has been updated with latest scores!'
              }));
              announcementSocket.close();
            }, 5000);
          };
          
          announcementSocket.onerror = (error) => {
            console.log('WebSocket connection not available, continuing without live updates');
          };
        } catch (wsError) {
          console.log('WebSocket not available, continuing without live updates');
        }
      }, 3000);
      
      // Step 4: Show success and navigate to event live page
      setTimeout(() => {
        navigate(`/event/${eventId}/live`);
        toast({
          title: "Demo is Live! 🎉",
          description: "Check the tabs to see different user perspectives",
        });
      }, 4000);
      
    } catch (error: any) {
      console.error('Demo start error:', error);
      toast({
        title: "Demo Start Failed",
        description: error.message || "Failed to start demo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={startLiveDemo}
      disabled={isLoading}
      size="lg"
      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
      data-testid="button-start-demo"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Starting Demo...
        </>
      ) : (
        <>
          <Rocket className="mr-2 h-5 w-5" />
          Start Live Demo
        </>
      )}
    </Button>
  );
}