import type { VercelRequest, VercelResponse } from '@vercel/node';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// /api/create-order — Securely initialize a Razorpay Order
// ---------------------------------------------------------------------------

const RAZORPAY_KEY_ID = process.env.VITE_RAZORPAY_KEY_ID;
const RAZORPAY_SECRET = process.env.RAZORPAY_SECRET;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  if (!RAZORPAY_KEY_ID || !RAZORPAY_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[create-order] Missing configuration in environment');
    return res.status(500).json({ success: false, message: 'Server configuration error' });
  }

  const { websiteCourseId, selectedLmsIds, userId, email, userName } = req.body;

  const normalizedLmsIds = Array.isArray(selectedLmsIds)
    ? [...new Set(selectedLmsIds.filter((id): id is string => typeof id === 'string' && id.trim().length > 0))]
    : [];

  if (!websiteCourseId || normalizedLmsIds.length === 0 || !userId || !email) {
    return res.status(400).json({ success: false, message: 'Missing course selection or user details' });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Look up the parent website course
    const { data: course, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', websiteCourseId)
      .single();

    if (error || !course) {
      console.error('[create-order] Course lookup failed', error);
      return res.status(400).json({ success: false, message: 'Invalid course selection' });
    }

    let totalAmount = 0;
    let courseNames: string[] = [];

    if (course.isBundle && course.bundleItems) {
      // Calculate from bundleItems
      const selectedItems = course.bundleItems.filter((item: any) => normalizedLmsIds.includes(item.courseId));
      if (selectedItems.length !== normalizedLmsIds.length) {
         return res.status(400).json({ success: false, message: 'Invalid bundle item selection' });
      }
      totalAmount = selectedItems.reduce((sum: number, item: any) => sum + Number(item.price || 0), 0);
      courseNames = selectedItems.map((item: any) => item.courseName || item.courseId);
    } else {
      // Single course
      if (!course.lms_id || !normalizedLmsIds.includes(course.lms_id)) {
         return res.status(400).json({ success: false, message: 'LMS ID mismatch for single course' });
      }
      totalAmount = Number(course.discountPrice || course.price || 0);
      courseNames = [course.name];
    }

    const amountInPaise = Math.round(totalAmount * 100);

    const razorpay = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });

    const { error: insertError } = await supabase.from('website_orders').upsert({
      orderId: order.id,
      userId,
      userName: typeof userName === 'string' ? userName.trim() || null : null,
      userEmail: String(email).trim().toLowerCase(),
      courseId: course.id, // The parent website course ID
      courseName: course.name,
      courseIds: normalizedLmsIds, // The LMS IDs to fulfill
      courseNames: courseNames,
      courseCount: normalizedLmsIds.length,
      amount: totalAmount,
      paymentStatus: 'CREATED',
      enrollmentStatus: 'PENDING',
      source: 'WEBSITE',
      updatedAt: new Date().toISOString(),
    }, {
      onConflict: 'orderId',
    });

    if (insertError) {
      console.error('[create-order] Failed to persist website order', insertError);
      return res.status(500).json({ success: false, message: 'Failed to persist website order' });
    }

    return res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error: any) {
    console.error('[create-order] Razorpay error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create payment order'
    });
  }
}
