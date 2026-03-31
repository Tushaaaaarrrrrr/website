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

  const { courseIds, userId, email, userName } = req.body;

  const normalizedCourseIds = Array.isArray(courseIds)
    ? [...new Set(courseIds.filter((courseId): courseId is string => typeof courseId === 'string' && courseId.trim().length > 0))]
    : [];

  if (normalizedCourseIds.length === 0 || !userId || !email) {
    return res.status(400).json({ success: false, message: 'Missing course selection or user details' });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: courses, error } = await supabase
      .from('courses')
      .select('id, name, price')
      .in('id', normalizedCourseIds);

    if (error || !courses || courses.length !== normalizedCourseIds.length) {
      console.error('[create-order] Course lookup failed', error);
      return res.status(400).json({ success: false, message: 'Invalid course selection' });
    }

    const orderedCourses = normalizedCourseIds
      .map((courseId) => courses.find((course) => course.id === courseId))
      .filter((course): course is { id: string; name: string; price: number } => Boolean(course));

    const totalAmount = orderedCourses.reduce((sum, course) => sum + Number(course.price), 0);
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
      courseId: orderedCourses[0].id,
      courseName: orderedCourses[0].name,
      courseIds: orderedCourses.map((course) => course.id),
      courseNames: orderedCourses.map((course) => course.name),
      courseCount: orderedCourses.length,
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
