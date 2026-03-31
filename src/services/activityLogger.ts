import { supabase } from '../lib/supabase';
import type { ActivityAction } from '../types/app';

interface ActivityLogParams {
  userId?: string;
  userName?: string | null;
  email?: string;
  action: ActivityAction;
  courseId?: string;
  courseName?: string;
  metadata?: Record<string, unknown> | null;
}

export const logActivity = async (params: ActivityLogParams) => {
  try {
    const { userId, userName, email, action, courseId, courseName, metadata } = params;
    
    const { error } = await supabase.from('activity_logs').insert([{
      userId: userId || null,
      userName: userName || null,
      email: email || null,
      action,
      courseId: courseId || null,
      courseName: courseName || null,
      metadata: metadata || null,
    }]);

    if (error) {
      console.error("Failed to log activity:", error);
    }
  } catch (err) {
    console.error("Error in activity logger", err);
  }
};
