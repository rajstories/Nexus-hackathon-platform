import { useState, useEffect } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { RoleSelectionModal } from '@/components/RoleSelectionModal';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (user && !loading) {
      // Check if we should show role selection for development
      if (import.meta.env.DEV && !localStorage.getItem('devRole')) {
        setShowRoleSelection(true);
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, loading, navigate]);

  const handleRoleSelect = (role: 'participant' | 'organizer' | 'judge') => {
    localStorage.setItem('devRole', role);
    setShowRoleSelection(false);
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect via useEffect
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-purple-950 dark:via-blue-950 dark:to-cyan-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {isLogin ? (
            <LoginForm onToggleMode={() => setIsLogin(false)} />
          ) : (
            <SignupForm onToggleMode={() => setIsLogin(true)} />
          )}
        </div>
      </div>
      
      <RoleSelectionModal 
        isOpen={showRoleSelection} 
        onRoleSelect={handleRoleSelect} 
      />
    </>
  );
}