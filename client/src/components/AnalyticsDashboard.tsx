import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Users, 
  FileText, 
  Trophy,
  MessageSquare,
  Activity
} from 'lucide-react';
import axios from 'axios';

interface AnalyticsData {
  registrations: Array<{ date: string; count: number }>;
  teams: {
    total: number;
    withSubmissions: number;
    submissionRate: number;
  };
  submissionsPerTrack: Array<{ track: string; count: number }>;
  avgScorePerTrack: Array<{ track: string; avgScore: number; evaluated: number }>;
  chatVolume: {
    announcements: number;
    messages: number;
    total: number;
  };
}

interface AnalyticsDashboardProps {
  eventId: string;
}

export function AnalyticsDashboard({ eventId }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [responseTime, setResponseTime] = useState(0);

  useEffect(() => {
    fetchAnalytics();
  }, [eventId]);

  const fetchAnalytics = async () => {
    try {
      const startTime = Date.now();
      const response = await axios.get(`/api/analytics/${eventId}`);
      setResponseTime(Date.now() - startTime);
      setAnalytics(response.data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-gray-100 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!analytics) return null;

  // Calculate max values for scaling
  const maxRegistrations = Math.max(...analytics.registrations.map(r => r.count), 1);
  const maxSubmissions = Math.max(...analytics.submissionsPerTrack.map(s => s.count), 1);
  const maxScore = Math.max(...analytics.avgScorePerTrack.map(s => s.avgScore), 100);

  return (
    <div className="space-y-6">
      {/* Performance Badge */}
      <div className="flex justify-end">
        <Badge variant={responseTime < 200 ? "default" : "destructive"}>
          <Activity className="w-3 h-3 mr-1" />
          Response: {responseTime}ms
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Registrations Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Registrations (Last 7 Days)
            </CardTitle>
            <CardDescription>Daily team registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.registrations.map((day, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-12">{day.date}</span>
                  <div className="flex-1 relative h-6 bg-gray-100 rounded overflow-hidden">
                    <div 
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded transition-all duration-500"
                      style={{ 
                        width: `${(day.count / maxRegistrations) * 100}%`,
                        animationDelay: `${idx * 50}ms`
                      }}
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium">
                      {day.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Teams</span>
                <span className="font-semibold">{analytics.teams.total}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-muted-foreground">With Submissions</span>
                <Badge variant="secondary">{analytics.teams.submissionRate}%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submissions Per Track */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-500" />
              Submissions by Track
            </CardTitle>
            <CardDescription>Project distribution across tracks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.submissionsPerTrack.slice(0, 5).map((track, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-20 truncate" title={track.track}>
                    {track.track}
                  </span>
                  <div className="flex-1 relative h-6 bg-gray-100 rounded overflow-hidden">
                    <div 
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-400 to-green-600 rounded transition-all duration-500"
                      style={{ 
                        width: `${(track.count / maxSubmissions) * 100}%`,
                        animationDelay: `${idx * 50}ms`
                      }}
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium">
                      {track.count}
                    </span>
                  </div>
                </div>
              ))}
              {analytics.submissionsPerTrack.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No submissions yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Average Score Per Track */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Average Scores by Track
            </CardTitle>
            <CardDescription>Evaluation scores across tracks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.avgScorePerTrack.slice(0, 5).map((track, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-20 truncate" title={track.track}>
                    {track.track}
                  </span>
                  <div className="flex-1 relative h-6 bg-gray-100 rounded overflow-hidden">
                    <div 
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-yellow-400 to-amber-600 rounded transition-all duration-500"
                      style={{ 
                        width: `${(track.avgScore / maxScore) * 100}%`,
                        animationDelay: `${idx * 50}ms`
                      }}
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium">
                      {track.avgScore.toFixed(1)} ({track.evaluated})
                    </span>
                  </div>
                </div>
              ))}
              {analytics.avgScorePerTrack.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No evaluations yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chat Volume */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-500" />
              Communication Activity
            </CardTitle>
            <CardDescription>Announcements and Q&A messages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {analytics.chatVolume.announcements}
                  </div>
                  <p className="text-xs text-muted-foreground">Announcements</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {analytics.chatVolume.messages}
                  </div>
                  <p className="text-xs text-muted-foreground">Messages</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {analytics.chatVolume.total}
                  </div>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
              
              {/* Visual representation */}
              <div className="relative h-8 bg-gray-100 rounded overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-400 to-purple-600 rounded"
                  style={{ 
                    width: analytics.chatVolume.total > 0 ? '100%' : '0%'
                  }}
                >
                  <div className="h-full flex items-center justify-center text-white text-xs font-medium">
                    {analytics.chatVolume.total > 0 && `${analytics.chatVolume.total} total interactions`}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}