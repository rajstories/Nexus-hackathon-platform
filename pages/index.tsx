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
        <nav className="bg-slate-900/90 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-2">
                <Code className="h-8 w-8 text-blue-400" />
                <h1 className="text-2xl font-bold text-white">
                  Fusion<span className="text-blue-400">X</span>
                </h1>
              </div>
              <div className="hidden md:flex items-center space-x-8 text-slate-300">
                <a href="#features" className="hover:text-white transition-colors">Features</a>
                <a href="#tech" className="hover:text-white transition-colors">Technology</a>
                <a href="#demo" className="hover:text-white transition-colors">Demo</a>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/auth">
                  <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white" data-testid="button-start-demo">
                    <Rocket className="h-4 w-4 mr-2" />
                    Start Live Demo
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 sm:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="mb-6">
                <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 text-sm font-medium">
                  🏆 Competition-Winning Platform
                </Badge>
              </div>
              <h1 className="text-5xl sm:text-7xl font-bold text-white mb-6">
                Fusion<span className="text-blue-400">X</span>
              </h1>
              <p className="text-2xl text-slate-300 mb-4 max-w-4xl mx-auto">
                Advanced Hackathon Platform
              </p>
              <p className="text-lg text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed">
                Host and participate in hackathons with Web3 badges, AI sentiment analysis, real-time collaboration, 
                and enterprise-grade performance. Built for modern teams.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link href="/auth">
                  <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 text-lg" data-testid="button-demo-primary">
                    <Zap className="mr-2 h-5 w-5" />
                    Start Live Demo
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button size="lg" className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-4 text-lg" data-testid="button-quick-start">
                    <Rocket className="mr-2 h-5 w-5" />
                    Quick Start
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="border-slate-600 text-slate-300 hover:bg-slate-800 px-8 py-4 text-lg" data-testid="button-view-demo">
                  ▶ View Demo
                </Button>
              </div>
              
              {/* Terminal Demo */}
              <div className="max-w-3xl mx-auto">
                <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 bg-slate-900 border-b border-slate-700">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <span className="text-slate-400 text-sm ml-2">Terminal</span>
                  </div>
                  <div className="p-6 font-mono text-sm">
                    <div className="text-green-400">$ npm run dev</div>
                    <div className="text-pink-400 mt-2">🚀 React running on http://localhost:5000</div>
                    <div className="text-yellow-400">⚡ API server running on http://localhost:8000</div>
                    <div className="text-green-400 mt-2">✅ Both apps healthy and ready!</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why FusionX Section */}
        <section id="features" className="py-20 bg-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                Why <span className="text-blue-400">FusionX</span>?
              </h2>
              <p className="text-lg text-slate-400 max-w-3xl mx-auto">
                Everything you need to host successful hackathons with cutting-edge features and modern innovation.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="bg-slate-900 border-slate-700 hover:border-slate-600 transition-all hover:shadow-xl" data-testid={`card-feature-${index}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {feature.icon}
                        <div>
                          <CardTitle className="text-lg text-white">{feature.title}</CardTitle>
                          <Badge className="mt-1 text-xs" variant="secondary">{feature.badge}</Badge>
                        </div>
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

        {/* Project Structure */}
        <section id="tech" className="py-20 bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                Project Structure
              </h2>
              <p className="text-lg text-slate-400 max-w-3xl mx-auto">
                Clean, organized, and scalable architecture designed for modern development teams.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-900 border-b border-slate-700">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <span className="text-slate-400 text-sm ml-2">fusion-x/</span>
                </div>
                <div className="p-6 font-mono text-sm space-y-1">
                  <div className="text-blue-400">pages/</div>
                  <div className="text-slate-400 ml-4"># Next.js pages</div>
                  <div className="text-blue-400">server/</div>
                  <div className="text-slate-400 ml-4"># Express API</div>
                  <div className="text-blue-400">shared/</div>
                  <div className="text-slate-400 ml-4"># Shared types & schemas</div>
                  <div className="text-slate-300">package.json</div>
                  <div className="text-slate-300">tsconfig.json</div>
                  <div className="text-slate-300">README.md</div>
                </div>
              </div>
              
              <div className="space-y-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Code className="h-6 w-6 text-blue-400" />
                      <CardTitle className="text-white">Web Application</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-400">Next.js with TypeScript, TailwindCSS, shadcn/ui components, and advanced animations.</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded bg-green-500 flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-sm"></div>
                      </div>
                      <CardTitle className="text-white">API Server</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-400">Express server with TypeScript and production builds.</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded bg-orange-500 flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                      <CardTitle className="text-white">Shared Types</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-400">Common TypeScript interfaces, DTOs, and Zod schemas used across frontend and backend.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Get Started Section */}
        <section id="demo" className="py-20 bg-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                Get Started in Minutes
              </h2>
              <p className="text-lg text-slate-400 max-w-3xl mx-auto">
                Three simple steps to have your hackathon platform up and running.
              </p>
            </div>

            <div className="space-y-12">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                    1
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Clone & Install</h3>
                    <p className="text-slate-400">Get the complete platform with all advanced features included.</p>
                  </div>
                </div>
                <div className="bg-slate-900 rounded-lg border border-slate-700 p-4 font-mono text-sm">
                  <div className="text-green-400">$ git clone https://github.com/your-org/fusion-x.git</div>
                  <div className="text-green-400">$ cd fusion-x</div>
                  <div className="text-green-400">$ npm install</div>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                    2
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Start Development</h3>
                    <p className="text-slate-400">Launch the full-stack application with hot reload and live features.</p>
                  </div>
                </div>
                <div className="bg-slate-900 rounded-lg border border-slate-700 p-4 font-mono text-sm">
                  <div className="text-green-400">$ npm run dev</div>
                  <div className="text-pink-400 mt-2">🚀 React running on http://localhost:5000</div>
                  <div className="text-yellow-400">⚡ API server running on http://localhost:8000</div>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                    3
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Build & Deploy</h3>
                    <p className="text-slate-400">Deploy to Azure with automated CI/CD and enterprise scaling.</p>
                  </div>
                </div>
                <div className="bg-slate-900 rounded-lg border border-slate-700 p-4 font-mono text-sm">
                  <div className="text-green-400">$ npm run build</div>
                  <div className="text-green-400">$ npm run start</div>
                </div>
              </div>
            </div>

            <div className="text-center mt-16">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth">
                  <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 text-lg" data-testid="button-final-demo">
                    <Zap className="mr-2 h-5 w-5" />
                    Start Live Demo
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button size="lg" className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-4 text-lg" data-testid="button-final-start">
                    <Rocket className="mr-2 h-5 w-5" />
                    Quick Start
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-900 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Code className="h-8 w-8 text-blue-400" />
                <h3 className="text-2xl font-bold text-white">
                  Fusion<span className="text-blue-400">X</span>
                </h3>
              </div>
              <p className="text-slate-400 mb-8">Advanced Hackathon Platform with Web3, AI, and Enterprise Features</p>
              <div className="flex justify-center space-x-8 mb-8">
                <a href="#features" className="text-slate-400 hover:text-white transition-colors">Features</a>
                <a href="#tech" className="text-slate-400 hover:text-white transition-colors">Technology</a>
                <a href="#demo" className="text-slate-400 hover:text-white transition-colors">Get Started</a>
                <Link href="/auth" className="text-slate-400 hover:text-white transition-colors">Demo</Link>
              </div>
              <div className="pt-8 border-t border-slate-800">
                <p className="text-slate-500 text-sm">
                  © 2024 FusionX. Competition-grade hackathon platform with cutting-edge innovation.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}