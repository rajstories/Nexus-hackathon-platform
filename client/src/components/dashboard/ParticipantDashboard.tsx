import { useState, useEffect } from "react";
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
import { SubmissionForm } from '@/components/SubmissionForm';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
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
  Award,
  Settings,
  Share2,
  MessageCircle,
  LogOut
} from "lucide-react";
import { CertificateDownload } from '@/components/CertificateDownload';
import { logOut } from '@/lib/firebase';

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
  const [teamName, setTeamName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [editTeamOpen, setEditTeamOpen] = useState(false);
  const [editedTeamName, setEditedTeamName] = useState("");
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");
  const queryClient = useQueryClient();

  // Fetch user data from database
  const { data: userData, isLoading: userDataLoading } = useQuery({
    queryKey: ['/api/auth/me'],
    enabled: !!user,
  });

  // Fetch user's teams
  const { data: userTeams, isLoading: teamsLoading } = useQuery({
    queryKey: ['/api', 'teams', 'me'],
    enabled: !!user,
  });

  // Get the first team (assuming user can only be in one team per event for now)
  // The API returns data in format: { data: { teams: [...], total_teams: number }, message: string }
  const teamsData = userTeams?.data?.teams || userTeams?.teams || [];
  const currentTeam = Array.isArray(teamsData) && teamsData.length > 0 ? teamsData[0] : null;

  // Show loading while auth or user data is being determined
  if (loading || userDataLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Use real user data from database and Firebase auth
  const profile = {
    name: userData?.data?.name || user?.displayName || "User",
    email: userData?.data?.email || user?.email || "No email",
    school: userData?.data?.school || "Not specified",
    skills: userData?.data?.skills || [],
    bio: userData?.data?.bio || "",
    team: currentTeam, // Real team data from API
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

  // Create Team Mutation
  const createTeamMutation = useMutation({
    mutationFn: async (teamData: { name: string; event_id: string }) => {
      const response = await apiRequest('POST', '/api/teams', teamData);
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Team Created!",
        description: `Team "${teamName}" has been created successfully! Invite code: ${data.invite_code}`
      });
      setTeamDialogOpen(false);
      setTeamName("");
      queryClient.invalidateQueries({ queryKey: ['/api', 'teams', 'me'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error Creating Team",
        description: error.message || "Failed to create team. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Join Team Mutation
  const joinTeamMutation = useMutation({
    mutationFn: async (inviteCode: string) => {
      const response = await apiRequest('POST', '/api/teams/join', { invite_code: inviteCode });
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Team Joined!",
        description: `You've successfully joined team "${data.team_name}"!`
      });
      setInviteCode("");
      queryClient.invalidateQueries({ queryKey: ['/api', 'teams', 'me'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error Joining Team",
        description: error.message || "Invalid invite code. Please check and try again.",
        variant: "destructive"
      });
    }
  });

  // Update Profile Mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: { name: string; school: string; skills: string[] }) => {
      const response = await apiRequest('PUT', '/api/auth/profile', profileData);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully!"
      });
      setEditProfileOpen(false);
      // Refresh user data
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleCreateTeam = () => {
    if (!teamName.trim()) {
      toast({
        title: "Team Name Required",
        description: "Please enter a team name.",
        variant: "destructive"
      });
      return;
    }

    // For demo, we'll use a default event ID. In a real app, user would select an event
    const defaultEventId = "550e8400-e29b-41d4-a716-446655440001"; // This should be a real event ID
    
    createTeamMutation.mutate({
      name: teamName,
      event_id: defaultEventId
    });
  };

  const handleJoinTeam = () => {
    if (!inviteCode.trim()) {
      toast({
        title: "Invite Code Required",
        description: "Please enter an invite code.",
        variant: "destructive"
      });
      return;
    }

    joinTeamMutation.mutate(inviteCode.trim().toUpperCase());
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
    updateProfileMutation.mutate({
      name: editedProfile.name,
      school: editedProfile.school,
      skills: editedProfile.skills
    });
  };

  const handleLogout = async () => {
    try {
      await logOut();
      toast({
        title: 'Signed out',
        description: 'You have been successfully signed out.',
      });
    } catch (error: any) {
      toast({
        title: 'Sign out failed',
        description: error.message || 'An error occurred while signing out.',
        variant: 'destructive',
      });
    }
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

  const handleEditTeam = () => {
    setEditedTeamName(currentTeam?.name || "");
    setEditTeamOpen(true);
  };

  const handleSaveTeam = () => {
    // In a real app, this would update team details in the database
    toast({
      title: "Team Updated",
      description: "Team details have been updated successfully!"
    });
    setEditTeamOpen(false);
  };

  const handleShareWhatsApp = () => {
    const message = `Join my team "${currentTeam?.name}" for ${currentTeam?.event?.title}!\n\nUse invite code: ${currentTeam?.invite_code}\n\nJoin here: ${window.location.origin}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleAddMember = () => {
    if (!memberEmail.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter a member's email address.",
        variant: "destructive"
      });
      return;
    }

    // In a real app, this would send an invitation email or add the member
    toast({
      title: "Invitation Sent",
      description: `Invitation sent to ${memberEmail}!`
    });
    setMemberEmail("");
    setAddMemberOpen(false);
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
                <div className="space-y-1 flex-1">
                  <h3 className="text-lg font-semibold" data-testid="text-username">{profile.name}</h3>
                  <p className="text-muted-foreground" data-testid="text-email">{profile.email}</p>
                  <p className="text-sm text-muted-foreground">{profile.school}</p>
                </div>
                <div className="flex flex-col gap-2">
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
                          disabled={updateProfileMutation.isPending}
                          data-testid="button-save-profile"
                        >
                          {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                  </Dialog>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleLogout}
                    data-testid="button-log-out"
                    className="text-red-600 hover:text-red-700 hover:border-red-300"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log Out
                  </Button>
                </div>
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
                  {profile.team ? (
                    <CertificateDownload
                      teamId={profile.team.id}
                      userName={profile.name}
                      eventName={profile.team.event?.title || "Hackathon Event"}
                      eventId={profile.team.event?.id || "default"}
                      role="participant"
                    />
                  ) : (
                    <Button disabled variant="outline" data-testid="button-certificate-disabled">
                      Join a team to download certificates
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          {teamsLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </CardContent>
            </Card>
          ) : profile.team ? (
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
                    <h3 className="text-lg font-semibold" data-testid="text-team-name">{profile.team.name}</h3>
                    <div className="flex items-center gap-2">
                      <Badge>{profile.team.members?.length || 0} Members</Badge>
                      {profile.team.is_creator && (
                        <Dialog open={editTeamOpen} onOpenChange={setEditTeamOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={handleEditTeam}
                              data-testid="button-edit-team"
                            >
                              <Settings className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Team</DialogTitle>
                              <DialogDescription>Update your team details</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="edit-team-name">Team Name</Label>
                                <Input 
                                  id="edit-team-name" 
                                  value={editedTeamName}
                                  onChange={(e) => setEditedTeamName(e.target.value)}
                                  placeholder="Enter team name"
                                  data-testid="input-edit-team-name"
                                />
                              </div>
                              <div className="flex justify-end gap-3 pt-4">
                                <Button 
                                  variant="outline" 
                                  onClick={() => setEditTeamOpen(false)}
                                  data-testid="button-cancel-edit-team"
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  onClick={handleSaveTeam}
                                  data-testid="button-save-team"
                                >
                                  Save Changes
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-2">Invite Code</p>
                    <div className="flex items-center gap-2">
                      <code className="bg-slate-200 dark:bg-slate-700 px-3 py-1 rounded text-sm font-mono">
                        {profile.team.invite_code}
                      </code>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(profile.team.invite_code);
                          toast({
                            title: "Copied!",
                            description: "Invite code copied to clipboard."
                          });
                        }}
                        data-testid="button-copy-invite"
                      >
                        Copy
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={handleShareWhatsApp}
                        className="bg-green-500 hover:bg-green-600 text-white border-green-500"
                        data-testid="button-share-whatsapp"
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        WhatsApp
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          const shareData = {
                            title: `Join my team "${profile.team.name}"`,
                            text: `Join my team "${profile.team.name}" for ${profile.team.event?.title}! Use invite code: ${profile.team.invite_code}`,
                            url: window.location.origin
                          };
                          if (navigator.share) {
                            navigator.share(shareData);
                          } else {
                            navigator.clipboard.writeText(`${shareData.text}\n\n${shareData.url}`);
                            toast({
                              title: "Copied!",
                              description: "Invite link copied to clipboard."
                            });
                          }
                        }}
                        data-testid="button-share-general"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium">Team Members</h4>
                      {profile.team.is_creator && (
                        <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              data-testid="button-add-member"
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Add Member
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Team Member</DialogTitle>
                              <DialogDescription>Invite a new member to join your team</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="member-email">Email Address</Label>
                                <Input 
                                  id="member-email" 
                                  type="email"
                                  value={memberEmail}
                                  onChange={(e) => setMemberEmail(e.target.value)}
                                  placeholder="Enter member's email"
                                  data-testid="input-member-email"
                                />
                              </div>
                              <div className="flex justify-end gap-3 pt-4">
                                <Button 
                                  variant="outline" 
                                  onClick={() => setAddMemberOpen(false)}
                                  data-testid="button-cancel-add-member"
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  onClick={handleAddMember}
                                  data-testid="button-send-invitation"
                                >
                                  Send Invitation
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                    {profile.team.members && profile.team.members.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {profile.team.members.map((member: any) => (
                          <div key={member.user_id} className="flex items-center space-x-3 p-3 border rounded-lg">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback>
                                {member.name ? member.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium" data-testid={`text-member-${member.user_id}`}>
                                {member.name || 'Unknown'}
                              </p>
                              <p className="text-xs text-muted-foreground">{member.email}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
                          <Input 
                            id="team-name" 
                            placeholder="Enter team name" 
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            data-testid="input-team-name" 
                          />
                        </div>
                        <div>
                          <Label htmlFor="team-description">Description (Optional)</Label>
                          <Textarea id="team-description" placeholder="Describe your team's goals" data-testid="input-team-description" />
                        </div>
                        <Button 
                          onClick={handleCreateTeam} 
                          className="w-full" 
                          disabled={createTeamMutation.isPending}
                          data-testid="button-submit-team"
                        >
                          {createTeamMutation.isPending ? "Creating..." : "Create Team"}
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
                    <Input 
                      id="invite-code" 
                      placeholder="Enter invite code" 
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      data-testid="input-invite-code" 
                    />
                  </div>
                  <Button 
                    onClick={handleJoinTeam} 
                    className="w-full" 
                    disabled={joinTeamMutation.isPending}
                    data-testid="button-join-team"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    {joinTeamMutation.isPending ? "Joining..." : "Join Team"}
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
          <SubmissionForm currentTeam={currentTeam} />
        </TabsContent>
      </Tabs>
    </div>
  );
}