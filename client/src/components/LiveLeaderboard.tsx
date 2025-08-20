import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useSocket } from '@/hooks/useSocket';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Trophy, Medal, Award, TrendingUp, TrendingDown, Minus, Lock, RefreshCw, Users, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LeaderboardEntry {
  teamId: string;
  teamName: string;
  submissionId: string;
  projectTitle: string;
  trackId: string;
  trackName: string;
  aggregateScore: number;
  totalScore: number;
  averageScore: number;
  judgesCompleted: number;
  totalJudges: number;
  rank?: number;
  previousRank?: number;
  scoreChange?: number;
}

interface LiveLeaderboardProps {
  eventId: string;
  roundNumber: number;
  userRole: 'participant' | 'organizer' | 'judge';
  authToken?: string;
  limit?: number;
}

export function LiveLeaderboard({ eventId, roundNumber, userRole, authToken, limit = 20 }: LiveLeaderboardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { connected, joinEvent, onAnnouncement } = useSocket(authToken);
  
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const previousDataRef = useRef<Map<string, LeaderboardEntry>>(new Map());
  
  // Fetch leaderboard data
  const { data: leaderboardData, isLoading, refetch } = useQuery({
    queryKey: ['/api/leaderboard', eventId, roundNumber, limit],
    queryFn: async () => {
      const response = await fetch(`/api/leaderboard/${eventId}/round/${roundNumber}?limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch leaderboard');
      return response.json();
    },
    refetchInterval: autoRefresh ? 30000 : false, // Refresh every 30 seconds if auto-refresh is enabled
  });
  
  // Fetch round status
  const { data: roundStatus } = useQuery({
    queryKey: ['/api/leaderboard', eventId, roundNumber, 'status'],
    queryFn: async () => {
      const response = await fetch(`/api/leaderboard/${eventId}/round/${roundNumber}/status`);
      if (!response.ok) throw new Error('Failed to fetch round status');
      return response.json();
    },
  });
  
  // Finalize round mutation
  const finalizeRoundMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/leaderboard/${eventId}/round/${roundNumber}/finalize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to finalize round');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Round Finalized",
        description: `Round ${roundNumber} has been finalized and scores are now locked.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/leaderboard', eventId, roundNumber] });
      setIsFinalizing(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to finalize round. Please try again.",
        variant: "destructive",
      });
      setIsFinalizing(false);
    },
  });
  
  // Socket.IO integration for real-time updates
  useEffect(() => {
    if (!connected || !eventId) return;
    
    joinEvent(eventId);
    
    // Listen for leaderboard updates
    const handleLeaderboardUpdate = (data: any) => {
      if (data.roundNumber === roundNumber) {
        console.log('Leaderboard update received:', data);
        refetch(); // Refresh leaderboard when update is received
        
        toast({
          title: "Score Updated",
          description: `${data.updatedTeam?.teamName || 'A team'}'s score has been updated`,
          variant: "default",
        });
      }
    };
    
    // Listen for round finalization
    const handleRoundFinalized = (data: any) => {
      if (data.roundNumber === roundNumber) {
        queryClient.invalidateQueries({ queryKey: ['/api/leaderboard', eventId, roundNumber] });
        toast({
          title: "Round Finalized",
          description: `Round ${roundNumber} has been finalized by the organizer`,
        });
      }
    };
    
    // Set up Socket.IO listeners
    const socket = (window as any).io?.sockets?.sockets?.get(Array.from((window as any).io?.sockets?.sockets?.keys() || [])[0]);
    if (socket) {
      socket.on('leaderboard-update', handleLeaderboardUpdate);
      socket.on('round-finalized', handleRoundFinalized);
      
      return () => {
        socket.off('leaderboard-update', handleLeaderboardUpdate);
        socket.off('round-finalized', handleRoundFinalized);
      };
    }
  }, [connected, eventId, roundNumber, refetch, toast, queryClient]);
  
  // Calculate rank changes
  useEffect(() => {
    if (leaderboardData?.leaderboard) {
      const currentMap = new Map<string, LeaderboardEntry>(
        leaderboardData.leaderboard.map((entry: LeaderboardEntry) => [entry.teamId, entry])
      );
      
      // Update previous data reference
      previousDataRef.current = currentMap;
    }
  }, [leaderboardData]);
  
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-orange-600" />;
      default:
        return <span className="text-sm font-medium text-muted-foreground">#{rank}</span>;
    }
  };
  
  const getRankChange = (current: LeaderboardEntry) => {
    const previous = previousDataRef.current.get(current.teamId);
    if (!previous || !previous.rank || !current.rank) return null;
    
    const change = previous.rank - current.rank;
    if (change > 0) {
      return (
        <div className="flex items-center text-green-500 text-xs">
          <TrendingUp className="h-3 w-3 mr-1" />
          <span>+{change}</span>
        </div>
      );
    } else if (change < 0) {
      return (
        <div className="flex items-center text-red-500 text-xs">
          <TrendingDown className="h-3 w-3 mr-1" />
          <span>{change}</span>
        </div>
      );
    }
    return (
      <div className="flex items-center text-gray-400 text-xs">
        <Minus className="h-3 w-3" />
      </div>
    );
  };
  
  const getScoreColor = (score: number, maxScore: number = 100) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-green-600 dark:text-green-400';
    if (percentage >= 60) return 'text-yellow-600 dark:text-yellow-400';
    if (percentage >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };
  
  const handleFinalizeRound = () => {
    setIsFinalizing(true);
    finalizeRoundMutation.mutate();
  };
  
  const isFinalized = roundStatus?.isFinalized || false;
  
  return (
    <Card className="h-full" data-testid="live-leaderboard">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              Live Leaderboard - Round {roundNumber}
            </CardTitle>
            <CardDescription className="mt-1">
              {connected ? (
                <span className="text-green-600 dark:text-green-400">● Live updates enabled</span>
              ) : (
                <span className="text-gray-500">○ Connecting...</span>
              )}
              {isFinalized && (
                <Badge variant="secondary" className="ml-2">
                  <Lock className="h-3 w-3 mr-1" />
                  Finalized
                </Badge>
              )}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
              data-testid="button-refresh-leaderboard"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Badge variant="outline">
              <Users className="h-3 w-3 mr-1" />
              {leaderboardData?.totalTeams || 0} Teams
            </Badge>
            {userRole === 'organizer' && !isFinalized && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm" data-testid="button-finalize-round">
                    <Lock className="h-4 w-4 mr-2" />
                    Finalize Round
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Finalize Round {roundNumber}?</DialogTitle>
                    <DialogDescription>
                      This action will lock all scores for this round. Judges will no longer be able to submit or modify scores.
                      This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline">Cancel</Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleFinalizeRound}
                      disabled={isFinalizing}
                      data-testid="button-confirm-finalize"
                    >
                      {isFinalizing ? 'Finalizing...' : 'Finalize Round'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-[600px]">
          <div className="p-6 pt-0">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : leaderboardData?.leaderboard?.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="text-lg">No scores yet</p>
                <p className="text-sm">Scores will appear here as judges submit their evaluations</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                <div className="space-y-3">
                  {leaderboardData?.leaderboard?.map((entry: LeaderboardEntry, index: number) => (
                    <motion.div
                      key={entry.teamId}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card 
                        className={`border-l-4 ${
                          entry.rank === 1 ? 'border-l-yellow-500' :
                          entry.rank === 2 ? 'border-l-gray-400' :
                          entry.rank === 3 ? 'border-l-orange-600' :
                          'border-l-primary'
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                {getRankIcon(entry.rank || index + 1)}
                                {getRankChange(entry)}
                              </div>
                              <div>
                                <h4 className="font-semibold text-sm">{entry.teamName}</h4>
                                <p className="text-xs text-muted-foreground">{entry.projectTitle}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {entry.trackName}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {entry.judgesCompleted}/{entry.totalJudges} judges
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-2xl font-bold ${getScoreColor(entry.aggregateScore)}`}>
                                {entry.aggregateScore.toFixed(2)}
                              </div>
                              <Progress 
                                value={(entry.judgesCompleted / entry.totalJudges) * 100} 
                                className="w-24 h-2 mt-2"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      
      {leaderboardData?.lastUpdated && (
        <div className="px-6 py-3 border-t text-xs text-muted-foreground text-center">
          Last updated: {new Date(leaderboardData.lastUpdated).toLocaleTimeString()}
        </div>
      )}
    </Card>
  );
}