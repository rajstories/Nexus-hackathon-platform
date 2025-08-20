import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Settings } from "lucide-react";

export function DevRoleSwitcher() {
  const [currentRole, setCurrentRole] = useState<string>('participant');
  
  useEffect(() => {
    const savedRole = localStorage.getItem('devRole') || 'participant';
    setCurrentRole(savedRole);
  }, []);
  
  const handleRoleChange = (newRole: string) => {
    localStorage.setItem('devRole', newRole);
    setCurrentRole(newRole);
    // Refresh the page to apply new role
    window.location.reload();
  };
  
  // Only show in development mode
  if (!import.meta.env.DEV) {
    return null;
  }
  
  return (
    <Card className="fixed top-4 left-4 z-50 bg-yellow-100 dark:bg-yellow-900 border-yellow-400">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Settings className="w-4 h-4 text-yellow-700 dark:text-yellow-300" />
          <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            Dev Mode:
          </span>
          <Select value={currentRole} onValueChange={handleRoleChange}>
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="participant">Participant</SelectItem>
              <SelectItem value="organizer">Organizer</SelectItem>
              <SelectItem value="judge">Judge</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}