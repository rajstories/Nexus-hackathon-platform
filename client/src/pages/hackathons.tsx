import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Checkbox } from "../components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Label } from "../components/ui/label";
import { 
  Filter, 
  Search, 
  MapPin, 
  Calendar, 
  Users, 
  Trophy, 
  ExternalLink,
  ChevronDown,
  X,
  Clock,
  Target,
  Award
} from "lucide-react";

// Sample hackathon data with detailed information
const hackathons = [
  {
    id: 1,
    title: "AI Hackathon for Product Management",
    organization: "Product Space",
    logo: "🚀",
    prize: "₹ 12,000",
    registrations: 45,
    location: "Online",
    status: "Open",
    category: "Product Management",
    teamSize: "1-4",
    type: "Case Study",
    tags: ["Case Study", "AI", "Product", "Strategy"],
    deadline: "Aug 20, 2025",
    description: "Build innovative AI-powered product management solutions",
    detailedDescription: "Join us for an intensive AI hackathon focused on revolutionizing product management through artificial intelligence. Teams will work on real-world product challenges using cutting-edge AI tools and methodologies to create innovative solutions that can transform how products are developed, managed, and optimized.",
    eligibility: "Everyone can apply",
    tracks: [
      {
        name: "AI-Powered Analytics",
        description: "Develop AI solutions for product analytics, user behavior prediction, and market trend analysis.",
        ideas: ["Predictive user churn models", "AI-driven A/B testing optimization", "Smart feature prioritization systems"]
      },
      {
        name: "Automated Product Discovery",
        description: "Create AI systems that can automatically identify market opportunities and product gaps.",
        ideas: ["Market gap analysis AI", "Competitor feature tracking", "Customer need prediction models"]
      },
      {
        name: "Intelligent User Experience",
        description: "Build AI-powered tools for personalized user experiences and interface optimization.",
        ideas: ["Dynamic UI personalization", "AI chatbots for product support", "Automated user journey optimization"]
      }
    ],
    stages: [
      {
        name: "Idea Submission Round",
        description: "Submit your innovative AI product management solution idea with a detailed proposal including problem statement, proposed solution, methodology, and expected impact.",
        startDate: "Aug 20, 2025, 09:00 AM IST",
        endDate: "Aug 22, 2025, 11:59 PM IST",
        platform: "Online"
      },
      {
        name: "Final Presentation",
        description: "Selected teams will present their working prototypes and demonstrate the practical application of their AI solutions in real product management scenarios.",
        startDate: "Aug 25, 2025, 10:00 AM IST",
        endDate: "Aug 25, 2025, 06:00 PM IST",
        platform: "Online"
      }
    ]
  },
  {
    id: 2,
    title: "Swasth-a-thon",
    organization: "Project Concern International India",
    logo: "🏥",
    prize: "Free",
    registrations: 66,
    location: "Hybrid",
    status: "Open",
    category: "Healthcare",
    teamSize: "2-5",
    type: "Presentation",
    tags: ["Healthcare", "Innovation", "Social Impact"],
    deadline: "Aug 25, 2025",
    description: "Solve healthcare challenges through innovative technology solutions",
    detailedDescription: "Swasth-a-thon is a healthcare innovation challenge that brings together passionate individuals to develop technology-driven solutions for pressing healthcare issues. Participants will work on creating impactful solutions that can improve healthcare accessibility, quality, and affordability in underserved communities.",
    eligibility: "Students, healthcare professionals, and technologists",
    tracks: [
      {
        name: "Digital Health Solutions",
        description: "Develop digital platforms and applications that improve healthcare delivery and patient outcomes.",
        ideas: ["Telemedicine platforms for rural areas", "AI-powered diagnostic tools", "Health monitoring mobile apps"]
      },
      {
        name: "Healthcare Data & Analytics",
        description: "Create data-driven solutions for healthcare insights, population health management, and clinical decision support.",
        ideas: ["Predictive health analytics", "Disease outbreak monitoring systems", "Clinical decision support tools"]
      },
      {
        name: "Community Health Innovation",
        description: "Build solutions that address community-level health challenges and promote preventive care.",
        ideas: ["Community health tracking systems", "Preventive care reminder platforms", "Health education mobile solutions"]
      }
    ],
    stages: [
      {
        name: "Problem Identification",
        description: "Teams will identify specific healthcare challenges and present preliminary solution approaches with research backing and feasibility analysis.",
        startDate: "Aug 25, 2025, 09:00 AM IST",
        endDate: "Aug 26, 2025, 05:00 PM IST",
        platform: "Hybrid"
      },
      {
        name: "Solution Development & Presentation",
        description: "Develop working prototypes and present comprehensive solutions with implementation plans and expected social impact metrics.",
        startDate: "Aug 28, 2025, 10:00 AM IST",
        endDate: "Aug 28, 2025, 08:00 PM IST",
        platform: "Hybrid"
      }
    ]
  },
  {
    id: 3,
    title: "Sprintathon'25",
    organization: "St. Joseph's College of Engineering, Chennai",
    logo: "⚡",
    prize: "₹ 1,25,000",
    registrations: 158,
    location: "Chennai",
    status: "Open",
    category: "Engineering",
    teamSize: "3-6",
    type: "Hackathon",
    tags: ["Engineering", "Technology", "Innovation"],
    deadline: "Sep 1, 2025",
    description: "Fast-paced engineering hackathon for innovative solutions",
    detailedDescription: "Sprintathon'25 is a high-energy, fast-paced engineering hackathon that challenges participants to develop cutting-edge technological solutions within a limited timeframe. This event focuses on rapid prototyping, innovative problem-solving, and practical engineering applications across multiple domains.",
    eligibility: "Engineering students and professionals",
    tracks: [
      {
        name: "IoT & Embedded Systems",
        description: "Develop Internet of Things solutions and embedded system applications for smart technology.",
        ideas: ["Smart home automation systems", "Industrial IoT monitoring", "Wearable health devices"]
      },
      {
        name: "Software Engineering & Web Development",
        description: "Create robust software applications, web platforms, and mobile solutions for various use cases.",
        ideas: ["Progressive web applications", "Cloud-native software solutions", "Cross-platform mobile apps"]
      },
      {
        name: "Robotics & Automation",
        description: "Build robotic solutions and automation systems for industrial and consumer applications.",
        ideas: ["Autonomous navigation robots", "Industrial automation systems", "Service robots for elderly care"]
      }
    ],
    stages: [
      {
        name: "Team Formation & Ideation",
        description: "Form teams, brainstorm ideas, and submit detailed project proposals with technical specifications and implementation timelines.",
        startDate: "Sep 1, 2025, 08:00 AM IST",
        endDate: "Sep 1, 2025, 12:00 PM IST",
        platform: "Chennai Campus"
      },
      {
        name: "Development Sprint",
        description: "Intensive 36-hour development phase where teams build working prototypes with full functionality and user testing.",
        startDate: "Sep 1, 2025, 01:00 PM IST",
        endDate: "Sep 3, 2025, 01:00 AM IST",
        platform: "Chennai Campus"
      },
      {
        name: "Final Demo & Judging",
        description: "Teams present their completed prototypes with live demonstrations, technical deep-dives, and business case presentations.",
        startDate: "Sep 3, 2025, 02:00 PM IST",
        endDate: "Sep 3, 2025, 08:00 PM IST",
        platform: "Chennai Campus"
      }
    ]
  },
  {
    id: 4,
    title: "YuvaHacks '25",
    organization: "SRM Institute of Science and Technology",
    logo: "🎯",
    prize: "₹ 10,000",
    registrations: 119,
    location: "Chennai",
    status: "Open",
    category: "Student Competition",
    teamSize: "2-4",
    type: "Hackathon",
    tags: ["Student", "Technology", "Innovation"],
    deadline: "Aug 30, 2025",
    description: "Student-focused hackathon promoting young talent in technology",
    detailedDescription: "YuvaHacks '25 is designed specifically for young innovators and student developers to showcase their creativity and technical skills. This hackathon encourages students to think beyond traditional boundaries and create solutions that can impact society while learning cutting-edge technologies and development practices.",
    eligibility: "Currently enrolled students (undergraduate and graduate)",
    tracks: [
      {
        name: "Social Innovation",
        description: "Develop technology solutions that address social challenges and create positive community impact.",
        ideas: ["Education accessibility platforms", "Environmental monitoring apps", "Community safety solutions"]
      },
      {
        name: "Future Technologies",
        description: "Explore emerging technologies like AR/VR, blockchain, and quantum computing for innovative applications.",
        ideas: ["Virtual reality learning environments", "Blockchain voting systems", "AR navigation applications"]
      },
      {
        name: "Student Life Enhancement",
        description: "Create tools and platforms that improve the student experience and academic journey.",
        ideas: ["Study group matching platforms", "Campus resource optimization", "Academic progress tracking tools"]
      }
    ],
    stages: [
      {
        name: "Registration & Mentorship",
        description: "Complete registration, attend orientation sessions, and get paired with industry mentors for guidance throughout the hackathon.",
        startDate: "Aug 30, 2025, 09:00 AM IST",
        endDate: "Aug 30, 2025, 02:00 PM IST",
        platform: "SRM Campus, Chennai"
      },
      {
        name: "Hackathon Development Phase",
        description: "24-hour intensive coding session with mentor support, technical workshops, and peer collaboration opportunities.",
        startDate: "Aug 31, 2025, 09:00 AM IST",
        endDate: "Sep 1, 2025, 09:00 AM IST",
        platform: "SRM Campus, Chennai"
      },
      {
        name: "Pitch & Awards Ceremony",
        description: "Present final solutions to a panel of industry experts and academic leaders, with awards ceremony and networking session.",
        startDate: "Sep 1, 2025, 10:00 AM IST",
        endDate: "Sep 1, 2025, 04:00 PM IST",
        platform: "SRM Campus, Chennai"
      }
    ]
  },
  {
    id: 5,
    title: "Fintech Innovation Challenge",
    organization: "Banking Consortium",
    logo: "💰",
    prize: "₹ 2,50,000",
    registrations: 203,
    location: "Mumbai",
    status: "Open",
    category: "Fintech",
    teamSize: "2-6",
    type: "Challenge",
    tags: ["Fintech", "Banking", "Innovation", "Blockchain"],
    deadline: "Sep 15, 2025",
    description: "Transform the future of financial technology",
    detailedDescription: "The Fintech Innovation Challenge brings together the brightest minds in finance and technology to revolutionize the banking and financial services industry. Participants will work on next-generation financial solutions that can improve financial inclusion, enhance security, and create more efficient financial ecosystems.",
    eligibility: "Fintech professionals, developers, and financial experts",
    tracks: [
      {
        name: "Digital Payments & Blockchain",
        description: "Develop innovative payment solutions, cryptocurrency applications, and blockchain-based financial services.",
        ideas: ["Cross-border payment solutions", "DeFi lending platforms", "Cryptocurrency wallet innovations"]
      },
      {
        name: "AI-Powered Financial Services",
        description: "Create AI and machine learning solutions for risk assessment, fraud detection, and personalized financial advice.",
        ideas: ["AI credit scoring systems", "Automated fraud detection", "Personalized investment advisors"]
      },
      {
        name: "Financial Inclusion & Accessibility",
        description: "Build solutions that make financial services more accessible to underserved populations and small businesses.",
        ideas: ["Micro-lending platforms", "Financial literacy apps", "SME banking solutions"]
      }
    ],
    stages: [
      {
        name: "Problem Statement Selection",
        description: "Teams choose from real banking challenges provided by consortium partners and submit detailed solution proposals with market analysis.",
        startDate: "Sep 15, 2025, 10:00 AM IST",
        endDate: "Sep 16, 2025, 06:00 PM IST",
        platform: "Mumbai Financial District"
      },
      {
        name: "Prototype Development",
        description: "48-hour intensive development phase with access to banking APIs, regulatory guidance, and technical mentorship from industry experts.",
        startDate: "Sep 18, 2025, 09:00 AM IST",
        endDate: "Sep 20, 2025, 09:00 AM IST",
        platform: "Mumbai Financial District"
      },
      {
        name: "Final Pitch to Banking Leaders",
        description: "Present working prototypes to a panel of banking executives, with potential for pilot implementation and partnership opportunities.",
        startDate: "Sep 20, 2025, 02:00 PM IST",
        endDate: "Sep 20, 2025, 08:00 PM IST",
        platform: "Mumbai Financial District"
      }
    ]
  }
];

