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
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Explore Hackathons</h1>
              <p className="text-slate-400">Discover amazing hackathons and coding competitions</p>
            </div>
            <Button 
              onClick={() => window.history.back()} 
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              ← Back
            </Button>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search hackathons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-600 text-white placeholder-slate-400"
              />
            </div>
            
            <div className="flex gap-3">
              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                    {getActiveFilterCount() > 0 && (
                      <Badge variant="secondary" className="ml-2 bg-orange-500 text-white">
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
                className="bg-slate-800 border border-slate-600 text-white rounded-md px-3 py-2"
              >
                <option value="deadline">Sort by Deadline</option>
                <option value="prize">Sort by Prize</option>
                <option value="registrations">Sort by Popularity</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <p className="text-slate-400">
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
              <Card className="bg-slate-800/50 border-slate-700 hover:border-orange-400/50 transition-all hover:shadow-xl p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left Side - Main Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="text-4xl">{hackathon.logo}</div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">{hackathon.title}</h3>
                        <p className="text-slate-400 mb-3">{hackathon.organization}</p>
                        <p className="text-slate-300 text-sm mb-4">{hackathon.description}</p>
                        
                        <div className="flex flex-wrap gap-2">
                          {hackathon.tags.map(tag => (
                            <Badge 
                              key={tag} 
                              variant="secondary" 
                              className="bg-slate-700 text-slate-300"
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
                          <div className="text-xs text-slate-400">Prize</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-400">{hackathon.registrations}</div>
                          <div className="text-xs text-slate-400">Registered</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400">{hackathon.teamSize}</div>
                          <div className="text-xs text-slate-400">Team Size</div>
                        </div>
                      </div>

                      <Separator className="bg-slate-700" />

                      {/* Event Details */}
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-slate-400">
                          <MapPin className="h-4 w-4" />
                          <span>{hackathon.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          <Calendar className="h-4 w-4" />
                          <span>Deadline: {hackathon.deadline}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          <Users className="h-4 w-4" />
                          <span>{hackathon.type}</span>
                        </div>
                      </div>

                      <Separator className="bg-slate-700" />

                      {/* Status and Action */}
                      <div className="flex items-center justify-between">
                        <Badge 
                          className={hackathon.status === 'Open' 
                            ? "bg-green-500/20 text-green-400 border-green-500/30" 
                            : "bg-red-500/20 text-red-400 border-red-500/30"
                          }
                        >
                          {hackathon.status}
                        </Badge>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          Register
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
            <h3 className="text-xl font-semibold text-white mb-2">No hackathons found</h3>
            <p className="text-slate-400 mb-4">Try adjusting your search or filters</p>
            <Button onClick={clearFilters} variant="outline" className="border-slate-600 text-slate-300">
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}