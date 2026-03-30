import type { VercelRequest, VercelResponse } from '@vercel/node';
import Razorpay from 'razorpay';

// ---------------------------------------------------------------------------
// /api/create-order — Securely initialize a Razorpay Order
// ---------------------------------------------------------------------------

const RAZORPAY_KEY_ID = process.env.VITE_RAZORPAY_KEY_ID;
const RAZORPAY_SECRET = process.env.RAZORPAY_SECRET;

// Server-side source of truth for pricing (in paise)
const COURSE_PRICING_BACKEND: Record<string, number> = {
  'python-data-science': 100,    // ₹1
  'deep-learning':       39900,  // ₹399
  'advanced-ai':         49900,  // ₹499
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  if (!RAZORPAY_KEY_ID || !RAZORPAY_SECRET) {
    console.error('[create-order] Missing Razorpay credentials in environment');
    return res.status(500).json({ success: false, message: 'Server configuration error' });
  }

  const { courseId } = req.body;

  if (!courseId || !COURSE_PRICING_BACKEND[courseId]) {
    return res.status(400).json({ success: false, message: 'Invalid or missing courseId' });
  }

  const amount = COURSE_PRICING_BACKEND[courseId];

  try {
    const razorpay = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: amount,
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
