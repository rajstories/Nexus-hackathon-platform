import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { 
  User, 
  Users, 
  Calendar, 
  Upload, 
  Plus, 
  UserPlus, 
  Clock, 
  Trophy,
  Github,
  ExternalLink,
  Award
} from "lucide-react";
import { CertificateDownload } from '@/components/CertificateDownload';

export function ParticipantDashboard() {
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    name: "",
    school: "",
    skills: [] as string[]
  });

  // Show loading while auth is being determined
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Use real user data from Firebase auth
  const profile = {
    name: user?.displayName || "User",
    email: user?.email || "No email",
    school: "Not specified", // Can be added to user profile later
    skills: ["React", "Node.js", "Python", "UI/UX"], // Default skills - can be made dynamic later
    team: null, // Will be fetched from API later
    photoURL: user?.photoURL
  };

  const getUserInitials = (name: string, email: string) => {
    if (name && name !== "User") {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  const eventTimeline = [
    { id: 1, title: "Registration Opens", date: "2025-08-15", status: "completed" },
    { id: 2, title: "Team Formation", date: "2025-08-20", status: "active" },
    { id: 3, title: "Hacking Begins", date: "2025-08-25", status: "upcoming" },
    { id: 4, title: "Submissions Due", date: "2025-08-27", status: "upcoming" },
    { id: 5, title: "Judging & Awards", date: "2025-08-28", status: "upcoming" }
  ];

  const handleCreateTeam = () => {
    toast({
      title: "Team Created",
      description: "Your team has been created successfully!"
    });
    setTeamDialogOpen(false);
  };

  const handleJoinTeam = () => {
    toast({
      title: "Team Joined",
      description: "You've successfully joined the team!"
    });
  };

  const handleSubmitProject = () => {
    toast({
      title: "Project Submitted",
      description: "Your project has been submitted for judging!"
    });
    setSubmitDialogOpen(false);
  };

  const handleEditProfile = () => {
    // Initialize the edit form with current values
    setEditedProfile({
      name: profile.name,
      school: profile.school,
      skills: [...profile.skills]
    });
    setEditProfileOpen(true);
  };

  const handleSaveProfile = () => {
    // In a real app, this would save to the database
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully!"
    });
    setEditProfileOpen(false);
  };

  const handleAddSkill = (skill: string) => {
    if (skill.trim() && !editedProfile.skills.includes(skill.trim())) {
      setEditedProfile(prev => ({
        ...prev,
        skills: [...prev.skills, skill.trim()]
      }));
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setEditedProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Participant Dashboard</h1>
          <p className="text-muted-foreground">Manage your profile, team, and submissions</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          <User className="w-4 h-4 mr-1" />
          Participant
        </Badge>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" data-testid="tab-profile">Profile</TabsTrigger>
          <TabsTrigger value="team" data-testid="tab-team">Team</TabsTrigger>
          <TabsTrigger value="timeline" data-testid="tab-timeline">Timeline</TabsTrigger>
          <TabsTrigger value="submit" data-testid="tab-submit">Submit</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
              <CardDescription>Update your personal information and skills</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={profile.photoURL || undefined} />
                  <AvatarFallback>{getUserInitials(profile.name, profile.email)}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold" data-testid="text-username">{profile.name}</h3>
                  <p className="text-muted-foreground" data-testid="text-email">{profile.email}</p>
                  <p className="text-sm text-muted-foreground">{profile.school}</p>
                </div>
                <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={handleEditProfile} data-testid="button-edit-profile">
                      Edit Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Edit Profile</DialogTitle>
                      <DialogDescription>Update your personal information and skills</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="edit-name">Display Name</Label>
                        <Input 
                          id="edit-name" 
                          value={editedProfile.name}
                          onChange={(e) => setEditedProfile(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Your display name"
                          data-testid="input-edit-name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-school">School/Organization</Label>
                        <Input 
                          id="edit-school" 
                          value={editedProfile.school}
                          onChange={(e) => setEditedProfile(prev => ({ ...prev, school: e.target.value }))}
                          placeholder="Your school or organization"
                          data-testid="input-edit-school"
                        />
                      </div>
                      <div>
                        <Label>Skills</Label>
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            {editedProfile.skills.map((skill) => (
                              <Badge 
                                key={skill} 
                                variant="secondary" 
                                className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                                onClick={() => handleRemoveSkill(skill)}
                                data-testid={`badge-skill-${skill.toLowerCase()}`}
                              >
                                {skill} ×
                              </Badge>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Input 
                              placeholder="Add a skill"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleAddSkill((e.target as HTMLInputElement).value);
                                  (e.target as HTMLInputElement).value = '';
                                }
                              }}
                              data-testid="input-add-skill"
                            />
                            <Button 
                              type="button"
                              variant="outline"
                              onClick={() => {
                                const input = document.querySelector('[data-testid="input-add-skill"]') as HTMLInputElement;
                                if (input?.value) {
                                  handleAddSkill(input.value);
                                  input.value = '';
                                }
                              }}
                              data-testid="button-add-skill"
                            >
                              Add
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">Click on skills to remove them, or press Enter to add new ones</p>
                        </div>
                      </div>
                      <div className="flex justify-end gap-3 pt-4">
                        <Button 
                          variant="outline" 
                          onClick={() => setEditProfileOpen(false)}
                          data-testid="button-cancel-edit"
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleSaveProfile}
                          data-testid="button-save-profile"
                        >
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Skills</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Certificates & Awards
              </CardTitle>
              <CardDescription>Download your participation and achievement certificates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Event Certificate</h4>
                    <p className="text-sm text-muted-foreground">
                      Download your certificate once the event ends or if you're marked as a finalist
                    </p>
                  </div>
                  <CertificateDownload
                    teamId={1} // In real app, use actual team ID
                    userName={profile.name}
                    eventName="Fusion X Hackathon 2025"
                    eventId={1}
                    role="participant"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          {profile.team ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  My Team
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Team Alpha</h3>
                    <Badge>4/4 Members</Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((member) => (
                      <div key={member} className="text-center space-y-2">
                        <Avatar className="mx-auto">
                          <AvatarFallback>M{member}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">Member {member}</p>
                          <p className="text-xs text-muted-foreground">Developer</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Create Team
                  </CardTitle>
                  <CardDescription>Start your own team and invite others</CardDescription>
                </CardHeader>
                <CardContent>
                  <Dialog open={teamDialogOpen} onOpenChange={setTeamDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full" data-testid="button-create-team">
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Team
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create Team</DialogTitle>
                        <DialogDescription>Set up your team for the hackathon</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="team-name">Team Name</Label>
                          <Input id="team-name" placeholder="Enter team name" data-testid="input-team-name" />
                        </div>
                        <div>
                          <Label htmlFor="team-description">Description</Label>
                          <Textarea id="team-description" placeholder="Describe your team's goals" data-testid="input-team-description" />
                        </div>
                        <Button onClick={handleCreateTeam} className="w-full" data-testid="button-submit-team">
                          Create Team
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    Join Team
                  </CardTitle>
                  <CardDescription>Join an existing team with an invite code</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="invite-code">Invite Code</Label>
                    <Input id="invite-code" placeholder="Enter invite code" data-testid="input-invite-code" />
                  </div>
                  <Button onClick={handleJoinTeam} className="w-full" data-testid="button-join-team">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Join Team
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Event Timeline
              </CardTitle>
              <CardDescription>Track important dates and deadlines</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {eventTimeline.map((event, index) => (
                  <div key={event.id} className="flex items-center space-x-4">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      event.status === 'completed' ? 'bg-green-500 border-green-500' :
                      event.status === 'active' ? 'bg-blue-500 border-blue-500' :
                      'bg-gray-300 border-gray-300'
                    }`} />
                    {index < eventTimeline.length - 1 && (
                      <div className="absolute left-6 mt-6 w-0.5 h-8 bg-gray-200" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium" data-testid={`text-event-${event.id}`}>{event.title}</h4>
                        <Badge variant={
                          event.status === 'completed' ? 'default' :
                          event.status === 'active' ? 'secondary' :
                          'outline'
                        }>
                          {event.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        {event.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Project Submission
              </CardTitle>
              <CardDescription>Submit your project for judging</CardDescription>
            </CardHeader>
            <CardContent>
              {profile.team ? (
                <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full" size="lg" data-testid="button-submit-project">
                      <Upload className="w-4 h-4 mr-2" />
                      Submit Project
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Submit Your Project</DialogTitle>
                      <DialogDescription>Provide details about your hackathon project</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="project-name">Project Name</Label>
                        <Input id="project-name" placeholder="Enter your project name" data-testid="input-project-name" />
                      </div>
                      <div>
                        <Label htmlFor="project-description">Description</Label>
                        <Textarea 
                          id="project-description" 
                          placeholder="Describe what your project does and how it works" 
                          className="min-h-[100px]"
                          data-testid="input-project-description"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="github-url">GitHub Repository</Label>
                          <div className="flex">
                            <Github className="w-4 h-4 mt-3 mr-2 text-muted-foreground" />
                            <Input id="github-url" placeholder="https://github.com/..." data-testid="input-github-url" />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="demo-url">Live Demo URL</Label>
                          <div className="flex">
                            <ExternalLink className="w-4 h-4 mt-3 mr-2 text-muted-foreground" />
                            <Input id="demo-url" placeholder="https://..." data-testid="input-demo-url" />
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="tech-stack">Technologies Used</Label>
                        <Input id="tech-stack" placeholder="React, Node.js, PostgreSQL, etc." data-testid="input-tech-stack" />
                      </div>
                      <Button onClick={handleSubmitProject} className="w-full" data-testid="button-confirm-submit">
                        <Trophy className="w-4 h-4 mr-2" />
                        Submit for Judging
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              ) : (
                <div className="text-center py-8">
                  <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Join a Team First</h3>
                  <p className="text-muted-foreground mb-4">You need to be part of a team to submit a project</p>
                  <Button variant="outline" onClick={() => {
                    const teamTab = document.querySelector('[data-testid="tab-team"]') as HTMLButtonElement;
                    teamTab?.click();
                  }}>
                    Go to Team Tab
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}