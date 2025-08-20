import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, 
  Calendar, 
  Megaphone, 
  Users, 
  Eye, 
  Plus,
  Edit,
  Trash2,
  Send,
  Clock,
  Trophy,
  FileText,
  UserCheck,
  Shield
} from "lucide-react";
import { SimilarityPanel } from '@/components/SimilarityPanel';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { SponsorManagement } from '@/components/SponsorManagement';

export function OrganizerDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [trackDialogOpen, setTrackDialogOpen] = useState(false);
  const [announcementDialogOpen, setAnnouncementDialogOpen] = useState(false);
  const [judgeDialogOpen, setJudgeDialogOpen] = useState(false);

  // Fetch events created by this organizer
  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ["/api/events/organizer"]
  });

  const events = eventsData?.data || [];
  const currentEvent = events.length > 0 ? {
    id: events[0].id,
    name: events[0].title,
    description: events[0].description,
    startDate: events[0].start_at,
    endDate: events[0].end_at,
    status: "upcoming",
    participants: 156,
    teams: 42,
    submissions: 0
  } : {
    id: '',
    name: "No events created yet",
    description: "Create your first event to get started",
    startDate: '',
    endDate: '',
    status: "none",
    participants: 0,
    teams: 0,
    submissions: 0
  };

  const tracks = [
    { id: 1, name: "AI & Machine Learning", description: "Build intelligent applications", teams: 15 },
    { id: 2, name: "Web3 & Blockchain", description: "Decentralized solutions", teams: 12 },
    { id: 3, name: "Social Impact", description: "Technology for good", teams: 8 },
    { id: 4, name: "Open Innovation", description: "Any creative solution", teams: 7 }
  ];

  const judges = [
    { id: 1, name: "Dr. Sarah Kim", expertise: "AI/ML", email: "sarah@company.com", status: "confirmed" },
    { id: 2, name: "Alex Rodriguez", expertise: "Web Dev", email: "alex@startup.com", status: "pending" },
    { id: 3, name: "Maria Chen", expertise: "Design", email: "maria@agency.com", status: "confirmed" }
  ];

  const submissions = [
    { id: 1, team: "Team Alpha", project: "Smart City Dashboard", track: "AI & ML", submitted: "2025-08-27 10:30", status: "submitted" },
    { id: 2, team: "Code Warriors", project: "EcoTracker", track: "Social Impact", submitted: "2025-08-27 11:15", status: "submitted" },
    { id: 3, team: "Innovation Squad", project: "DeFi Protocol", track: "Web3", submitted: "2025-08-27 09:45", status: "submitted" }
  ];

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (eventData: any) => {
      return apiRequest("/api/events", {
        method: "POST",
        body: JSON.stringify(eventData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events/organizer"] });
      toast({
        title: "Event Created",
        description: "New hackathon event has been created successfully!"
      });
      setEventDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive"
      });
    }
  });

  const [newEventData, setNewEventData] = useState({
    title: '',
    description: '',
    mode: 'hybrid',
    startDate: '',
    endDate: ''
  });

  const handleCreateEvent = () => {
    if (!newEventData.title || !newEventData.description || !newEventData.startDate || !newEventData.endDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const eventData = {
      title: newEventData.title,
      description: newEventData.description,
      mode: newEventData.mode,
      start_at: newEventData.startDate,
      end_at: newEventData.endDate
    };
    
    createEventMutation.mutate(eventData);
  };

  const handleCreateTrack = () => {
    toast({
      title: "Track Created",
      description: "New competition track has been added!"
    });
    setTrackDialogOpen(false);
  };

  const handleSendAnnouncement = () => {
    toast({
      title: "Announcement Sent",
      description: "Announcement has been sent to all participants!"
    });
    setAnnouncementDialogOpen(false);
  };

  const handleInviteJudge = () => {
    toast({
      title: "Judge Invited",
      description: "Invitation has been sent to the judge!"
    });
    setJudgeDialogOpen(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Organizer Dashboard</h1>
          <p className="text-muted-foreground">Manage events, tracks, and participants</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          <Settings className="w-4 h-4 mr-1" />
          Organizer
        </Badge>
      </div>

      <Tabs defaultValue="event" className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="event" data-testid="tab-event">Event</TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
          <TabsTrigger value="tracks" data-testid="tab-tracks">Tracks</TabsTrigger>
          <TabsTrigger value="sponsors" data-testid="tab-sponsors">Sponsors</TabsTrigger>
          <TabsTrigger value="announcements" data-testid="tab-announcements">Announcements</TabsTrigger>
          <TabsTrigger value="judges" data-testid="tab-judges">Judges</TabsTrigger>
          <TabsTrigger value="submissions" data-testid="tab-submissions">Submissions</TabsTrigger>
          <TabsTrigger value="similarity" data-testid="tab-similarity">
            <Shield className="w-4 h-4 mr-1" />
            Verify
          </TabsTrigger>
        </TabsList>

        <TabsContent value="event" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600" data-testid="text-participants">{currentEvent.participants}</div>
                  <p className="text-sm text-muted-foreground">Participants</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600" data-testid="text-teams">{currentEvent.teams}</div>
                  <p className="text-sm text-muted-foreground">Teams</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600" data-testid="text-submissions">{currentEvent.submissions}</div>
                  <p className="text-sm text-muted-foreground">Submissions</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Event Management
                  </CardTitle>
                  <CardDescription>Create and manage hackathon events</CardDescription>
                </div>
                <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-create-event">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Event
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create New Event</DialogTitle>
                      <DialogDescription>Set up a new hackathon event</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="event-name">Event Name</Label>
                        <Input 
                          id="event-name" 
                          placeholder="Enter event name" 
                          data-testid="input-event-name"
                          value={newEventData.title}
                          onChange={(e) => setNewEventData({...newEventData, title: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="event-description">Description</Label>
                        <Textarea 
                          id="event-description" 
                          placeholder="Describe your event" 
                          data-testid="input-event-description"
                          value={newEventData.description}
                          onChange={(e) => setNewEventData({...newEventData, description: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="start-date">Start Date</Label>
                          <Input 
                            id="start-date" 
                            type="datetime-local" 
                            data-testid="input-start-date"
                            value={newEventData.startDate}
                            onChange={(e) => setNewEventData({...newEventData, startDate: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="end-date">End Date</Label>
                          <Input 
                            id="end-date" 
                            type="datetime-local" 
                            data-testid="input-end-date"
                            value={newEventData.endDate}
                            onChange={(e) => setNewEventData({...newEventData, endDate: e.target.value})}
                          />
                        </div>
                      </div>
                      <Button 
                        onClick={handleCreateEvent} 
                        className="w-full" 
                        data-testid="button-submit-event"
                        disabled={createEventMutation.isPending}
                      >
                        {createEventMutation.isPending ? "Creating..." : "Create Event"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium" data-testid="text-current-event">{currentEvent.name}</h3>
                    <p className="text-sm text-muted-foreground">{currentEvent.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {currentEvent.startDate} - {currentEvent.endDate}
                      </span>
                      <Badge variant="outline">{currentEvent.status}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsDashboard eventId={currentEvent.id.toString()} />
        </TabsContent>

        <TabsContent value="sponsors" className="space-y-6">
          <SponsorManagement eventId={currentEvent.id.toString()} />
        </TabsContent>

        <TabsContent value="tracks" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Competition Tracks</CardTitle>
                  <CardDescription>Manage different competition categories</CardDescription>
                </div>
                <Dialog open={trackDialogOpen} onOpenChange={setTrackDialogOpen}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-create-track">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Track
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Track</DialogTitle>
                      <DialogDescription>Add a new competition track</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="track-name">Track Name</Label>
                        <Input id="track-name" placeholder="Enter track name" data-testid="input-track-name" />
                      </div>
                      <div>
                        <Label htmlFor="track-description">Description</Label>
                        <Textarea id="track-description" placeholder="Describe this track" data-testid="input-track-description" />
                      </div>
                      <Button onClick={handleCreateTrack} className="w-full" data-testid="button-submit-track">
                        Create Track
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {tracks.map((track) => (
                  <div key={track.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium" data-testid={`text-track-${track.id}`}>{track.name}</h3>
                      <Badge variant="secondary">{track.teams} teams</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{track.description}</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="announcements" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Megaphone className="w-5 h-5" />
                    Announcements
                  </CardTitle>
                  <CardDescription>Send updates to all participants</CardDescription>
                </div>
                <Dialog open={announcementDialogOpen} onOpenChange={setAnnouncementDialogOpen}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-create-announcement">
                      <Send className="w-4 h-4 mr-2" />
                      New Announcement
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Announcement</DialogTitle>
                      <DialogDescription>Send a message to all participants</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="announcement-title">Title</Label>
                        <Input id="announcement-title" placeholder="Enter announcement title" data-testid="input-announcement-title" />
                      </div>
                      <div>
                        <Label htmlFor="announcement-message">Message</Label>
                        <Textarea 
                          id="announcement-message" 
                          placeholder="Write your announcement message" 
                          className="min-h-[100px]"
                          data-testid="input-announcement-message"
                        />
                      </div>
                      <div>
                        <Label htmlFor="announcement-priority">Priority</Label>
                        <Select>
                          <SelectTrigger data-testid="select-priority">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleSendAnnouncement} className="w-full" data-testid="button-send-announcement">
                        <Send className="w-4 h-4 mr-2" />
                        Send Announcement
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  <Megaphone className="w-12 h-12 mx-auto mb-4" />
                  <p>No announcements yet. Create your first announcement to get started.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="judges" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5" />
                    Judge Management
                  </CardTitle>
                  <CardDescription>Invite and manage event judges</CardDescription>
                </div>
                <Dialog open={judgeDialogOpen} onOpenChange={setJudgeDialogOpen}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-invite-judge">
                      <Plus className="w-4 h-4 mr-2" />
                      Invite Judge
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Invite Judge</DialogTitle>
                      <DialogDescription>Send an invitation to a new judge</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="judge-name">Judge Name</Label>
                        <Input id="judge-name" placeholder="Enter judge name" data-testid="input-judge-name" />
                      </div>
                      <div>
                        <Label htmlFor="judge-email">Email</Label>
                        <Input id="judge-email" type="email" placeholder="judge@example.com" data-testid="input-judge-email" />
                      </div>
                      <div>
                        <Label htmlFor="judge-expertise">Area of Expertise</Label>
                        <Input id="judge-expertise" placeholder="e.g., AI/ML, Web Development" data-testid="input-judge-expertise" />
                      </div>
                      <Button onClick={handleInviteJudge} className="w-full" data-testid="button-send-invite">
                        Send Invitation
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {judges.map((judge) => (
                  <div key={judge.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback>{judge.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium" data-testid={`text-judge-${judge.id}`}>{judge.name}</h4>
                        <p className="text-sm text-muted-foreground">{judge.email}</p>
                        <p className="text-sm text-muted-foreground">{judge.expertise}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={judge.status === 'confirmed' ? 'default' : 'secondary'}>
                        {judge.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Send className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Project Submissions
              </CardTitle>
              <CardDescription>View and manage submitted projects</CardDescription>
            </CardHeader>
            <CardContent>
              {submissions.length > 0 ? (
                <div className="space-y-4">
                  {submissions.map((submission) => (
                    <div key={submission.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium" data-testid={`text-submission-${submission.id}`}>{submission.project}</h4>
                          <p className="text-sm text-muted-foreground">by {submission.team}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{submission.track}</Badge>
                          <p className="text-xs text-muted-foreground mt-1">{submission.submitted}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-3 h-3 mr-1" />
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trophy className="w-3 h-3 mr-1" />
                          Assign Judges
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4" />
                  <p>No submissions yet. Submissions will appear here once teams submit their projects.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="similarity" className="space-y-6">
          <SimilarityPanel 
            eventId={currentEvent.id.toString()}
            authToken="mock-firebase-token-organizer"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}