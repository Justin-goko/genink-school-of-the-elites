import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface UserXP {
  id: string;
  user_id: string;
  total_xp: number;
  current_level: number;
  streak_days: number;
  last_activity_date: string | null;
}

export interface UserProgress {
  id: string;
  user_id: string;
  module_id: string;
  completed: boolean;
  completed_at: string | null;
  score: number;
  time_spent_seconds: number;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string;
  module_type: "free" | "premium";
  order_index: number;
  xp_reward: number;
  estimated_minutes: number;
  content: Record<string, unknown>;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  badge_type: string;
  icon: string;
  xp_reward: number;
  requirement_value: number;
}

export const useUserXP = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["userXP", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("user_xp")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data as UserXP | null;
    },
    enabled: !!user,
  });
};

export const useModules = (courseId?: string) => {
  return useQuery({
    queryKey: ["modules", courseId],
    queryFn: async () => {
      let query = supabase
        .from("modules")
        .select("*")
        .order("order_index", { ascending: true });

      if (courseId) {
        query = query.eq("course_id", courseId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Module[];
    },
  });
};

export const useUserModuleProgress = (courseId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["userProgress", user?.id, courseId],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from("user_progress")
        .select(`
          *,
          modules!inner(course_id)
        `)
        .eq("user_id", user.id);

      if (courseId) {
        query = query.eq("modules.course_id", courseId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as (UserProgress & { modules: { course_id: string } })[];
    },
    enabled: !!user,
  });
};

export const useAchievements = () => {
  return useQuery({
    queryKey: ["achievements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .order("xp_reward", { ascending: true });

      if (error) throw error;
      return data as Achievement[];
    },
  });
};

export const useUserAchievements = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["userAchievements", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("user_achievements")
        .select(`
          *,
          achievements(*)
        `)
        .eq("user_id", user.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useCompleteModule = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ moduleId, score, timeSpent }: { moduleId: string; score?: number; timeSpent?: number }) => {
      if (!user) throw new Error("Not authenticated");

      // Get module details for XP
      const { data: module } = await supabase
        .from("modules")
        .select("xp_reward, title")
        .eq("id", moduleId)
        .single();

      // Upsert progress
      const { error: progressError } = await supabase
        .from("user_progress")
        .upsert({
          user_id: user.id,
          module_id: moduleId,
          completed: true,
          completed_at: new Date().toISOString(),
          score: score || 100,
          time_spent_seconds: timeSpent || 0,
        }, {
          onConflict: "user_id,module_id",
        });

      if (progressError) throw progressError;

      // Update XP
      const { data: currentXP } = await supabase
        .from("user_xp")
        .select("total_xp, current_level, streak_days, last_activity_date")
        .eq("user_id", user.id)
        .single();

      const today = new Date().toISOString().split("T")[0];
      const lastActivity = currentXP?.last_activity_date;
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

      let newStreakDays = 1;
      if (lastActivity === yesterday) {
        newStreakDays = (currentXP?.streak_days || 0) + 1;
      } else if (lastActivity === today) {
        newStreakDays = currentXP?.streak_days || 1;
      }

      const newTotalXP = (currentXP?.total_xp || 0) + (module?.xp_reward || 50);
      const newLevel = Math.floor(newTotalXP / 500) + 1;

      await supabase
        .from("user_xp")
        .upsert({
          user_id: user.id,
          total_xp: newTotalXP,
          current_level: newLevel,
          streak_days: newStreakDays,
          last_activity_date: today,
        }, {
          onConflict: "user_id",
        });

      return { xpEarned: module?.xp_reward || 50, moduleName: module?.title };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["userProgress"] });
      queryClient.invalidateQueries({ queryKey: ["userXP"] });
      toast({
        title: `+${data.xpEarned} XP Earned! 🎉`,
        description: `You completed "${data.moduleName}"`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Calculate level from XP
export const calculateLevel = (xp: number) => Math.floor(xp / 500) + 1;

// Calculate XP needed for next level
export const xpToNextLevel = (xp: number) => {
  const currentLevel = calculateLevel(xp);
  const xpForNextLevel = currentLevel * 500;
  return xpForNextLevel - xp;
};

// Calculate progress percentage to next level
export const levelProgress = (xp: number) => {
  const currentLevel = calculateLevel(xp);
  const xpForCurrentLevel = (currentLevel - 1) * 500;
  const xpForNextLevel = currentLevel * 500;
  return ((xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;
};