const filterCategories = {
  status: ["Open", "Closed", "Upcoming"],
  location: ["Online", "Hybrid", "Chennai", "Mumbai", "Delhi", "Bangalore"],
  eventType: ["Hackathon", "Case Study", "Presentation", "Challenge", "Workshop"],
  teamSize: ["1", "2", "2+"],
  payment: ["Free", "Paid"],
  userType: ["Student", "Professional", "Anyone"],
  domain: ["Technology", "Healthcare", "Fintech", "Education", "AI/ML"],
  category: ["Product Management", "Healthcare", "Engineering", "Student Competition", "Fintech"]
};

export default function HackathonsPage() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("deadline");
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedHackathon, setSelectedHackathon] = useState<typeof hackathons[0] | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const filteredHackathons = hackathons.filter(hackathon => {
    const matchesSearch = hackathon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hackathon.organization.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilters = Object.entries(filters).every(([category, values]) => {
      if (values.length === 0) return true;
      
      switch (category) {
        case 'status':
          return values.includes(hackathon.status);
        case 'location':
          return values.includes(hackathon.location);
        case 'eventType':
          return values.includes(hackathon.type);
        case 'category':
          return values.includes(hackathon.category);
        case 'payment':
          return values.includes(hackathon.prize === "Free" ? "Free" : "Paid");
        default:
          return true;
      }
    });

    return matchesSearch && matchesFilters;
  });

  const updateFilter = (category: string, value: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      [category]: checked 
        ? [...(prev[category] || []), value]
        : (prev[category] || []).filter(v => v !== value)
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).reduce((total, values) => total + values.length, 0);
  };

  const openHackathonDetail = (hackathon: typeof hackathons[0]) => {
    setSelectedHackathon(hackathon);
    setIsDetailModalOpen(true);
  };

  const closeHackathonDetail = () => {
    setIsDetailModalOpen(false);
    setSelectedHackathon(null);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-3">Explore Hackathons</h1>
              <p className="text-slate-300 text-lg">Discover amazing hackathons and coding competitions worldwide</p>
            </div>
            <Button 
              onClick={() => window.history.back()} 
              variant="outline"
              className="border-slate-400 text-slate-200 hover:bg-slate-700 hover:border-slate-300 px-6 py-2"
            >
              ← Back
            </Button>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <Input
                placeholder="Search hackathons by name or organization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 py-3 bg-white/10 border-slate-500 text-white placeholder-slate-300 rounded-lg text-lg backdrop-blur-sm focus:bg-white/20 focus:border-orange-400"
              />
            </div>
            
            <div className="flex gap-4">
              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="border-slate-400 text-slate-200 hover:bg-slate-700 hover:border-orange-400 px-6 py-3 rounded-lg font-medium"
                  >
                    <Filter className="mr-2 h-5 w-5" />
                    Filters
                    {getActiveFilterCount() > 0 && (
                      <Badge variant="secondary" className="ml-2 bg-orange-500 text-white font-bold">
                        {getActiveFilterCount()}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="bg-slate-900 border-slate-700 w-96">
                  <SheetHeader>
                    <SheetTitle className="text-white">Filters</SheetTitle>
                  </SheetHeader>
                  
                  <div className="mt-6 space-y-6">
                    {Object.entries(filterCategories).map(([category, options]) => (
                      <div key={category}>
                        <h3 className="font-semibold text-white mb-3 capitalize">
                          {category.replace(/([A-Z])/g, ' $1').trim()}
                        </h3>
                        <div className="space-y-2">
                          {options.map(option => (
                            <div key={option} className="flex items-center space-x-2">
                              <Checkbox
                                id={`${category}-${option}`}
                                checked={(filters[category] || []).includes(option)}
                                onCheckedChange={(checked) => 
                                  updateFilter(category, option, checked as boolean)
                                }
                              />
                              <Label 
                                htmlFor={`${category}-${option}`}
                                className="text-slate-300 text-sm"
                              >
                                {option}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={clearFilters}
                      className="flex-1 border-slate-600 text-slate-300"
                    >
                      Clear Filter
                    </Button>
                    <Button 
                      onClick={() => setIsFilterOpen(false)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      Apply Filter →
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white/10 border border-slate-400 text-white rounded-lg px-4 py-3 font-medium backdrop-blur-sm focus:bg-white/20 focus:border-orange-400 cursor-pointer"
              >
                <option value="deadline" className="bg-slate-800 text-white">Sort by Deadline</option>
                <option value="prize" className="bg-slate-800 text-white">Sort by Prize</option>
                <option value="registrations" className="bg-slate-800 text-white">Sort by Popularity</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <p className="text-slate-300 text-lg font-medium">
            Showing {filteredHackathons.length} of {hackathons.length} hackathons
          </p>
        </div>

        <div className="grid gap-6">
          {filteredHackathons.map((hackathon, index) => (
            <motion.div
              key={hackathon.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className="bg-slate-800/60 border-slate-600 hover:border-orange-400/70 transition-all hover:shadow-2xl hover:shadow-orange-500/10 p-6 backdrop-blur-sm cursor-pointer"
                onClick={() => openHackathonDetail(hackathon)}
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left Side - Main Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="text-4xl">{hackathon.logo}</div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-white mb-2 hover:text-orange-400 transition-colors cursor-pointer">{hackathon.title}</h3>
                        <p className="text-slate-300 mb-3 font-medium">{hackathon.organization}</p>
                        <p className="text-slate-200 text-sm mb-4 leading-relaxed">{hackathon.description}</p>
                        
                        <div className="flex flex-wrap gap-2">
                          {hackathon.tags.map(tag => (
                            <Badge 
                              key={tag} 
                              variant="secondary" 
                              className="bg-slate-700/80 text-slate-200 hover:bg-orange-500/20 hover:text-orange-300 transition-colors cursor-pointer"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Details */}
                  <div className="lg:w-80">
                    <div className="space-y-4">
                      {/* Prize and Registration */}
                      <div className="flex justify-between items-center">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-400">{hackathon.prize}</div>
                          <div className="text-xs text-slate-300 font-medium">Prize</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-400">{hackathon.registrations}</div>
                          <div className="text-xs text-slate-300 font-medium">Registered</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400">{hackathon.teamSize}</div>
                          <div className="text-xs text-slate-300 font-medium">Team Size</div>
                        </div>
                      </div>

                      <Separator className="bg-slate-600" />

                      {/* Event Details */}
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3 text-slate-300">
                          <MapPin className="h-4 w-4 text-orange-400" />
                          <span className="font-medium">{hackathon.location}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-300">
                          <Calendar className="h-4 w-4 text-blue-400" />
                          <span className="font-medium">Deadline: {hackathon.deadline}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-300">
                          <Users className="h-4 w-4 text-green-400" />
                          <span className="font-medium">{hackathon.type}</span>
                        </div>
                      </div>

                      <Separator className="bg-slate-600" />

                      {/* Status and Action */}
                      <div className="flex items-center justify-between">
                        <Badge 
                          className={hackathon.status === 'Open' 
                            ? "bg-green-500/20 text-green-300 border-green-500/50 font-medium" 
                            : "bg-red-500/20 text-red-300 border-red-500/50 font-medium"
                          }
                        >
                          {hackathon.status}
                        </Badge>
                        <Button 
                          className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all"
                          onClick={() => navigate(`/register/${hackathon.id}`)}
                        >
                          Register Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredHackathons.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-white mb-3">No hackathons found</h3>
            <p className="text-slate-300 mb-6 text-lg">Try adjusting your search or filters</p>
            <Button onClick={clearFilters} variant="outline" className="border-slate-400 text-slate-200 hover:bg-slate-700 px-6 py-2">
              Clear all filters
            </Button>
          </div>
        )}
        
        {/* Disclaimer */}
        <div className="mt-16 text-center">
          <p className="text-slate-500 text-xs">
            These are dummy data for reference taken from Unstop
          </p>
        </div>
      </div>
      </div>

      {/* Hackathon Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedHackathon && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="text-3xl">{selectedHackathon.logo}</span>
                  {selectedHackathon.title}
                </DialogTitle>
              </DialogHeader>
            
            <div className="space-y-6 text-white">
              {/* Basic Info */}
              <div className="flex items-center gap-4 text-slate-300">
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {selectedHackathon?.teamSize} Members
                </span>
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {selectedHackathon?.location}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {selectedHackathon?.deadline}
                </span>
              </div>

              {/* Eligibility */}
              <div className="bg-slate-800/50 p-4 rounded-lg border-l-4 border-blue-500">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-400" />
                  Eligibility
                </h3>
                <p className="text-slate-300">{selectedHackathon?.eligibility}</p>
              </div>

              {/* Detailed Description */}
              <div>
                <h3 className="text-xl font-bold mb-3">All that you need to know about {selectedHackathon?.title}</h3>
                <p className="text-slate-300 leading-relaxed">{selectedHackathon?.detailedDescription}</p>
              </div>

              {/* Challenges & Tracks */}
              <div>
                <h3 className="text-xl font-bold mb-4">Challenges & Tracks:</h3>
                <p className="text-slate-300 mb-4">Participants will choose a track to focus on, each designed to address a critical area:</p>
                <div className="space-y-4">
                  {selectedHackathon?.tracks.map((track, index) => (
                    <div key={index} className="bg-slate-800/50 p-4 rounded-lg">
                      <h4 className="font-semibold text-orange-400 mb-2">{track.name}:</h4>
                      <p className="text-slate-300 mb-3">{track.description}</p>
                      <div className="text-sm text-slate-400">
                        <span className="font-medium">Ideas: </span>
                        {track.ideas.join(", ")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stages and Timelines */}
              <div>
                <h3 className="text-xl font-bold mb-4">Stages and Timelines</h3>
                <div className="space-y-6">
                  {selectedHackathon?.stages.map((stage, index) => (
                    <div key={index} className="relative">
                      {/* Timeline indicator */}
                      <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
                            {index + 1}
                          </div>
                          {index < (selectedHackathon?.stages.length || 0) - 1 && (
                            <div className="w-0.5 h-16 bg-slate-600 mt-2"></div>
                          )}
                        </div>
                        
                        <div className="flex-1 bg-slate-800/50 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                              On {stage.platform}
                            </span>
                          </div>
                          <h4 className="font-semibold text-lg mb-3">{stage.name}</h4>
                          <p className="text-slate-300 mb-4">{stage.description}</p>
                          <div className="flex items-center gap-4 text-sm text-slate-400">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>Start: {stage.startDate}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>End: {stage.endDate}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Registration CTA */}
              <div className="bg-gradient-to-r from-orange-500/20 to-yellow-500/20 p-6 rounded-lg border border-orange-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Ready to participate?</h4>
                    <p className="text-slate-300">Join {selectedHackathon?.registrations} other participants</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-400 mb-1">{selectedHackathon?.prize}</div>
                    <Button 
                      className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold"
                      onClick={() => {
                        setIsDetailModalOpen(false);
                        navigate(`/register/${selectedHackathon?.id}`);
                      }}
                    >
                      Register Now
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>  
  );
}