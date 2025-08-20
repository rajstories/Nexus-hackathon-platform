import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Users, Trophy, Zap } from 'lucide-react';
import io from 'socket.io-client';

export default function Home() {
  const router = useRouter();
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  useEffect(() => {
    // Initialize Socket.IO connection
    const socketInstance = io(process.env.NODE_ENV === 'production' 
      ? window.location.origin 
      : 'http://localhost:3000', {
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      console.log('Connected to WebSocket');
      setConnectionStatus('connected');
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from WebSocket');
      setConnectionStatus('disconnected');
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <>
      <Head>
        <title>Fusion X - Hackathon Management Platform</title>
        <meta name="description" content="Comprehensive hackathon management with real-time collaboration" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <div className="container mx-auto px-4 py-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-6xl font-bold text-white mb-4">
              Fusion X
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Next-Generation Hackathon Management Platform
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                size="lg"
                onClick={() => router.push('/dashboard')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Get Started
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => router.push('/auth')}
                className="text-white border-white hover:bg-white hover:text-gray-900"
              >
                Sign In
              </Button>
            </div>
            <div className="mt-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                connectionStatus === 'connected' 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                <span className={`w-2 h-2 rounded-full mr-2 ${
                  connectionStatus === 'connected' ? 'bg-green-400' : 'bg-red-400'
                }`} />
                WebSocket {connectionStatus}
              </span>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardHeader>
                <CalendarDays className="w-10 h-10 text-blue-400 mb-2" />
                <CardTitle className="text-white">Event Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300">
                  Create and manage hackathon events with tracks, schedules, and registration.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardHeader>
                <Users className="w-10 h-10 text-green-400 mb-2" />
                <CardTitle className="text-white">Team Collaboration</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300">
                  Form teams, share invite codes, and collaborate in real-time.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardHeader>
                <Trophy className="w-10 h-10 text-yellow-400 mb-2" />
                <CardTitle className="text-white">Multi-Round Judging</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300">
                  Comprehensive evaluation system with weighted scoring and live updates.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardHeader>
                <Zap className="w-10 h-10 text-purple-400 mb-2" />
                <CardTitle className="text-white">Real-Time Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300">
                  Live announcements, chat, and leaderboard powered by WebSockets.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Stats Section */}
          <div className="mt-16 text-center">
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div>
                <div className="text-4xl font-bold text-white">10K+</div>
                <div className="text-gray-400">Participants</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white">500+</div>
                <div className="text-gray-400">Events</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white">99.9%</div>
                <div className="text-gray-400">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}