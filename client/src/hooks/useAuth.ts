import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  // Try session user first, then OAuth user
  const { data: sessionUser, isLoading: sessionLoading } = useQuery<User>({
    queryKey: ["/api/auth/session-user"],
    retry: false,
  });

  const { data: oauthUser, isLoading: oauthLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    enabled: !sessionUser, // Only try OAuth if no session user
  });

  const user = sessionUser || oauthUser;
  const isLoading = sessionLoading || oauthLoading;

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: !!user?.isAdmin,
  };
}