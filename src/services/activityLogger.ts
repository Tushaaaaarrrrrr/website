import { supabase } from '../lib/supabase';

interface ActivityLogParams {
  userId?: string;
  email?: string;
  action: 'PURCHASE' | 'VISIT_CHECKOUT' | 'PAYMENT_FAILED' | 'SUPPORT_TICKET' | string;
  courseId?: string;
  metadata?: any;
}

export const logActivity = async (params: ActivityLogParams) => {
  try {
    const { userId, email, action, courseId, metadata } = params;
    
    // Perform fire-and-forget logging
    const { error } = await supabase.from('activity_logs').insert([{
      userId: userId || null,
      email: email || null,
      action,
      courseId: courseId || null,
      metadata: metadata || null,
    }]);

    if (error) {
      console.error("Failed to log activity:", error);
    }
  } catch (err) {
    console.error("Error in activity logger", err);
  }
};
