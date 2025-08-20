import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { SponsorsShowcase } from "@/components/SponsorsShowcase";
import { LiveDemoButton } from "@/components/demo/LiveDemoButton";
import { 
  Award,
  Brain,
  Trophy,
  Shield,
  BarChart3,
  MessageCircle,
  Rocket, 
  Play, 
  Github, 
  Book,
  Zap,
  WandSparkles
} from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: "easeOut" }
};

const fadeInLeft = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.8, ease: "easeOut" }
};

const fadeInRight = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.8, ease: "easeOut" }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const pulseAnimation = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 3,
      ease: "easeInOut",
      repeat: Infinity
    }
  }
};

export default function Home() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
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
            {user ? (
              <Button onClick={() => setLocation('/dashboard')} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full font-medium">
                Dashboard
              </Button>
            ) : (
              <Button onClick={() => setLocation('/auth')} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full font-medium">
                Register
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div 
              {...fadeInLeft}
              className="space-y-8"
            >
              <div className="space-y-4">
                <motion.h2 
                  {...fadeInUp}
                  className="text-4xl md:text-5xl font-light text-white leading-tight"
                >
                  Learn, Build, Innovate
                </motion.h2>
                <motion.h1 
                  {...fadeInUp}
                  className="text-6xl md:text-7xl font-bold leading-tight"
                >
                  <span className="text-transparent bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500 bg-clip-text">
                    FusionX
                  </span>
                </motion.h1>
                <motion.p 
                  {...fadeInUp}
                  className="text-xl md:text-2xl text-slate-300 font-light"
                >
                  Next-Gen Web3 & AI Hackathon Platform
                </motion.p>
              </div>
              
              <motion.div 
                {...fadeInUp}
                className="flex flex-wrap gap-4"
              >
                <Button 
                  onClick={() => setLocation('/auth')}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full text-lg font-medium"
                >
                  Register Now
                </Button>
                <Button 
                  variant="outline" 
                  className="border-slate-600 text-slate-300 hover:bg-slate-800 px-8 py-3 rounded-full text-lg"
                >
                  View Features
                </Button>
              </motion.div>
            </motion.div>
            
            {/* Right 3D Illustration */}
            <motion.div 
              {...fadeInRight}
              className="relative flex items-center justify-center"
            >
              <div className="relative w-full max-w-lg">
                {/* Main Monitor */}
                <motion.div 
                  {...pulseAnimation}
                  className="relative transform rotate-12 hover:rotate-6 transition-transform duration-300"
                >
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
                </motion.div>
                
                {/* Floating Icons */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="absolute -top-8 -left-8 transform hover:scale-110 transition-transform"
                >
                  <div className="bg-gradient-to-br from-blue-500 to-purple-500 w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg">
                    🏆
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  className="absolute top-16 -right-12 transform hover:scale-110 transition-transform"
                >
                  <div className="bg-gradient-to-br from-green-500 to-emerald-500 w-14 h-14 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                    ⚡
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9, duration: 0.5 }}
                  className="absolute -bottom-4 -left-12 transform hover:scale-110 transition-transform"
                >
                  <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg shadow-lg">
                    🧠
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.1, duration: 0.5 }}
                  className="absolute bottom-20 -right-8 transform hover:scale-110 transition-transform"
                >
                  <div className="bg-gradient-to-br from-yellow-500 to-orange-500 w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm shadow-lg">
                    🔒
                  </div>
                </motion.div>
                
                {/* Geometric Shapes */}
                <div className="absolute top-1/2 -left-16 w-8 h-8 bg-orange-400/20 rounded-full animate-pulse"></div>
                <div className="absolute top-1/4 right-0 w-6 h-6 bg-blue-400/20 rotate-45 animate-pulse"></div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Bottom Preview/Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-3 h-3 bg-orange-400 rounded-full animate-bounce"></div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Why <span className="text-orange-400">FusionX</span>?
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Everything you need to host successful hackathons with cutting-edge innovation.
            </p>
          </motion.div>

          <motion.div 
            {...staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              {
                icon: <Award className="h-8 w-8 text-yellow-500" />,
                title: "🏅 Web3 & NFT Badges",
                description: "Blockchain-verified proof of participation with dynamic NFT generation and IPFS storage.",
                badge: "INNOVATION"
              },
              {
                icon: <Brain className="h-8 w-8 text-purple-500" />,
                title: "🧠 AI Sentiment Analysis",
                description: "Advanced AI-powered community monitoring with toxicity detection and emotion recognition.",
                badge: "AI-POWERED"
              },
              {
                icon: <Trophy className="h-8 w-8 text-orange-500" />,
                title: "🏆 Gamification System",
                description: "15+ achievements, level progression, and community leaderboards to boost engagement.",
                badge: "ENGAGEMENT"
              },
              {
                icon: <BarChart3 className="h-8 w-8 text-green-500" />,
                title: "⚡ Performance Monitoring",
                description: "Real-time system health with 1000+ user capacity and Azure auto-scaling.",
                badge: "SCALABLE"
              },
              {
                icon: <Shield className="h-8 w-8 text-blue-500" />,
                title: "🔒 Enterprise Security",
                description: "Rate limiting, input sanitization, and comprehensive protection for production use.",
                badge: "SECURE"
              },
              {
                icon: <MessageCircle className="h-8 w-8 text-indigo-500" />,
                title: "💬 Real-time Communication",
                description: "WebSocket-powered live chat, announcements, and collaborative features.",
                badge: "LIVE"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                {...fadeInUp}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-slate-900/50 border-slate-700 hover:border-orange-400/50 transition-all hover:shadow-xl hover:scale-105 h-full">
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      {feature.icon}
                      <div>
                        <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30 mt-1">
                          {feature.badge}
                        </span>
                      </div>
                    </div>
                    <p className="text-slate-400 leading-relaxed">{feature.description}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Technology Stack */}
      <section id="tech" className="py-24 bg-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Advanced Technology Stack
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Built with cutting-edge technologies for enterprise-grade performance.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {[
              { name: "Web3 & NFTs", desc: "Blockchain Integration", icon: "🔗", color: "from-yellow-400 to-orange-500" },
              { name: "AI Analysis", desc: "Smart Monitoring", icon: "🧠", color: "from-purple-400 to-pink-500" },
              { name: "Real-time", desc: "WebSocket Power", icon: "⚡", color: "from-blue-400 to-cyan-500" },
              { name: "Enterprise", desc: "Production Ready", icon: "🏢", color: "from-green-400 to-emerald-500" },
            ].map((tech, index) => (
              <Card key={index} className="bg-slate-800/50 border-slate-700 hover:border-orange-400/50 transition-all text-center">
                <div className="pt-6 pb-6 px-4">
                  <div className={`text-4xl mb-4 p-4 rounded-full bg-gradient-to-r ${tech.color} w-fit mx-auto`}>
                    {tech.icon}
                  </div>
                  <div className="text-lg font-semibold text-white mb-2">
                    {tech.name}
                  </div>
                  <div className="text-sm text-slate-400">
                    {tech.desc}
                  </div>
                </div>
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
            <Button 
              onClick={() => setLocation('/auth')}
              size="lg" 
              className="bg-orange-500 hover:bg-orange-600 text-white px-12 py-4 text-lg font-semibold rounded-full"
            >
              Start Building Now
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-slate-900 px-12 py-4 text-lg font-semibold rounded-full"
            >
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
              <a href="#demo" className="text-slate-400 hover:text-orange-400 transition-colors">Demo</a>
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
  );
}