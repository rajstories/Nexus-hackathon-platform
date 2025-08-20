import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Calendar, AlertCircle, CheckCircle } from "lucide-react";
import { format, differenceInMinutes, differenceInHours, differenceInDays } from "date-fns";

interface EventStatus {
  phase: "upcoming" | "live" | "judging" | "ended";
  nextDeadline: Date | null;
  currentActivity: string;
  urgency: "low" | "medium" | "high" | "critical";
}

export function EventStatusBar({ eventData }: { eventData?: any }) {
  const [status, setStatus] = useState<EventStatus>({
    phase: "upcoming",
    nextDeadline: null,
    currentActivity: "Event not started",
    urgency: "low"
  });
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      updateEventStatus();
    }, 30000); // Update every 30 seconds

    updateEventStatus();
    return () => clearInterval(timer);
  }, [eventData]);

  const updateEventStatus = () => {
    if (!eventData) return;

    const now = new Date();
    const startTime = new Date(eventData.startAt || Date.now() + 86400000);
    const endTime = new Date(eventData.endAt || Date.now() + 172800000);
    const submissionDeadline = new Date(endTime.getTime() - 3600000); // 1 hour before end

    let newStatus: EventStatus = {
      phase: "upcoming",
      nextDeadline: null,
      currentActivity: "",
      urgency: "low"
    };

    if (now < startTime) {
      // Before event starts
      newStatus.phase = "upcoming";
      newStatus.nextDeadline = startTime;
      newStatus.currentActivity = "Event starts soon";
      
      const hoursUntil = differenceInHours(startTime, now);
      if (hoursUntil <= 1) newStatus.urgency = "high";
      else if (hoursUntil <= 6) newStatus.urgency = "medium";
    } else if (now < submissionDeadline) {
      // During hacking phase
      newStatus.phase = "live";
      newStatus.nextDeadline = submissionDeadline;
      newStatus.currentActivity = "Hacking in progress";
      
      const minutesUntil = differenceInMinutes(submissionDeadline, now);
      if (minutesUntil <= 30) newStatus.urgency = "critical";
      else if (minutesUntil <= 120) newStatus.urgency = "high";
      else if (minutesUntil <= 360) newStatus.urgency = "medium";
    } else if (now < endTime) {
      // Judging phase
      newStatus.phase = "judging";
      newStatus.nextDeadline = endTime;
      newStatus.currentActivity = "Judging in progress";
      newStatus.urgency = "medium";
    } else {
      // Event ended
      newStatus.phase = "ended";
      newStatus.nextDeadline = null;
      newStatus.currentActivity = "Event concluded";
      newStatus.urgency = "low";
    }

    setStatus(newStatus);
  };

  const getTimeRemaining = (deadline: Date) => {
    const now = new Date();
    const minutes = differenceInMinutes(deadline, now);
    const hours = differenceInHours(deadline, now);
    const days = differenceInDays(deadline, now);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m`;
    return "Soon";
  };

  const getStatusColor = () => {
    switch (status.urgency) {
      case "critical": return "bg-red-500";
      case "high": return "bg-orange-500";
      case "medium": return "bg-yellow-500";
      default: return "bg-green-500";
    }
  };

  const getStatusIcon = () => {
    switch (status.phase) {
      case "ended": return <CheckCircle className="h-4 w-4" />;
      case "judging": return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (!eventData) return null;

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b shadow-sm"
      data-testid="event-status-bar"
    >
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`px-3 py-1 rounded-full text-white text-sm font-medium flex items-center gap-2 ${getStatusColor()}`}>
              {getStatusIcon()}
              <span className="capitalize">{status.phase}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{status.currentActivity}</span>
            </div>
          </div>

          {status.nextDeadline && (
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="text-muted-foreground">Next deadline: </span>
                <span className="font-medium">{format(status.nextDeadline, "MMM d, h:mm a")}</span>
              </div>
              
              <motion.div
                animate={status.urgency === "critical" ? { scale: [1, 1.1, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1 }}
                className={`px-3 py-1 rounded-lg font-bold text-sm ${
                  status.urgency === "critical" 
                    ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                    : status.urgency === "high"
                    ? "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400"
                    : "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                }`}
              >
                {getTimeRemaining(status.nextDeadline)}
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}