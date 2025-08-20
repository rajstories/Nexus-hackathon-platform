import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, Gavel } from "lucide-react";

interface RoleSelectionModalProps {
  isOpen: boolean;
  onRoleSelect: (role: 'participant' | 'organizer' | 'judge') => void;
}

export function RoleSelectionModal({ isOpen, onRoleSelect }: RoleSelectionModalProps) {
  const [selectedRole, setSelectedRole] = useState<'participant' | 'organizer' | 'judge' | null>(null);

  const roles = [
    {
      id: 'participant' as const,
      title: 'Participant',
      description: 'Join hackathons, form teams, and build amazing projects',
      icon: Users,
      features: ['Join events', 'Form teams', 'Submit projects', 'Win prizes']
    },
    {
      id: 'organizer' as const, 
      title: 'Organizer',
      description: 'Create and manage hackathons, coordinate events',
      icon: Calendar,
      features: ['Create events', 'Manage participants', 'Set challenges', 'Award prizes']
    },
    {
      id: 'judge' as const,
      title: 'Judge',
      description: 'Evaluate submissions and provide feedback to participants',
      icon: Gavel,
      features: ['Review projects', 'Score submissions', 'Provide feedback', 'Select winners']
    }
  ];

  const handleContinue = () => {
    if (selectedRole) {
      onRoleSelect(selectedRole);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">Choose Your Role</DialogTitle>
          <DialogDescription className="text-center">
            Select how you'd like to participate in the Nexus ecosystem
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;
            
            return (
              <Card 
                key={role.id}
                className={`cursor-pointer transition-all ${
                  isSelected 
                    ? 'ring-2 ring-primary bg-primary/5' 
                    : 'hover:shadow-md hover:scale-105'
                }`}
                onClick={() => setSelectedRole(role.id)}
                data-testid={`role-card-${role.id}`}
              >
                <CardHeader className="text-center pb-2">
                  <Icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <CardTitle className="text-lg">{role.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {role.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    {role.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        <div className="flex justify-center">
          <Button 
            onClick={handleContinue}
            disabled={!selectedRole}
            className="px-8"
            data-testid="button-continue-with-role"
          >
            Continue as {selectedRole ? roles.find(r => r.id === selectedRole)?.title : 'Selected Role'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}