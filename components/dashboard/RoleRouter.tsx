import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
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
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">
          Welcome to 
          <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent ml-3">
            Fusion X
          </span>
        </h1>
        <p className="text-xl text-muted-foreground mb-2">
          Choose your role to access your personalized dashboard
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>Logged in as</span>
          <Badge variant="outline" data-testid="text-current-user">
            {user?.displayName || user?.email}
          </Badge>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {roleOptions.map((option) => (
          <Card 
            key={option.role} 
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-2 ${option.color}`}
            onClick={() => handleRoleSelect(option.role)}
            data-testid={`card-role-${option.role}`}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 rounded-full bg-background">
                <div className={option.color.split(' ')[0]}>
                  {option.icon}
                </div>
              </div>
              <CardTitle className="text-xl">{option.title}</CardTitle>
              <CardDescription className="text-sm">
                {option.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Key Features:</h4>
                <ul className="text-sm space-y-1">
                  {option.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-current mr-2 opacity-60" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <Button 
                className="w-full mt-4" 
                variant="outline"
                data-testid={`button-select-${option.role}`}
              >
                Select {option.title}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-4">
              <Crown className="w-5 h-5 mx-auto mb-2" />
              <strong>Demo Mode</strong>
            </div>
            <p className="text-sm text-muted-foreground">
              In a production environment, your role would be automatically determined based on your account permissions. 
              For this demo, you can explore any role to see the different dashboard experiences.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}