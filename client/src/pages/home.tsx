import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Code, 
  Server, 
  Shield, 
  Layers, 
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

const bounceAnimation = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 2,
      ease: "easeInOut",
      repeat: Infinity
    }
  }
};

export default function Home() {
  return (
    <div className="min-h-screen bg-dark-900 text-white overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-dark-900/80 backdrop-blur-md border-b border-dark-700/50" data-testid="header">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <motion.div 
                className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center"
                {...pulseAnimation}
                data-testid="logo"
              >
                <Code className="text-white text-lg" />
              </motion.div>
              <span className="text-xl font-bold text-white">Fusion X</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors" data-testid="link-features">Features</a>
              <a href="#structure" className="text-gray-300 hover:text-white transition-colors" data-testid="link-structure">Structure</a>
              <a href="#getting-started" className="text-gray-300 hover:text-white transition-colors" data-testid="link-getting-started">Get Started</a>
              <Button className="bg-primary hover:bg-blue-600 transition-colors" data-testid="button-github">
                <Github className="mr-2 h-4 w-4" />
                View on GitHub
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="min-h-screen relative gradient-bg flex items-center justify-center overflow-hidden" data-testid="hero-section">
        <div className="absolute inset-0 opacity-10">
          <motion.div 
            className="absolute top-20 left-20 w-72 h-72 bg-primary rounded-full blur-3xl"
            {...pulseAnimation}
          />
          <motion.div 
            className="absolute bottom-20 right-20 w-96 h-96 bg-secondary rounded-full blur-3xl"
            {...bounceAnimation}
          />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-white via-primary to-secondary bg-clip-text text-transparent" data-testid="text-hero-title">
              Fusion X
            </h1>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <p className="text-xl md:text-2xl text-gray-300 mb-4 font-light" data-testid="text-hero-subtitle">
              Modern JavaScript Monorepo Architecture
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <p className="text-lg text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed" data-testid="text-hero-description">
              A production-ready monorepo scaffolding with React frontend, Express API, shared TypeScript types, and seamless development workflow. Built for modern teams who value developer experience.
            </p>
          </motion.div>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <Button 
              size="lg" 
              className="bg-primary hover:bg-blue-600 px-8 py-4 text-lg font-medium transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/25"
              data-testid="button-quick-start"
            >
              <Rocket className="mr-2 h-5 w-5" />
              Quick Start
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-dark-700 hover:border-primary px-8 py-4 text-lg font-medium transition-all hover:scale-105 glass-card"
              data-testid="button-view-demo"
            >
              <Play className="mr-2 h-5 w-5" />
              View Demo
            </Button>
          </motion.div>
          
          <motion.div 
            className="mt-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.8 }}
          >
            <Card className="code-block p-6 text-left max-w-2xl mx-auto" data-testid="card-terminal">
              <div className="flex items-center mb-4">
                <div className="flex space-x-2 mr-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-gray-400 font-mono text-sm">Terminal</span>
              </div>
              <div className="font-mono text-sm">
                <div className="text-accent">$ npm run dev</div>
                <div className="text-gray-400 mt-2">🚀 React running on http://localhost:5000</div>
                <div className="text-gray-400">⚡ API server running on http://localhost:8000</div>
                <div className="text-primary mt-2">✅ Both apps healthy and ready!</div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-dark-800" data-testid="features-section">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6" data-testid="text-features-title">
              Why <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Fusion X</span>?
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Everything you need to build scalable applications with modern tools and best practices baked in.
            </p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                icon: Layers,
                title: "Monorepo Structure",
                description: "Organized workspace with npm workspaces, shared packages, and unified development workflow. Scale your codebase efficiently.",
                gradient: "from-primary to-blue-600",
                testId: "card-monorepo"
              },
              {
                icon: Code,
                title: "React + Vite",
                description: "Latest React with Vite, TypeScript, Tailwind CSS, shadcn/ui components, and Framer Motion animations out of the box.",
                gradient: "from-secondary to-purple-600",
                testId: "card-react"
              },
              {
                icon: Server,
                title: "Express API",
                description: "TypeScript-powered Express server with hot reload, production-ready configuration.",
                gradient: "from-accent to-green-600",
                testId: "card-express"
              },
              {
                icon: Shield,
                title: "Type Safety",
                description: "Shared TypeScript types and Zod schemas ensure consistency between frontend and backend with runtime validation.",
                gradient: "from-yellow-500 to-orange-500",
                testId: "card-type-safety"
              },
              {
                icon: WandSparkles,
                title: "Developer Experience",
                description: "ESLint, Prettier, path aliases, concurrent development, and optimized build pipeline for seamless development.",
                gradient: "from-pink-500 to-rose-500",
                testId: "card-developer-experience"
              },
              {
                icon: Zap,
                title: "Production Ready",
                description: "Optimized builds, environment configuration, and deployment scripts. Go from development to production in minutes.",
                gradient: "from-indigo-500 to-purple-500",
                testId: "card-production-ready"
              }
            ].map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="glass-card p-8 hover-lift h-full" data-testid={feature.testId}>
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6`}>
                    <feature.icon className="text-white text-2xl" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Project Structure Section */}
      <section id="structure" className="py-24 bg-dark-900" data-testid="structure-section">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6" data-testid="text-structure-title">Project Structure</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Clean, organized, and scalable architecture designed for modern development teams.
            </p>
          </motion.div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <motion.div variants={fadeInLeft} initial="initial" whileInView="animate" viewport={{ once: true }}>
              <Card className="code-block p-8" data-testid="card-folder-structure">
                <div className="flex items-center mb-6">
                  <div className="flex space-x-2 mr-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <span className="text-gray-400 font-mono text-sm">fusion-x/</span>
                </div>
                <div className="font-mono text-sm space-y-1">
                  <div className="flex items-center">
                    <span className="text-primary">client/</span>
                    <span className="text-gray-500 ml-4"># React frontend</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-primary">server/</span>
                    <span className="text-gray-500 ml-4"># Express API</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-primary">shared/</span>
                    <span className="text-gray-500 ml-4"># Shared types & schemas</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-300">package.json</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-300">tsconfig.json</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-300">README.md</span>
                  </div>
                </div>
              </Card>
            </motion.div>
            
            <motion.div 
              variants={fadeInRight} 
              initial="initial" 
              whileInView="animate" 
              viewport={{ once: true }}
              className="space-y-6"
            >
              {[
                {
                  icon: Code,
                  title: "Web Application",
                  description: "React with Vite, TypeScript, Tailwind CSS, shadcn/ui components, and Framer Motion animations.",
                  gradient: "from-primary to-blue-600",
                  testId: "card-web-app"
                },
                {
                  icon: Server,
                  title: "API Server",
                  description: "Express server with TypeScript and production builds.",
                  gradient: "from-accent to-green-600",
                  testId: "card-api-server"
                },
                {
                  icon: Shield,
                  title: "Shared Types",
                  description: "Common TypeScript interfaces, DTOs, and Zod schemas used across frontend and backend.",
                  gradient: "from-yellow-500 to-orange-500",
                  testId: "card-shared-types"
                }
              ].map((item, index) => (
                <Card key={index} className="glass-card p-6" data-testid={item.testId}>
                  <div className="flex items-center mb-3">
                    <div className={`w-8 h-8 bg-gradient-to-br ${item.gradient} rounded-lg flex items-center justify-center mr-3`}>
                      <item.icon className="text-white text-sm" />
                    </div>
                    <h3 className="text-xl font-bold">{item.title}</h3>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </Card>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Getting Started Section */}
      <section id="getting-started" className="py-24 bg-dark-800" data-testid="getting-started-section">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6" data-testid="text-getting-started-title">Get Started in Minutes</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Three simple commands to have your development environment up and running.
            </p>
          </motion.div>
          
          <div className="space-y-8">
            {[
              {
                step: "1",
                title: "Clone & Install",
                commands: [
                  "$ git clone https://github.com/your-org/fusion-x.git",
                  "$ cd fusion-x",
                  "$ npm install"
                ],
                gradient: "from-primary to-blue-600",
                testId: "step-install"
              },
              {
                step: "2",
                title: "Start Development",
                commands: [
                  "$ npm run dev",
                  "🚀 React running on http://localhost:5000",
                  "⚡ API server running on http://localhost:8000"
                ],
                gradient: "from-secondary to-purple-600",
                testId: "step-development"
              },
              {
                step: "3",
                title: "Build & Deploy",
                commands: [
                  "$ npm run build",
                  "$ npm run start",
                  "✅ Production build ready!"
                ],
                gradient: "from-accent to-green-600",
                testId: "step-deploy"
              }
            ].map((step, index) => (
              <motion.div 
                key={index}
                className="flex flex-col md:flex-row items-start gap-8"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.8 }}
                viewport={{ once: true }}
                data-testid={step.testId}
              >
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 bg-gradient-to-br ${step.gradient} rounded-xl flex items-center justify-center`}>
                    <span className="text-white font-bold text-lg">{step.step}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                  <Card className="code-block p-4 font-mono text-sm">
                    {step.commands.map((command, cmdIndex) => (
                      <div 
                        key={cmdIndex} 
                        className={cmdIndex === 0 ? "text-accent" : cmdIndex === step.commands.length - 1 && step.commands.length > 2 ? "text-primary mt-2" : "text-gray-400 mt-2"}
                      >
                        {command}
                      </div>
                    ))}
                  </Card>
                </div>
              </motion.div>
            ))}
          </div>
          
          <motion.div 
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Card className="glass-card p-12 max-w-4xl mx-auto" data-testid="card-cta">
              <h3 className="text-3xl font-bold mb-4">Ready to Build Something Amazing?</h3>
              <p className="text-gray-400 mb-8 text-lg">
                Join thousands of developers who have chosen Fusion X for their next project.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  className="bg-primary hover:bg-blue-600 px-8 py-4 text-lg font-medium transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/25"
                  data-testid="button-get-started-github"
                >
                  <Github className="mr-2 h-5 w-5" />
                  Get Started on GitHub
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  className="border-dark-700 hover:border-secondary px-8 py-4 text-lg font-medium transition-all hover:scale-105"
                  data-testid="button-read-docs"
                >
                  <Book className="mr-2 h-5 w-5" />
                  Read Documentation
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-800 border-t border-dark-700 py-12" data-testid="footer">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <Code className="text-white text-lg" />
              </div>
              <span className="text-xl font-bold text-white">Fusion X</span>
            </div>
            <div className="flex items-center space-x-8">
              <a href="#" className="text-gray-400 hover:text-white transition-colors" data-testid="link-github">
                <Github className="text-xl" />
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-dark-700 text-center text-gray-400">
            <p>&copy; 2024 Fusion X. Built for the modern web.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
