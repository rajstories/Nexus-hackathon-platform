import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { auth, onAuthStateChange, handleRedirectResult } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  idToken: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  idToken: null,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [idToken, setIdToken] = useState<string | null>(null);

  useEffect(() => {
    // Check for redirect result when app loads
    handleRedirectResult().catch((error) => {
      console.error('Error handling redirect result:', error);
    });

    const unsubscribe = onAuthStateChange(async (user: User | null) => {
      setUser(user);
      
      if (user) {
        try {
          // Get the ID token and keep it fresh
          const token = await user.getIdToken();
          setIdToken(token);
          // Set token globally for API requests
          (window as any).__auth_token__ = token;
        } catch (error) {
          console.error('Error getting ID token:', error);
          setIdToken(null);
          (window as any).__auth_token__ = null;
        }
      } else {
        setIdToken(null);
        (window as any).__auth_token__ = null;
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Refresh token periodically (Firebase tokens expire after 1 hour)
  useEffect(() => {
    if (user) {
      const refreshToken = async () => {
        try {
          const token = await user.getIdToken(true); // Force refresh
          setIdToken(token);
        } catch (error) {
          console.error('Error refreshing token:', error);
        }
      };

      // Refresh token every 50 minutes
      const interval = setInterval(refreshToken, 50 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const value = {
    user,
    loading,
    idToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};