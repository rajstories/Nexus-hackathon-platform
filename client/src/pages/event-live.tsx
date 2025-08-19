import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnnouncementPanel } from '@/components/AnnouncementPanel';
import { ChatPanel } from '@/components/ChatPanel';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'wouter';
import { ArrowLeft, Wifi, WifiOff, Users, Calendar, Clock } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  mode: string;
}

export function EventLivePage() {
  const { eventId } = useParams<{ eventId: string }>();
  const [userRole] = useState<'participant' | 'organizer' | 'judge'>('participant'); // Mock role
  const [userName] = useState('Test User'); // Mock user name
  const [authToken] = useState('test-user1-token'); // Mock auth token
  
  // Mock event data for demo (would normally come from API)
  const mockEvent: Event = {
    id: eventId || 'demo-event',
    title: 'Fusion X Demo Hackathon',
    description: 'A demonstration of real-time announcements and Q&A system',
    startAt: '2025-08-20T10:00:00Z',
    mode: 'hybrid'
  };

  const formatEventTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEventStatus = () => {
    const now = new Date();
    const startTime = new Date(mockEvent.startAt);
    
    if (now < startTime) {
      return { status: 'upcoming', color: 'secondary', text: 'Upcoming' };
    }
    return { status: 'live', color: 'default', text: 'Live' };
  };

  const eventStatus = getEventStatus();

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" data-testid="button-back-to-dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold" data-testid="text-event-title">
                  {mockEvent.title}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {mockEvent.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={eventStatus.color as any} className="flex items-center gap-1">
                <div className="h-2 w-2 bg-current rounded-full animate-pulse" />
                {eventStatus.text}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {mockEvent.mode}
              </Badge>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Started: {formatEventTime(mockEvent.startAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Role: {userRole}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full" />
              <span>Real-time enabled</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
          {/* Announcements Panel */}
          <div className="h-full">
            <AnnouncementPanel
              eventId={mockEvent.id}
              userRole={userRole}
              authToken={authToken}
            />
          </div>

          {/* Chat Panel */}
          <div className="h-full">
            <ChatPanel
              eventId={mockEvent.id}
              userRole={userRole}
              userName={userName}
              authToken={authToken}
            />
          </div>
        </div>

        {/* Demo Instructions */}
        <Card className="mt-6" data-testid="demo-instructions">
          <CardHeader>
            <CardTitle className="text-lg">Real-time Demo Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-sm mb-2">Testing Real-time Features:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Open this page in multiple browser tabs/windows</li>
                  <li>• Send messages or announcements in one tab</li>
                  <li>• See them appear instantly in other tabs without refresh</li>
                  <li>• Try different message types: questions, answers, general</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-sm mb-2">Role Simulation:</h4>
                <div className="flex gap-2">
                  <Badge variant="outline">Participant (Current)</Badge>
                  <Badge variant="secondary">Can send questions and general messages</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Change to organizer role to create announcements and see admin features
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-sm mb-2">Socket.IO Status:</h4>
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Connected to real-time server</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}