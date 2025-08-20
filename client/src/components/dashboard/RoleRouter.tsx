import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useAuth } from "../../contexts/AuthContext";
import { ParticipantDashboard } from "./ParticipantDashboard";
import { OrganizerDashboard } from "./OrganizerDashboard";
import { JudgeDashboard } from "./JudgeDashboard";
import { 
  User, 
  Settings, 
  Scale,
  ArrowRight,
  Crown,
  Code,
  Gavel
} from "lucide-react";

type UserRole = 'participant' | 'organizer' | 'judge';

interface RoleOption {
  role: UserRole;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
}

export function RoleRouter() {
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  // For demo purposes, let users select any role
  // In production, this would be determined by user's actual role from database
  const roleOptions: RoleOption[] = [
    {
      role: 'participant',
      title: 'Participant',
      description: 'Join teams, submit projects, and participate in hackathons',
      icon: <User className="w-8 h-8" />,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      features: ['Profile Management', 'Team Creation/Joining', 'Project Submission', 'Event Timeline']
    },
    {
      role: 'organizer',
      title: 'Organizer',
      description: 'Create events, manage tracks, and coordinate hackathons',
      icon: <Settings className="w-8 h-8" />,
      color: 'text-green-600 bg-green-50 border-green-200',
      features: ['Event Management', 'Track Creation', 'Announcements', 'Judge Management', 'Submission Overview']
    },
    {
      role: 'judge',
      title: 'Judge',
      description: 'Evaluate submissions and provide feedback to participants',
      icon: <Scale className="w-8 h-8" />,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      features: ['Submission Review', 'Criteria Scoring', 'Feedback System', 'Evaluation Dashboard']
    }
  ];

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleBackToRoleSelection = () => {
    setSelectedRole(null);
  };

  // Render specific dashboard based on selected role
  if (selectedRole === 'participant') {
    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={handleBackToRoleSelection}
            data-testid="button-back-to-roles"
          >
            ← Back to Role Selection
          </Button>
          <Badge className="text-blue-600 bg-blue-50">Demo Mode</Badge>
        </div>
        <ParticipantDashboard />
      </div>
    );
  }

  if (selectedRole === 'organizer') {
    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={handleBackToRoleSelection}
            data-testid="button-back-to-roles"
          >
            ← Back to Role Selection
          </Button>
          <Badge className="text-green-600 bg-green-50">Demo Mode</Badge>
        </div>
        <OrganizerDashboard />
      </div>
    );
  }

  if (selectedRole === 'judge') {
    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={handleBackToRoleSelection}
            data-testid="button-back-to-roles"
          >
            ← Back to Role Selection
          </Button>
          <Badge className="text-purple-600 bg-purple-50">Demo Mode</Badge>
        </div>
        <JudgeDashboard />
      </div>
    );
  }

  // Default role selection screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-6 py-12 max-w-7xl">
        <div className="text-center mb-12">
          <div className="mb-6">
            <h1 className="text-5xl font-extrabold mb-4 tracking-tight">
              Welcome to 
              <span className="ml-3">
                Nexus by FusionX
              </span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-6 max-w-2xl mx-auto leading-relaxed">
              Choose your role to access your personalized dashboard and unlock the full potential of hackathon management
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Logged in as</span>
            <Badge 
              variant="outline" 
              className="px-3 py-1 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium"
              data-testid="text-current-user"
            >
              {user?.displayName || user?.email}
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-8 mb-12">
          {roleOptions.map((option, index) => (
            <Card 
              key={option.role} 
              className={`group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm overflow-hidden relative`}
              onClick={() => handleRoleSelect(option.role)}
              data-testid={`card-role-${option.role}`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Gradient border effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ padding: '2px' }}>
                <div className="h-full w-full bg-white dark:bg-slate-800 rounded-lg" />
              </div>
              
              <div className="relative z-10">
                <CardHeader className="text-center pb-4">
                  <div className={`mx-auto mb-6 p-4 rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${option.color.includes('blue') ? 'bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50' : option.color.includes('green') ? 'bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/50 dark:to-green-800/50' : 'bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/50 dark:to-purple-800/50'}`}>
                    <div className={`${option.color.split(' ')[0]} transition-colors duration-300`}>
                      {option.icon}
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-blue-600 group-hover:bg-clip-text transition-all duration-300">
                    {option.title}
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {option.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 mr-2" />
                      Key Features
                    </h4>
                    <ul className="space-y-2">
                      {option.features.map((feature, featureIndex) => (
                        <li 
                          key={feature} 
                          className="flex items-center text-sm text-slate-600 dark:text-slate-300 transition-all duration-200 hover:text-slate-800 dark:hover:text-slate-100"
                          style={{ animationDelay: `${(index * 150) + (featureIndex * 50)}ms` }}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full mr-3 ${option.color.includes('blue') ? 'bg-blue-500' : option.color.includes('green') ? 'bg-green-500' : 'bg-purple-500'}`} />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button 
                    className={`w-full mt-6 h-12 font-semibold transition-all duration-300 group-hover:shadow-lg ${option.color.includes('blue') ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0' : option.color.includes('green') ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-0' : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-0'}`}
                    data-testid={`button-select-${option.role}`}
                  >
                    <span className="flex items-center justify-center">
                      Select {option.title}
                      <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </Button>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Card className="max-w-2xl mx-auto bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
            <CardContent className="pt-8 pb-8">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 mb-4 shadow-lg">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">Demo Mode Active</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                In a production environment, your role would be automatically determined based on your account permissions. 
                For this demo, you can explore any role to experience the different dashboard capabilities and features.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}