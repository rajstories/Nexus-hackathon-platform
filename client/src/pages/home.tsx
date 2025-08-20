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
          <div className="grid lg:grid-cols-5 gap-8 items-center">
            {/* Left Content */}
            <motion.div 
              {...fadeInLeft}
              className="lg:col-span-2 space-y-8"
            >
              <div className="space-y-4">
                <motion.div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-yellow-500 rounded-lg flex items-center justify-center text-2xl">
                    🚀
                  </div>
                  <span className="text-orange-400 font-semibold text-sm uppercase tracking-wide">End-to-End Hackathon Ecosystem</span>
                </motion.div>
                <motion.h1 
                  {...fadeInUp}
                  className="text-5xl md:text-7xl font-bold leading-tight mb-6"
                >
                  <span className="text-white">Empower Innovation.</span><br/>
                  <span className="text-transparent bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500 bg-clip-text">
                    Streamline Execution.
                  </span>
                </motion.h1>
                <motion.p 
                  {...fadeInUp}
                  className="text-lg md:text-xl text-slate-300 font-light leading-relaxed mb-8"
                >
                  Complete hackathon ecosystem for <span className="text-orange-400 font-semibold">organizers</span>, <span className="text-blue-400 font-semibold">participants</span>, and <span className="text-green-400 font-semibold">judges</span>. 
                  Host events, build projects, discover talent.
                </motion.p>
                <motion.div className="flex flex-wrap gap-6 mb-8 text-sm">
                  <div className="flex items-center gap-2 text-slate-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>500+ Global Events</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <span>$2M+ Prize Distribution</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                    <span>50+ Industry Partners</span>
                  </div>
                </motion.div>
              </div>
              
              <motion.div 
                {...fadeInUp}
                className="flex flex-wrap gap-4"
              >
                <Button 
                  onClick={() => setLocation('/auth')}
                  className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                >
                  <Rocket className="mr-2 h-5 w-5" />
                  Host an Event
                </Button>
                <Button 
                  variant="outline" 
                  className="border-2 border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-slate-900 px-8 py-4 rounded-full text-lg font-semibold transition-all"
                >
                  <Trophy className="mr-2 h-5 w-5" />
                  Explore Hackathons
                </Button>
                <Button 
                  variant="outline" 
                  className="border-2 border-slate-600 text-slate-300 hover:bg-slate-800 px-8 py-4 rounded-full text-lg font-semibold transition-all"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </motion.div>
            </motion.div>
            
            {/* Right 3D Illustration */}
            <motion.div 
              {...fadeInRight}
              className="lg:col-span-3 relative flex items-center justify-center"
            >
              <div className="relative w-full max-w-lg">
                {/* Main Monitor - Hackathon Dashboard */}
                <motion.div 
                  {...pulseAnimation}
                  className="relative transform rotate-12 hover:rotate-6 transition-transform duration-300"
                >
                  <motion.div 
                    className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border-4 border-orange-400/30 p-6 shadow-2xl"
                    whileHover={{ scale: 1.02, rotateX: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div 
                      className="bg-slate-900 rounded h-48 border border-slate-700 p-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.8 }}
                    >
                      {/* Real-Time Event Intelligence */}
                      <div className="flex items-center justify-between mb-4">
                        <motion.div 
                          className="text-orange-400 font-bold text-lg"
                          animate={{ opacity: [0.7, 1, 0.7] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          Your Command Center
                        </motion.div>
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      </div>
                      <div className="space-y-3">
                        <motion.div 
                          className="flex items-center gap-3"
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.5, duration: 0.5 }}
                        >
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-xs">🏆</div>
                          <div className="text-white text-sm">AI Innovators Challenge</div>
                          <motion.div 
                            className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            LIVE NOW
                          </motion.div>
                        </motion.div>
                        <motion.div 
                          className="flex items-center gap-3"
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.7, duration: 0.5 }}
                        >
                          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-xs">⚡</div>
                          <div className="text-white text-sm">Web3 Builder Bootcamp</div>
                          <motion.div 
                            className="ml-auto text-yellow-400 text-xs"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            2 Days
                          </motion.div>
                        </motion.div>
                        <motion.div 
                          className="flex items-center gap-3"
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.9, duration: 0.5 }}
                        >
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-xs">🧠</div>
                          <div className="text-white text-sm">Projects Needing Review</div>
                          <motion.div 
                            className="ml-auto bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold"
                            animate={{ 
                              scale: [1, 1.2, 1],
                              rotate: [0, 5, -5, 0]
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                          >
                            12
                          </motion.div>
                        </motion.div>
                      </div>
                      <motion.div 
                        className="mt-4 text-center"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 1.1, duration: 0.5 }}
                      >
                        <motion.div 
                          className="text-orange-400 text-2xl font-bold"
                          animate={{ 
                            textShadow: [
                              "0 0 0px #f97316",
                              "0 0 10px #f97316",
                              "0 0 0px #f97316"
                            ]
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          247
                        </motion.div>
                        <div className="text-slate-400 text-xs">Teams Innovating</div>
                      </motion.div>
                    </motion.div>
                    <div className="mt-4 h-2 bg-slate-700 rounded overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-orange-400 to-yellow-500 rounded"
                        animate={{ 
                          width: ["0%", "75%", "70%", "75%"],
                          opacity: [0.8, 1, 0.9, 1]
                        }}
                        transition={{ 
                          duration: 3, 
                          ease: "easeInOut",
                          repeat: Infinity,
                          repeatType: "reverse"
                        }}
                      ></motion.div>
                    </div>
                    <motion.div 
                      className="mt-2 flex gap-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.5, duration: 0.5 }}
                    >
                      <motion.div 
                        className="h-1 bg-orange-400 rounded flex-1"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                      ></motion.div>
                      <motion.div 
                        className="h-1 bg-yellow-400 rounded flex-1"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                      ></motion.div>
                      <motion.div 
                        className="h-1 bg-slate-700 rounded flex-1"
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
                      ></motion.div>
                    </motion.div>
                  </motion.div>
                  <div className="bg-gradient-to-br from-orange-500 to-yellow-500 h-4 rounded-b-lg mx-4"></div>
                  <div className="bg-slate-800 h-6 w-16 mx-auto rounded-b-lg"></div>
                </motion.div>
                
                {/* Floating Hackathon Elements */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="absolute -top-8 -left-8 transform hover:scale-110 transition-transform"
                >
                  <div className="bg-gradient-to-br from-blue-500 to-purple-500 w-16 h-16 rounded-xl flex items-center justify-center text-white shadow-lg backdrop-blur-sm border border-white/10">
                    <Trophy className="h-8 w-8" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-green-400 text-slate-900 text-xs px-2 py-1 rounded-full font-bold">$50K</div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  className="absolute top-16 -right-12 transform hover:scale-110 transition-transform"
                >
                  <div className="bg-gradient-to-br from-green-500 to-emerald-500 w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-lg backdrop-blur-sm border border-white/10">
                    <Zap className="h-7 w-7" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-slate-900 text-xs px-2 py-1 rounded-full font-bold">24h</div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9, duration: 0.5 }}
                  className="absolute -bottom-4 -left-12 transform hover:scale-110 transition-transform"
                >
                  <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg backdrop-blur-sm border border-white/10">
                    <Brain className="h-6 w-6" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-purple-400 text-white text-xs px-2 py-1 rounded-full font-bold">AI</div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.1, duration: 0.5 }}
                  className="absolute bottom-20 -right-8 transform hover:scale-110 transition-transform"
                >
                  <div className="bg-gradient-to-br from-yellow-500 to-orange-500 w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg backdrop-blur-sm border border-white/10">
                    <Shield className="h-5 w-5" />
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ 
                    opacity: 1, 
                    y: [0, -5, 0], 
                    scale: 1
                  }}
                  transition={{ 
                    delay: 1.3, 
                    duration: 0.5,
                    y: {
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }
                  }}
                  className="absolute top-32 left-8 bg-slate-800/80 backdrop-blur-sm border border-orange-400/30 rounded-lg p-3 shadow-lg"
                >
                  <motion.div 
                    className="text-orange-400 text-sm font-semibold"
                    animate={{ opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    Live Intelligence
                  </motion.div>
                  <div className="text-white text-xs">247 Active Builders</div>
                  <div className="flex items-center gap-1 mt-1">
                    <motion.div 
                      className="w-2 h-2 bg-green-400 rounded-full"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    ></motion.div>
                    <span className="text-green-400 text-xs">Real-time</span>
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
              The Complete <span className="text-orange-400">Innovation Platform</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Real-time intelligence, dynamic leaderboards, comprehensive event management.
            </p>
          </motion.div>

          <motion.div 
            {...staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              {
                icon: <Trophy className="h-8 w-8 text-yellow-500" />,
                title: "Event Management",
                description: "Create and run hackathons from registration to prizes. Handle thousands of participants effortlessly.",
                badge: "ORGANIZERS",
                stats: "500+ Events"
              },
              {
                icon: <Brain className="h-8 w-8 text-purple-500" />,
                title: "AI-Powered Judging",
                description: "Smart evaluation with automated scoring, bias detection, and real-time feedback.",
                badge: "AI-POWERED",
                stats: "98% Accuracy"
              },
              {
                icon: <Rocket className="h-8 w-8 text-orange-500" />,
                title: "Team Collaboration",
                description: "Project management, code sharing, real-time chat, and collaborative workspaces.",
                badge: "PRODUCTIVITY",
                stats: "10K+ Teams"
              },
              {
                icon: <Award className="h-8 w-8 text-green-500" />,
                title: "Blockchain Certificates",
                description: "Web3-verified achievements and NFT badges for permanent portfolio showcase.",
                badge: "WEB3",
                stats: "50K+ Issued"
              },
              {
                icon: <BarChart3 className="h-8 w-8 text-blue-500" />,
                title: "Live Analytics",
                description: "Real-time insights on participation, submissions, and engagement for data-driven decisions.",
                badge: "INSIGHTS",
                stats: "Real-time"
              },
              {
                icon: <MessageCircle className="h-8 w-8 text-indigo-500" />,
                title: "Community & Mentorship",
                description: "Connect with mentors, sponsors, and peers. Built-in Q&A and networking features.",
                badge: "COMMUNITY",
                stats: "1000+ Mentors"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                {...fadeInUp}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-slate-900/50 border-slate-700 hover:border-orange-400/50 transition-all hover:shadow-xl hover:scale-105 h-full group">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {feature.icon}
                        <div>
                          <h3 className="text-lg font-semibold text-white group-hover:text-orange-400 transition-colors">{feature.title}</h3>
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30 mt-1">
                            {feature.badge}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-orange-400 font-bold text-sm">{feature.stats}</div>
                      </div>
                    </div>
                    <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">{feature.description}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              How FusionX Works
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              From registration to results - everything you need for a successful hackathon in one platform.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              { 
                step: "01", 
                title: "Create & Configure", 
                desc: "Set up your hackathon in minutes with custom themes, rules, and judging criteria. Invite teams and sponsors seamlessly.",
                icon: "⚙️",
                color: "from-blue-400 to-cyan-500"
              },
              { 
                step: "02", 
                title: "Collaborate & Build", 
                desc: "Teams work together with integrated tools, real-time chat, mentor support, and AI-powered project guidance.",
                icon: "🛠️",
                color: "from-purple-400 to-pink-500"
              },
              { 
                step: "03", 
                title: "Judge & Celebrate", 
                desc: "Fair evaluation with AI assistance, live results, blockchain certificates, and automated prize distribution.",
                icon: "🏆",
                color: "from-yellow-400 to-orange-500"
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.8 }}
                viewport={{ once: true }}
                className="relative"
              >
                <Card className="bg-slate-800/50 border-slate-700 hover:border-orange-400/50 transition-all h-full">
                  <div className="p-8 text-center relative">
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {step.step}
                      </div>
                    </div>
                    <div className={`text-5xl mb-6 p-4 rounded-full bg-gradient-to-r ${step.color} w-fit mx-auto mt-4`}>
                      {step.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">{step.title}</h3>
                    <p className="text-slate-400 leading-relaxed">{step.desc}</p>
                  </div>
                </Card>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <div className="w-8 h-0.5 bg-gradient-to-r from-orange-400 to-yellow-500"></div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-24 bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Powering the Future of <span className="text-orange-400">Innovation</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Experience the metrics that demonstrate FusionX's impact on the global innovation ecosystem.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { number: "10,000+", label: "Innovation Builders", icon: "👨‍💻", color: "text-blue-400" },
              { number: "500+", label: "Global Innovation Events", icon: "🚀", color: "text-green-400" },
              { number: "$2M+", label: "Prize Distribution Facilitated", icon: "💰", color: "text-yellow-400" },
              { number: "50+", label: "Industry-Leading Partners", icon: "🤝", color: "text-purple-400" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl mb-4">{stat.icon}</div>
                <div className={`text-4xl font-bold ${stat.color} mb-2`}>{stat.number}</div>
                <div className="text-slate-400 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="demo" className="py-24 bg-gradient-to-r from-orange-600/20 via-yellow-600/20 to-orange-600/20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-orange-400 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-yellow-400 rounded-full blur-3xl animate-pulse"></div>
        </div>
        <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-400/30 rounded-full px-6 py-2 mb-8">
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
              <span className="text-orange-400 font-semibold text-sm">Next Hackathon Starting Soon</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Transform Ideas Into
              <br />
              <span className="text-transparent bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text">
                Innovation Reality
              </span>
            </h2>
            <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join innovation leaders worldwide. Organize enterprise hackathons, discover breakthrough talent, 
              drive meaningful outcomes.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <Button 
                onClick={() => setLocation('/auth')}
                size="lg" 
                className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white px-12 py-4 text-lg font-bold rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
              >
                <Rocket className="mr-2 h-5 w-5" />
                Get Started for Organizers
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-white text-white hover:bg-white hover:text-slate-900 px-12 py-4 text-lg font-bold rounded-full transition-all"
              >
                <Play className="mr-2 h-5 w-5" />
                Schedule Demo
              </Button>
            </div>
            <div className="flex flex-wrap justify-center gap-8 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-green-400" />
                <span>30-Day Free Trial</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-400" />
                <span>Enterprise Security</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-purple-400" />
                <span>24/7 Support</span>
              </div>
            </div>
          </motion.div>
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