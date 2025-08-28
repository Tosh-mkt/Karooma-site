import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import type { User } from "@shared/schema";

export function useAuth() {
  const [localUser, setLocalUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check localStorage for logged in user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('karooma_user');
    if (savedUser) {
      try {
        setLocalUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('karooma_user');
      }
    }
    setIsLoading(false);
  }, []);

  // Get NextAuth session as fallback
  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ["/api/auth/session"],
    retry: false,
    enabled: !localUser, // Only try NextAuth if no local user
  });

  const user = localUser || (session as any)?.user;
  const finalIsLoading = isLoading || (sessionLoading && !localUser);

  return {
    user,
    session,
    isLoading: finalIsLoading,
    isAuthenticated: !!user,
    isAdmin: !!user?.isAdmin,
    // Helper function to set user after login
    setUser: (userData: User | null) => {
      setLocalUser(userData);
      if (userData) {
        localStorage.setItem('karooma_user', JSON.stringify(userData));
      } else {
        localStorage.removeItem('karooma_user');
      }
    }
  };
}