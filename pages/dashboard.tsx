import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Trophy, Calendar, TrendingUp, Award, Brain, MessageCircle, Shield, BarChart3, Rocket, Zap, Settings, LogOut, Home } from 'lucide-react';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalParticipants: 1247,
    activeEvents: 8,
    totalSubmissions: 342,
    averageScore: 87,
  });
  
  const [quickStats] = useState({
    nftBadges: 156,
    aiAnalysisScore: 94,
    achievements: 23,
    serverHealth: 99.9,
  });

  useEffect(() => {
    // Load user from session storage (demo)
    const savedUser = sessionStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    // Simulate real-time stats updates
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        totalParticipants: prev.totalParticipants + Math.floor(Math.random() * 3),
        totalSubmissions: prev.totalSubmissions + Math.floor(Math.random() * 2),
      }));
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <>
      <Head>
        <title>Dashboard - Fusion X</title>
        <meta name="description" content="Advanced hackathon platform dashboard" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
        {/* Top Navigation */}
        <nav className="bg-slate-900/90 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-4">
                <Link href="/" className="flex items-center gap-2">
                  <Home className="h-6 w-6 text-blue-400" />
                  <span className="text-2xl font-bold text-white">
                    Fusion<span className="text-blue-400">X</span>
                  </span>
                </Link>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  ✅ Live Demo Active
                </Badge>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-slate-300">Welcome, {user?.displayName || 'Demo User'}</span>
                <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                <Button onClick={handleLogout} variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Platform Dashboard</h1>
            <p className="text-slate-400 text-lg">Advanced hackathon management with cutting-edge features</p>
          </div>

          {/* Advanced Features Overview */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Web3 NFT Badges</CardTitle>
                <Award className="h-5 w-5 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{quickStats.nftBadges}</div>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  Blockchain verified
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">AI Sentiment Score</CardTitle>
                <Brain className="h-5 w-5 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{quickStats.aiAnalysisScore}%</div>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  Community health excellent
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Achievements Earned</CardTitle>
                <Trophy className="h-5 w-5 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{quickStats.achievements}</div>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  Gamification active
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">System Health</CardTitle>
                <BarChart3 className="h-5 w-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{quickStats.serverHealth}%</div>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  1000+ users supported
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Platform Stats */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-slate-800/30 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Total Participants</CardTitle>
                <Users className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.totalParticipants.toLocaleString()}</div>
                <p className="text-xs text-green-400">
                  +{Math.floor(Math.random() * 5) + 15} new today
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/30 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Active Events</CardTitle>
                <Calendar className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.activeEvents}</div>
                <p className="text-xs text-blue-400">
                  3 ending this week
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/30 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Total Submissions</CardTitle>
                <Trophy className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.totalSubmissions}</div>
                <p className="text-xs text-purple-400">
                  +{Math.floor(Math.random() * 8) + 2} in last hour
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/30 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Average Score</CardTitle>
                <TrendingUp className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.averageScore}%</div>
                <p className="text-xs text-yellow-400">
                  +2.3% from last event
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Feature Showcase */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Rocket className="h-6 w-6 text-blue-400" />
                  <CardTitle className="text-white">Advanced Features</CardTitle>
                </div>
                <CardDescription className="text-slate-400">
                  Competition-winning capabilities powered by Web3, AI, and modern tech
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Award className="h-5 w-5 text-yellow-500" />
                    <span className="text-white font-medium">Web3 NFT Badges</span>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400">ACTIVE</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Brain className="h-5 w-5 text-purple-500" />
                    <span className="text-white font-medium">AI Sentiment Analysis</span>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400">MONITORING</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Trophy className="h-5 w-5 text-orange-500" />
                    <span className="text-white font-medium">Gamification System</span>
                  </div>
                  <Badge className="bg-blue-500/20 text-blue-400">15+ ACHIEVEMENTS</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-blue-500" />
                    <span className="text-white font-medium">Enterprise Security</span>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400">PROTECTED</Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Zap className="h-6 w-6 text-yellow-400" />
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                </div>
                <CardDescription className="text-slate-400">
                  Essential platform operations and management tools
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white" data-testid="button-create-event">
                    <Calendar className="h-4 w-4 mr-2" />
                    Create Event
                  </Button>
                  <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700" data-testid="button-view-submissions">
                    <Trophy className="h-4 w-4 mr-2" />
                    Submissions
                  </Button>
                  <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700" data-testid="button-manage-teams">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Teams
                  </Button>
                  <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700" data-testid="button-live-chat">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Live Chat
                  </Button>
                </div>
                <div className="pt-4 border-t border-slate-700">
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white" data-testid="button-web3-dashboard">
                    <Award className="h-4 w-4 mr-2" />
                    Web3 Badge Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Live Status */}
          <Card className="bg-gradient-to-r from-slate-800/50 to-blue-900/30 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
                    Platform Status
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Real-time system monitoring and performance metrics
                  </CardDescription>
                </div>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  ALL SYSTEMS OPERATIONAL
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">99.9%</div>
                  <div className="text-slate-400 text-sm">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">1000+</div>
                  <div className="text-slate-400 text-sm">Concurrent Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">&lt;50ms</div>
                  <div className="text-slate-400 text-sm">Response Time</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}