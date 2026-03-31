import { supabase } from '../lib/supabase';
import type { WebsiteOrder } from '../types/app';

export async function fetchStudentOrders(userId: string): Promise<WebsiteOrder[]> {
  const { data, error } = await supabase
    .from('website_orders')
    .select('*')
    .eq('userId', userId)
    .order('createdAt', { ascending: false });

  if (error) {
    throw error;
  }

  return (data as WebsiteOrder[]) ?? [];
}

export async function fetchWebsiteOrders(): Promise<WebsiteOrder[]> {
  const { data, error } = await supabase
    .from('website_orders')
    .select('*')
    .order('createdAt', { ascending: false });

  if (error) {
    throw error;
  }

  return (data as WebsiteOrder[]) ?? [];
}

export async function markOrderFailed(orderId: string, failureReason: string) {
  const { error } = await supabase
    .from('website_orders')
    .update({
      paymentStatus: 'FAILED',
      enrollmentStatus: 'FAILED',
      failureReason,
      updatedAt: new Date().toISOString(),
    })
    .eq('orderId', orderId);

  if (error) {
    throw error;
  }
}
