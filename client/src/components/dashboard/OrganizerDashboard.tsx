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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
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
  Shield,
  CalendarIcon,
  Book
} from "lucide-react";
import { SimilarityPanel } from '@/components/SimilarityPanel';
import { AnnouncementPanel } from '@/components/AnnouncementPanel';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { SponsorManagement } from '@/components/SponsorManagement';

export function OrganizerDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [trackDialogOpen, setTrackDialogOpen] = useState(false);
  const [announcementDialogOpen, setAnnouncementDialogOpen] = useState(false);
  const [judgeDialogOpen, setJudgeDialogOpen] = useState(false);
  const [judgeFormData, setJudgeFormData] = useState({
    judge_email: ''
  });
  const [policyDialogOpen, setPolicyDialogOpen] = useState(false);
  const [viewDetailsDialogOpen, setViewDetailsDialogOpen] = useState(false);
  const [assignJudgesDialogOpen, setAssignJudgesDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [selectedJudgesForAssignment, setSelectedJudgesForAssignment] = useState<string[]>([]);

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

  // Fetch tracks from backend
  const { data: tracksData, isLoading: tracksLoading } = useQuery({
    queryKey: ["/api/events", currentEvent.id, "tracks"],
    enabled: !!currentEvent.id && currentEvent.id !== ''
  });
  
  const tracks = tracksData?.data || [];

  // Fetch judges data
  const { data: judgesData, isLoading: judgesLoading } = useQuery({
    queryKey: ["/api/events", currentEvent.id, "judges"],
    enabled: !!currentEvent.id && currentEvent.id !== ''
  });
  
  const judges = judgesData?.data || [];

  // Fetch submissions data
  const { data: submissionsData, isLoading: submissionsLoading } = useQuery({
    queryKey: ["/api/events", currentEvent.id, "submissions"],
    enabled: !!currentEvent.id && currentEvent.id !== ''
  });
  
  const submissions = submissionsData?.data || [];

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (eventData: any) => {
      return apiRequest("POST", "/api/events", eventData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events/organizer"] });
      toast({
        title: "Event Created",
        description: "New hackathon event has been created successfully!"
      });
      // Reset form
      setNewEventData({
        title: '',
        description: '',
        mode: 'hybrid',
        startDate: new Date(),
        endDate: new Date()
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
    startDate: new Date(),
    endDate: new Date()
  });

  const [newTrackData, setNewTrackData] = useState({
    name: '',
    description: ''
  });

  const [editingTrack, setEditingTrack] = useState<{id: string, name: string, description: string} | null>(null);
  const [editTrackDialogOpen, setEditTrackDialogOpen] = useState(false);

  const handleCreateEvent = () => {
    console.log('Form data:', newEventData); // Debug log
    
    if (!newEventData.title || !newEventData.description || !newEventData.startDate || !newEventData.endDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    // Validate dates
    if (newEventData.endDate <= newEventData.startDate) {
      toast({
        title: "Error",
        description: "End date must be after start date.",
        variant: "destructive"
      });
      return;
    }

    const eventData = {
      title: newEventData.title,
      description: newEventData.description,
      mode: newEventData.mode === 'hybrid' ? 'online' : newEventData.mode, // Convert hybrid to online for schema
      start_at: newEventData.startDate.toISOString(),
      end_at: newEventData.endDate.toISOString()
    };
    
    createEventMutation.mutate(eventData);
  };

  // Create track mutation
  const createTrackMutation = useMutation({
    mutationFn: async (trackData: {name: string, description: string}) => {
      return apiRequest("POST", `/api/events/${currentEvent.id}/tracks`, trackData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", currentEvent.id, "tracks"] });
      toast({
        title: "Track Created",
        description: "New competition track has been added!"
      });
      setNewTrackData({ name: '', description: '' });
      setTrackDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create track. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Update track mutation
  const updateTrackMutation = useMutation({
    mutationFn: async (data: {id: string, name: string, description: string}) => {
      return apiRequest("PUT", `/api/events/${currentEvent.id}/tracks/${data.id}`, {
        name: data.name,
        description: data.description
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", currentEvent.id, "tracks"] });
      toast({
        title: "Track Updated",
        description: "Track has been updated successfully!"
      });
      setEditingTrack(null);
      setEditTrackDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update track. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Delete track mutation
  const deleteTrackMutation = useMutation({
    mutationFn: async (trackId: string) => {
      return apiRequest("DELETE", `/api/events/${currentEvent.id}/tracks/${trackId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", currentEvent.id, "tracks"] });
      toast({
        title: "Track Deleted",
        description: "Track has been deleted successfully!"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete track. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleCreateTrack = () => {
    if (!newTrackData.name || !newTrackData.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    createTrackMutation.mutate(newTrackData);
  };

  const handleEditTrack = (track: any) => {
    setEditingTrack({
      id: track.id,
      name: track.name,
      description: track.description
    });
    setEditTrackDialogOpen(true);
  };

  // Assign judge mutation
  const assignJudgeMutation = useMutation({
    mutationFn: async (judgeData: {judge_email: string}) => {
      return apiRequest("POST", `/api/admin/events/${currentEvent.id}/judges`, judgeData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", currentEvent.id, "judges"] });
      toast({
        title: "Success",
        description: "Judge assigned successfully!"
      });
      setJudgeFormData({ judge_email: '' });
      setJudgeDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign judge. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleAssignJudge = () => {
    if (!judgeFormData.judge_email) {
      toast({
        title: "Error",
        description: "Please enter a judge email address.",
        variant: "destructive"
      });
      return;
    }
    assignJudgeMutation.mutate(judgeFormData);
  };

  const handleViewSubmissionDetails = (submission: any) => {
    setSelectedSubmission(submission);
    setViewDetailsDialogOpen(true);
  };

  const handleAssignJudgesToSubmission = (submission: any) => {
    setSelectedSubmission(submission);
    setSelectedJudgesForAssignment([]);
    setAssignJudgesDialogOpen(true);
  };

  const handleConfirmJudgeAssignment = () => {
    if (selectedJudgesForAssignment.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one judge.",
        variant: "destructive"
      });
      return;
    }
    
    // Here you would typically make an API call to assign judges to the submission
    toast({
      title: "Success",
      description: `${selectedJudgesForAssignment.length} judge(s) assigned to ${selectedSubmission?.project_name || selectedSubmission?.title}!`
    });
    setAssignJudgesDialogOpen(false);
    setSelectedSubmission(null);
    setSelectedJudgesForAssignment([]);
  };

  const toggleJudgeSelection = (judgeEmail: string) => {
    setSelectedJudgesForAssignment(prev => 
      prev.includes(judgeEmail) 
        ? prev.filter(email => email !== judgeEmail)
        : [...prev, judgeEmail]
    );
  };

  const handleUpdateTrack = () => {
    if (!editingTrack?.name || !editingTrack?.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    updateTrackMutation.mutate(editingTrack);
  };

  const handleDeleteTrack = (trackId: string) => {
    if (confirm('Are you sure you want to delete this track?')) {
      deleteTrackMutation.mutate(trackId);
    }
  };

  const handleSendAnnouncement = () => {
    toast({
      title: "Announcement Sent",
      description: "Announcement has been sent to all participants!"
    });
    setAnnouncementDialogOpen(false);
  };


  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Organizer Dashboard</h1>
          <p className="text-muted-foreground">Manage events, tracks, and participants</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={policyDialogOpen} onOpenChange={setPolicyDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" data-testid="button-policy">
                <Book className="w-4 h-4 mr-2" />
                Policy
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Judging & Feedback Policy</DialogTitle>
                <DialogDescription>
                  Transparency & guidelines for fair evaluation
                </DialogDescription>
              </DialogHeader>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <div className="space-y-6">
                  <section>
                    <h3 className="text-lg font-semibold mb-3">Public Information</h3>
                    <ul className="space-y-2 text-sm">
                      <li><strong>Rubric</strong>: All evaluation criteria and scoring rubrics are publicly visible to participants before and during the event</li>
                      <li><strong>Judging Process</strong>: Teams can see which judges are assigned to evaluate their submissions</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-lg font-semibold mb-3">Judge Requirements</h3>
                    <ul className="space-y-2 text-sm">
                      <li><strong>Constructive Feedback</strong>: Judges must provide at least one constructive comment per submission they evaluate</li>
                      <li><strong>Quality Standards</strong>: Comments should be specific, actionable, and help teams understand their scores</li>
                      <li><strong>Professional Conduct</strong>: All feedback must be respectful and focused on the work, not personal attributes</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-lg font-semibold mb-3">Feedback Privacy & Release</h3>
                    <ul className="space-y-2 text-sm">
                      <li><strong>Initial Privacy</strong>: All judge feedback and scores remain private to the team until the designated release time</li>
                      <li><strong>Release Timeline</strong>: Feedback becomes visible to teams at the time specified by <code>feedback_release_at</code></li>
                      <li><strong>Team-Only Access</strong>: Once released, feedback is visible only to the team members - it is never made public</li>
                      <li><strong>No Public Scores</strong>: Individual scores and detailed feedback are never displayed publicly to maintain team privacy</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-lg font-semibold mb-3">Clarification Process</h3>
                    <ul className="space-y-2 text-sm">
                      <li><strong>48-Hour Window</strong>: Teams have 48 hours after feedback release to request clarifications</li>
                      <li><strong>One Message Limit</strong>: Each team may send only one clarification message per submission</li>
                      <li><strong>Direct Communication</strong>: Clarification requests go directly to the assigned judges</li>
                      <li><strong>Response Timeline</strong>: Judges should respond to clarification requests within 24 hours when possible</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-lg font-semibold mb-3">Appeal Process</h3>
                    <ul className="space-y-2 text-sm">
                      <li><strong>Organizer Review</strong>: Teams may appeal scores through the event organizer if they believe there was an error in evaluation</li>
                      <li><strong>Documentation Required</strong>: Appeals must include specific concerns about scoring discrepancies or policy violations</li>
                      <li><strong>Final Decision</strong>: Organizer decisions on appeals are final</li>
                    </ul>
                  </section>

                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground italic">
                      This policy ensures fair, transparent, and constructive evaluation while protecting team privacy and maintaining the integrity of the judging process.
                    </p>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Badge variant="secondary" className="text-sm">
            <Settings className="w-4 h-4 mr-1" />
            Organizer
          </Badge>
        </div>
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
                          <Label>Start Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal"
                                data-testid="button-start-date"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {newEventData.startDate ? format(newEventData.startDate, "PPP") : "Pick a date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <CalendarComponent
                                mode="single"
                                selected={newEventData.startDate}
                                onSelect={(date) => date && setNewEventData({...newEventData, startDate: date})}
                                disabled={(date) => date < new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div>
                          <Label>End Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal"
                                data-testid="button-end-date"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {newEventData.endDate ? format(newEventData.endDate, "PPP") : "Pick a date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <CalendarComponent
                                mode="single"
                                selected={newEventData.endDate}
                                onSelect={(date) => date && setNewEventData({...newEventData, endDate: date})}
                                disabled={(date) => date < newEventData.startDate}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
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
                        <Input 
                          id="track-name" 
                          placeholder="Enter track name" 
                          data-testid="input-track-name"
                          value={newTrackData.name}
                          onChange={(e) => setNewTrackData({...newTrackData, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="track-description">Description</Label>
                        <Textarea 
                          id="track-description" 
                          placeholder="Describe this track" 
                          data-testid="input-track-description"
                          value={newTrackData.description}
                          onChange={(e) => setNewTrackData({...newTrackData, description: e.target.value})}
                        />
                      </div>
                      <Button 
                        onClick={handleCreateTrack} 
                        className="w-full" 
                        data-testid="button-submit-track"
                        disabled={createTrackMutation.isPending}
                      >
                        {createTrackMutation.isPending ? "Creating..." : "Create Track"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {tracksLoading ? (
                <div className="text-center py-8">
                  <div className="text-muted-foreground">Loading tracks...</div>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {tracks.map((track: any) => (
                    <div key={track.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium" data-testid={`text-track-${track.id}`}>{track.name}</h3>
                        <Badge variant="secondary">{track.max_teams} max teams</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{track.description}</p>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEditTrack(track)}
                          data-testid={`button-edit-track-${track.id}`}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteTrack(track.id)}
                          disabled={deleteTrackMutation.isPending}
                          data-testid={`button-delete-track-${track.id}`}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                  {tracks.length === 0 && (
                    <div className="col-span-2 text-center py-8">
                      <div className="text-muted-foreground">No tracks created yet. Add your first track!</div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="announcements" className="space-y-6">
          <AnnouncementPanel 
            eventId={currentEvent.id.toString()}
            userRole="organizer"
            authToken="mock-firebase-token-organizer"
          />
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
                        <Label htmlFor="judge-email">Judge Email</Label>
                        <Input 
                          id="judge-email" 
                          type="email" 
                          placeholder="judge@example.com" 
                          data-testid="input-judge-email"
                          value={judgeFormData.judge_email}
                          onChange={(e) => setJudgeFormData({judge_email: e.target.value})}
                        />
                      </div>
                      <Button 
                        onClick={handleAssignJudge} 
                        className="w-full" 
                        data-testid="button-send-invite"
                        disabled={assignJudgeMutation.isPending}
                      >
                        {assignJudgeMutation.isPending ? "Assigning..." : "Assign Judge"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {judgesLoading ? (
                <div className="text-center py-8">
                  <div className="text-muted-foreground">Loading judges...</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {judges && judges.length > 0 ? (
                    <div className="grid gap-4">
                      {judges.map((judge: any) => (
                        <div key={judge.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium" data-testid={`text-judge-${judge.id}`}>
                                {judge.judge_email}
                              </h3>
                              <p className="text-sm text-muted-foreground">Judge</p>
                            </div>
                            <Badge variant="outline">Active</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <UserCheck className="w-12 h-12 mx-auto mb-4" />
                      <p>No judges assigned yet. Invite your first judge to get started.</p>
                    </div>
                  )}
                </div>
              )}
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
              {submissionsLoading ? (
                <div className="text-center py-8">
                  <div className="text-muted-foreground">Loading submissions...</div>
                </div>
              ) : submissions.length > 0 ? (
                <div className="space-y-4">
                  {submissions.map((submission: any) => (
                    <div key={submission.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium" data-testid={`text-submission-${submission.id}`}>
                            {submission.project_name || submission.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">by {submission.team_name}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{submission.track_name}</Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(submission.submitted_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          data-testid={`button-view-${submission.id}`}
                          onClick={() => handleViewSubmissionDetails(submission)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View Details
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleAssignJudgesToSubmission(submission)}
                          data-testid={`button-assign-judges-${submission.id}`}
                        >
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
      
      {/* View Submission Details Dialog */}
      <Dialog open={viewDetailsDialogOpen} onOpenChange={setViewDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
            <DialogDescription>
              View complete information about this project submission
            </DialogDescription>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Project Name</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedSubmission.project_name || selectedSubmission.title}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Team</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedSubmission.team_name}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Track</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedSubmission.track_name}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Submitted</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedSubmission.submitted_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedSubmission.description || "No description provided"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Files</Label>
                <div className="mt-2 p-3 border rounded-lg">
                  {selectedSubmission.file_url ? (
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm">Submission files available</span>
                      <Button variant="outline" size="sm">
                        Download
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No files submitted</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Judges Dialog */}
      <Dialog open={assignJudgesDialogOpen} onOpenChange={setAssignJudgesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Judges</DialogTitle>
            <DialogDescription>
              Select judges to evaluate "{selectedSubmission?.project_name || selectedSubmission?.title}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Available Judges</Label>
              {judges.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {judges.map((judge: any) => (
                    <div 
                      key={judge.id} 
                      className="flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleJudgeSelection(judge.judge_email)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedJudgesForAssignment.includes(judge.judge_email)}
                        onChange={() => toggleJudgeSelection(judge.judge_email)}
                        className="rounded"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{judge.judge_email}</p>
                        <p className="text-xs text-muted-foreground">Judge</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No judges available. Please assign judges first.
                </p>
              )}
            </div>
            <div className="flex justify-between">
              <p className="text-sm text-muted-foreground">
                {selectedJudgesForAssignment.length} judge(s) selected
              </p>
              <Button 
                onClick={handleConfirmJudgeAssignment}
                disabled={selectedJudgesForAssignment.length === 0}
              >
                Assign Selected Judges
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Edit Track Dialog */}
      <Dialog open={editTrackDialogOpen} onOpenChange={setEditTrackDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Track</DialogTitle>
            <DialogDescription>Update competition track details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-track-name">Track Name</Label>
              <Input 
                id="edit-track-name" 
                placeholder="Enter track name" 
                value={editingTrack?.name || ''}
                onChange={(e) => setEditingTrack(prev => prev ? {...prev, name: e.target.value} : null)}
              />
            </div>
            <div>
              <Label htmlFor="edit-track-description">Description</Label>
              <Textarea 
                id="edit-track-description" 
                placeholder="Describe this track" 
                value={editingTrack?.description || ''}
                onChange={(e) => setEditingTrack(prev => prev ? {...prev, description: e.target.value} : null)}
              />
            </div>
            <Button 
              onClick={handleUpdateTrack} 
              className="w-full"
              disabled={updateTrackMutation.isPending}
            >
              {updateTrackMutation.isPending ? "Updating..." : "Update Track"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}