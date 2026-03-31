import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';

// ---------------------------------------------------------------------------
// /api/purchase-success — Secure bridge between payment and LMS enrollment
// ---------------------------------------------------------------------------

const LMS_API_URL = process.env.LMS_API_URL;
const EXTERNAL_ENROLL_SECRET = process.env.EXTERNAL_ENROLL_SECRET;
const RAZORPAY_SECRET = process.env.RAZORPAY_SECRET;

// Supabase config for dynamic course lookup
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL || '', SUPABASE_SERVICE_ROLE_KEY || '');

interface EnrollPayload {
  email: string;
  name: string;
  phone: string;
  gender?: string;
  courseId: string; // website slug e.g. "python-data-science"
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

async function callLmsEnroll(payload: {
  secret: string;
  email: string;
  name: string;
  phone: string;
  gender?: string;
  courseId: string;
}) {
  const url = `${LMS_API_URL}/api/external-enroll`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  let body: any;
  const contentType = res.headers.get('content-type');
  try {
    if (contentType && contentType.includes('application/json')) {
      body = await res.json();
    } else {
      body = await res.text();
    }
  } catch (error) {
    body = { message: 'Failed to parse LMS response' };
  }

  return { status: res.status, statusText: res.statusText, body };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

  const { 
    email, name, phone, gender, courseId,
    razorpay_payment_id, razorpay_order_id, razorpay_signature 
  } = req.body as EnrollPayload;

  if (!email || !name || !phone || !courseId || !razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  // 1. Signature Verification
  if (!RAZORPAY_SECRET) {
    console.error('[purchase-success] RAZORPAY_SECRET not set');
    return res.status(500).json({ success: false, message: 'Server configuration error' });
  }
  
  try {
    const generatedSignature = crypto
      .createHmac('sha256', RAZORPAY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error verifying payment signature' });
  }

  // 2. Dynamic Course Lookup
  const { data: courseData, error: dbError } = await supabase
    .from('courses')
    .select('lms_id')
    .eq('id', courseId)
    .single();

  if (dbError || !courseData?.lms_id) {
    console.error(`[purchase-success] Course lookup failed for ${courseId}:`, dbError?.message);
    return res.status(404).json({ success: false, message: 'Course configuration incomplete. Contact support.' });
  }

  // 3. LMS Enrollment (with retry)
  const lmsPayload = {
    secret: EXTERNAL_ENROLL_SECRET!,
    email: email.trim().toLowerCase(),
    name: name.trim(),
    phone: phone.trim(),
    gender: (gender || 'MALE').toUpperCase(),
    courseId: courseData.lms_id,
  };

  let attempt = 0;
  const MAX_ATTEMPTS = 2;
  while (attempt < MAX_ATTEMPTS) {
    attempt++;
    try {
      const { status, body } = await callLmsEnroll(lmsPayload);
      
      if (status >= 200 && status < 300) {
        return res.status(200).json({
          success: true,
          message: body?.message || 'Enrollment successful',
          alreadyEnrolled: body?.alreadyEnrolled || false,
        });
      }

      if (attempt >= MAX_ATTEMPTS) {
        return res.status(status >= 500 ? 502 : status).json({
          success: false,
          message: body?.message || 'Enrollment failed',
        });
      }
      await new Promise(r => setTimeout(r, 1000));
    } catch (err) {
      if (attempt >= MAX_ATTEMPTS) {
        return res.status(502).json({ success: false, message: 'LMS service unreachable' });
      }
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}
