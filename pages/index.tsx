import Link from 'next/link';
import Head from 'next/head';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Users, Trophy, Calendar, Code, Zap, Globe, Rocket, Brain, Award, Shield, BarChart3, MessageCircle } from 'lucide-react';

export default function Home() {
  const features = [
    {
      title: "🏅 Web3 & NFT Badges",
      description: "Blockchain-verified proof of participation with dynamic NFT generation and IPFS storage.",
      icon: <Award className="h-8 w-8 text-yellow-500" />,
      badge: "INNOVATION",
    },
    {
      title: "🧠 AI Sentiment Analysis", 
      description: "Advanced AI-powered community monitoring with toxicity detection and emotion recognition.",
      icon: <Brain className="h-8 w-8 text-purple-500" />,
      badge: "AI-POWERED",
    },
    {
      title: "🏆 Gamification System",
      description: "15+ achievements, level progression, and community leaderboards to boost engagement.",
      icon: <Trophy className="h-8 w-8 text-orange-500" />,
      badge: "ENGAGEMENT",
    },
    {
      title: "⚡ Performance Monitoring",
      description: "Real-time system health with 1000+ user capacity and Azure auto-scaling.",
      icon: <BarChart3 className="h-8 w-8 text-green-500" />,
      badge: "SCALABLE",
    },
    {
      title: "🔒 Enterprise Security",
      description: "Rate limiting, input sanitization, and comprehensive protection for production use.",
      icon: <Shield className="h-8 w-8 text-blue-500" />,
      badge: "SECURE",
    },
    {
      title: "💬 Real-time Communication",
      description: "WebSocket-powered live chat, announcements, and collaborative features.",
      icon: <MessageCircle className="h-8 w-8 text-indigo-500" />,
      badge: "LIVE",
    },
  ];

  return (
    <>
      <Head>
        <title>Fusion X - Advanced Hackathon Platform</title>
        <meta name="description" content="Next-generation hackathon platform with Web3, AI, and real-time features" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
        {/* Navigation */}
        <nav className="w-full py-6">
          <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-white">
                Fusion<span className="text-orange-400">X</span>
                <div className="text-xs text-slate-400 mt-1">by Advanced Platform</div>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-8 text-slate-300">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#tech" className="hover:text-white transition-colors">Technology</a>
              <a href="#about" className="hover:text-white transition-colors">About</a>
              <a href="#demo" className="hover:text-white transition-colors">Demo</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div>
              <Link href="/auth">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full font-medium" data-testid="button-register">
                  Register
                </Button>
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <h2 className="text-4xl md:text-5xl font-light text-white leading-tight">
                    Learn, Build, Innovate
                  </h2>
                  <h1 className="text-6xl md:text-7xl font-bold leading-tight">
                    <span className="text-transparent bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500 bg-clip-text">
                      FusionX
                    </span>
                  </h1>
                  <p className="text-xl md:text-2xl text-slate-300 font-light">
                    Next-Gen Web3 & AI Hackathon Platform
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <Link href="/auth">
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full text-lg font-medium" data-testid="button-register-now">
                      Register Now
                    </Button>
                  </Link>
                  <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 px-8 py-3 rounded-full text-lg" data-testid="button-view-features">
                    View Features
                  </Button>
                </div>
              </div>
              
              {/* Right 3D Illustration */}
              <div className="relative flex items-center justify-center">
                <div className="relative w-full max-w-lg">
                  {/* Main Monitor */}
                  <div className="relative transform rotate-12 hover:rotate-6 transition-transform duration-300">
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border-4 border-orange-400/30 p-6 shadow-2xl">
                      <div className="bg-slate-900 rounded h-48 border border-slate-700 flex items-center justify-center">
                        <div className="text-6xl font-bold text-orange-400">FX</div>
                      </div>
                      <div className="mt-4 h-2 bg-slate-700 rounded"></div>
                      <div className="mt-2 flex gap-2">
                        <div className="h-1 bg-orange-400 rounded flex-1"></div>
                        <div className="h-1 bg-slate-700 rounded flex-1"></div>
                        <div className="h-1 bg-slate-700 rounded flex-1"></div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-500 to-yellow-500 h-4 rounded-b-lg mx-4"></div>
                    <div className="bg-slate-800 h-6 w-16 mx-auto rounded-b-lg"></div>
                  </div>
                  
                  {/* Floating Icons */}
                  <div className="absolute -top-8 -left-8 transform hover:scale-110 transition-transform">
                    <div className="bg-gradient-to-br from-blue-500 to-purple-500 w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg">
                      🏆
                    </div>
                  </div>
                  
                  <div className="absolute top-16 -right-12 transform hover:scale-110 transition-transform">
                    <div className="bg-gradient-to-br from-green-500 to-emerald-500 w-14 h-14 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                      ⚡
                    </div>
                  </div>
                  
                  <div className="absolute -bottom-4 -left-12 transform hover:scale-110 transition-transform">
                    <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg shadow-lg">
                      🧠
                    </div>
                  </div>
                  
                  <div className="absolute bottom-20 -right-8 transform hover:scale-110 transition-transform">
                    <div className="bg-gradient-to-br from-yellow-500 to-orange-500 w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm shadow-lg">
                      🔒
                    </div>
                  </div>
                  
                  {/* Geometric Shapes */}
                  <div className="absolute top-1/2 -left-16 w-8 h-8 bg-orange-400/20 rounded-full animate-pulse"></div>
                  <div className="absolute top-1/4 right-0 w-6 h-6 bg-blue-400/20 rotate-45 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom Preview/Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <div className="w-3 h-3 bg-orange-400 rounded-full animate-bounce"></div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-slate-800/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Why <span className="text-orange-400">FusionX</span>?
              </h2>
              <p className="text-xl text-slate-400 max-w-3xl mx-auto">
                Everything you need to host successful hackathons with cutting-edge innovation.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="bg-slate-900/50 border-slate-700 hover:border-orange-400/50 transition-all hover:shadow-xl hover:scale-105" data-testid={`card-feature-${index}`}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      {feature.icon}
                      <div>
                        <CardTitle className="text-lg text-white">{feature.title}</CardTitle>
                        <Badge className="mt-1 text-xs bg-orange-500/20 text-orange-400 border-orange-500/30">{feature.badge}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-slate-400 leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Technology Stack */}
        <section id="tech" className="py-24 bg-slate-900">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Advanced Technology Stack
              </h2>
              <p className="text-xl text-slate-400 max-w-3xl mx-auto">
                Built with cutting-edge technologies for enterprise-grade performance.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {[
                { name: "Web3 & NFTs", desc: "Blockchain Integration", icon: "🔗", color: "from-yellow-400 to-orange-500" },
                { name: "AI Analysis", desc: "Smart Monitoring", icon: "🧠", color: "from-purple-400 to-pink-500" },
                { name: "Real-time", desc: "WebSocket Power", icon: "⚡", color: "from-blue-400 to-cyan-500" },
                { name: "Enterprise", desc: "Production Ready", icon: "🏢", color: "from-green-400 to-emerald-500" },
              ].map((tech, index) => (
                <Card key={index} className="bg-slate-800/50 border-slate-700 hover:border-orange-400/50 transition-all text-center">
                  <CardContent className="pt-6">
                    <div className={`text-4xl mb-4 p-4 rounded-full bg-gradient-to-r ${tech.color} w-fit mx-auto`}>
                      {tech.icon}
                    </div>
                    <div className="text-lg font-semibold text-white mb-2">
                      {tech.name}
                    </div>
                    <div className="text-sm text-slate-400">
                      {tech.desc}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="demo" className="py-24 bg-gradient-to-r from-orange-600/20 via-yellow-600/20 to-orange-600/20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Build the Future?
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Join thousands of innovators using FusionX to create amazing hackathon experiences with Web3, AI, and cutting-edge technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-12 py-4 text-lg font-semibold rounded-full" data-testid="button-start-building">
                  Start Building Now
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-slate-900 px-12 py-4 text-lg font-semibold rounded-full" data-testid="button-learn-more">
                Learn More
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-950 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="text-center">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white">
                  Fusion<span className="text-orange-400">X</span>
                  <div className="text-xs text-slate-400 mt-1">by Advanced Platform</div>
                </h3>
              </div>
              <p className="text-slate-400 mb-8">Next-Gen Web3 & AI Hackathon Platform with Enterprise Features</p>
              <div className="flex flex-wrap justify-center gap-8 mb-8 text-sm">
                <a href="#features" className="text-slate-400 hover:text-orange-400 transition-colors">Features</a>
                <a href="#tech" className="text-slate-400 hover:text-orange-400 transition-colors">Technology</a>
                <a href="#about" className="text-slate-400 hover:text-orange-400 transition-colors">About</a>
                <Link href="/auth" className="text-slate-400 hover:text-orange-400 transition-colors">Demo</Link>
                <a href="#contact" className="text-slate-400 hover:text-orange-400 transition-colors">Contact</a>
              </div>
              <div className="pt-8 border-t border-slate-800">
                <p className="text-slate-500 text-sm">
                  © 2024 FusionX. Empowering innovation through advanced hackathon technology.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}