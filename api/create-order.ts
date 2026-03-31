import type { VercelRequest, VercelResponse } from '@vercel/node';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// /api/create-order — Securely initialize a Razorpay Order
// ---------------------------------------------------------------------------

const RAZORPAY_KEY_ID = process.env.VITE_RAZORPAY_KEY_ID;
const RAZORPAY_SECRET = process.env.RAZORPAY_SECRET;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  if (!RAZORPAY_KEY_ID || !RAZORPAY_SECRET || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('[create-order] Missing configuration in environment');
    return res.status(500).json({ success: false, message: 'Server configuration error' });
  }

  const { courseId } = req.body;

  if (!courseId) {
    return res.status(400).json({ success: false, message: 'Missing courseId' });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: course, error } = await supabase.from('courses').select('price').eq('id', courseId).single();

    if (error || !course) {
      console.error('[create-order] Course not found or db error', error);
      return res.status(400).json({ success: false, message: 'Invalid courseId' });
    }

    const amountInPaise = Math.round(course.price * 100);

    const razorpay = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });

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
