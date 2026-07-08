import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type AppRole = "admin" | "moderator" | "user";

/**
 * Resolves the highest-privilege role for the current user.
 * - admin / moderator  -> "team" (Layer 3 operations nav)
 * - user or no row     -> "student" (Layer 2 learning nav)
 * - not signed in      -> null
 */
export const useUserRole = () => {
  const { user, loading: authLoading } = useAuth();

  const query = useQuery({
    queryKey: ["userRoles", user?.id],
    queryFn: async () => {
      if (!user) return [] as AppRole[];
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      if (error) return [] as AppRole[];
      return (data ?? []).map((r) => r.role as AppRole);
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const roles = query.data ?? [];
  const isAdmin = roles.includes("admin");
  const isModerator = roles.includes("moderator");
  const isTeam = isAdmin || isModerator;

  let tier: "guest" | "student" | "team" = "guest";
  if (user) tier = isTeam ? "team" : "student";

  const roleLabel = isAdmin
    ? "Admin"
    : isModerator
      ? "Curriculum Lead"
      : "Student";

  return {
    tier,
    roles,
    isAdmin,
    isModerator,
    isTeam,
    roleLabel,
    loading: authLoading || query.isLoading,
  };
};

export const useAchievementCount = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["achievementCount", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count, error } = await supabase
        .from("user_achievements")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);
      if (error) return 0;
      return count ?? 0;
    },
    enabled: !!user,
  });
};