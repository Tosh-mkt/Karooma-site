import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  // Get NextAuth session
  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ["/api/auth/session"],
    retry: false,
  });

  // Fallback to legacy session user for backward compatibility
  const { data: sessionUser, isLoading: legacyLoading } = useQuery<User>({
    queryKey: ["/api/auth/session-user"],
    retry: false,
    enabled: !session, // Only try legacy if no NextAuth session
  });

  const user = (session as any)?.user || sessionUser;
  const isLoading = sessionLoading || legacyLoading;

  return {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: !!user?.isAdmin,
  };
}