import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Megaphone, AlertTriangle, Info } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  message: string;
  priority: "low" | "medium" | "high";
  timestamp: Date;
}

export function useAnnouncementToasts() {
  const { toast } = useToast();

  const showAnnouncement = (announcement: Announcement) => {
    const icon = announcement.priority === "high" 
      ? <AlertTriangle className="h-5 w-5" />
      : announcement.priority === "medium"
      ? <Megaphone className="h-5 w-5" />
      : <Info className="h-5 w-5" />;

    toast({
      title: (
        <div className="flex items-center gap-2">
          {icon}
          <span>{announcement.title}</span>
        </div>
      ),
      description: announcement.message,
      duration: announcement.priority === "high" ? 10000 : 5000,
      variant: announcement.priority === "high" ? "destructive" : "default",
    });
  };

  // Listen for WebSocket announcements
  useEffect(() => {
    const handleAnnouncement = (event: CustomEvent<Announcement>) => {
      showAnnouncement(event.detail);
    };

    window.addEventListener("announcement" as any, handleAnnouncement);
    return () => window.removeEventListener("announcement" as any, handleAnnouncement);
  }, []);

  return { showAnnouncement };
}