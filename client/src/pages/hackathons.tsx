import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../components/ui/sheet";
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
  X
} from "lucide-react";

// Sample hackathon data
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
    description: "Build innovative AI-powered product management solutions"
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
    description: "Solve healthcare challenges through innovative technology solutions"
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
    description: "Fast-paced engineering hackathon for innovative solutions"
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
    description: "Student-focused hackathon promoting young talent in technology"
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
    description: "Transform the future of financial technology"
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
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("deadline");
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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

  return (
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
              <Card className="bg-slate-800/60 border-slate-600 hover:border-orange-400/70 transition-all hover:shadow-2xl hover:shadow-orange-500/10 p-6 backdrop-blur-sm">
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
                        <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all">
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
      </div>
    </div>
  );
}