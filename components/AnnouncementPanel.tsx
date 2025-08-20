import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useSocket } from '@/hooks/useSocket';
import { Megaphone, AlertTriangle, Info, Plus, Clock } from 'lucide-react';

interface AnnouncementData {
  id: string;
  eventId: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  type: 'announcement' | 'alert' | 'update';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
}

interface AnnouncementPanelProps {
  eventId: string;
  userRole: 'participant' | 'organizer' | 'judge';
  authToken?: string;
}

export function AnnouncementPanel({ eventId, userRole, authToken }: AnnouncementPanelProps) {
  const { toast } = useToast();
  const { connected, joinEvent, sendAnnouncement, announcements, onAnnouncement } = useSocket(authToken);
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    type: 'announcement' as 'announcement' | 'alert' | 'update',
    priority: 'medium' as 'low' | 'medium' | 'high',
  });

  useEffect(() => {
    if (connected && eventId) {
      joinEvent(eventId);
    }
  }, [connected, eventId, joinEvent]);

  useEffect(() => {
    onAnnouncement((announcement) => {
      toast({
        title: "New Announcement",
        description: announcement.title,
        variant: announcement.priority === 'high' ? 'destructive' : 'default',
      });
    });
  }, [onAnnouncement, toast]);

  const handleCreateAnnouncement = () => {
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    sendAnnouncement(eventId, newAnnouncement);
    setNewAnnouncement({
      title: '',
      content: '',
      type: 'announcement',
      priority: 'medium',
    });
    setIsCreateDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Announcement created successfully",
    });
  };

  const getAnnouncementIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="h-4 w-4" />;
      case 'update':
        return <Info className="h-4 w-4" />;
      default:
        return <Megaphone className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'low':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <Card className="h-full" data-testid="announcement-panel">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-xl">Announcements</CardTitle>
          <CardDescription>
            {connected ? 'Live updates enabled' : 'Connecting...'}
          </CardDescription>
        </div>
        {userRole === 'organizer' && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" data-testid="button-create-announcement">
                <Plus className="h-4 w-4 mr-2" />
                Create
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Announcement</DialogTitle>
                <DialogDescription>
                  Share important updates with all event participants.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    placeholder="Enter announcement title"
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                    data-testid="input-announcement-title"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Content</label>
                  <Textarea
                    placeholder="Enter announcement content"
                    value={newAnnouncement.content}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                    rows={4}
                    data-testid="textarea-announcement-content"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <Select
                      value={newAnnouncement.type}
                      onValueChange={(value) => setNewAnnouncement({ ...newAnnouncement, type: value as any })}
                    >
                      <SelectTrigger data-testid="select-announcement-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="announcement">Announcement</SelectItem>
                        <SelectItem value="alert">Alert</SelectItem>
                        <SelectItem value="update">Update</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Priority</label>
                    <Select
                      value={newAnnouncement.priority}
                      onValueChange={(value) => setNewAnnouncement({ ...newAnnouncement, priority: value as any })}
                    >
                      <SelectTrigger data-testid="select-announcement-priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  onClick={handleCreateAnnouncement}
                  className="w-full"
                  data-testid="button-submit-announcement"
                >
                  Create Announcement
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[500px] px-6">
          {announcements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Megaphone className="h-12 w-12 mb-4 opacity-50" />
              <p>No announcements yet</p>
              <p className="text-sm">Check back later for updates</p>
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {announcements.map((announcement) => (
                <Card key={announcement.id} className="border-l-4 border-l-primary">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getAnnouncementIcon(announcement.type)}
                        <h4 className="font-medium text-sm">{announcement.title}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getPriorityColor(announcement.priority)} className="text-xs">
                          {announcement.priority}
                        </Badge>
                        <Badge variant="outline" className="text-xs capitalize">
                          {announcement.type}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{announcement.content}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>By {announcement.authorName}</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(announcement.createdAt)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}