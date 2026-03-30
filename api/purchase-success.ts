import type { VercelRequest, VercelResponse } from '@vercel/node';
import Razorpay from 'razorpay';
import crypto from 'node:crypto';

// ---------------------------------------------------------------------------
// /api/purchase-success — Secure bridge between payment and LMS enrollment
// ---------------------------------------------------------------------------
// Accepts POST { email, name, courseId }
// Attaches the server-side secret and forwards to the LMS external-enroll API.
// Retries once on failure. Treats "already enrolled" as success.
// ---------------------------------------------------------------------------

const LMS_API_URL = process.env.LMS_API_URL; // e.g. https://teaching-llm.onrender.com
const EXTERNAL_ENROLL_SECRET = process.env.EXTERNAL_ENROLL_SECRET;
const RAZORPAY_SECRET = process.env.RAZORPAY_SECRET;

/** Allowed course IDs — whitelist to prevent arbitrary courseId injection */
const VALID_COURSE_IDS: Record<string, string> = {
  'python-data-science': 'cmnbmadrs000813fx1bwloni6',
  // Add more courses here as they become available on LMS
};

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

/**
 * Call the LMS external-enroll endpoint.
 * Returns the parsed JSON response, status code, and status text.
 */
async function callLmsEnroll(payload: {
  secret: string;
  email: string;
  name: string;
  phone: string;
  gender?: string;
  courseId: string;
}): Promise<{ status: number; statusText: string; body: any }> {
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
    console.error(`[LMS Error] Failed to parse response from ${url}:`, error);
    body = { message: 'Failed to parse LMS response' };
  }

  return { 
    status: res.status, 
    statusText: res.statusText, 
    body 
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // ── Method guard ──────────────────────────────────────────────
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  // ── Environment guard ─────────────────────────────────────────
  if (!LMS_API_URL || !EXTERNAL_ENROLL_SECRET) {
    console.error('[purchase-success] Missing environment variables: LMS_API_URL or EXTERNAL_ENROLL_SECRET');
    return res.status(500).json({ success: false, message: 'Server configuration error' });
  }

  // ── Parse & validate body ─────────────────────────────────────
  const { 
    email, 
    name, 
    phone, 
    gender, 
    courseId,
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature 
  } = req.body as EnrollPayload;

  if (!email || !name || !phone || !courseId || !razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: email, name, phone, courseId, or payment details',
    });
  }

  // Basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'Invalid email format' });
  }

  // Phone validation (numeric only, 7-15 digits)
  if (!/^[0-9]{7,15}$/.test(phone)) {
    return res.status(400).json({ success: false, message: 'Invalid phone format' });
  }

  // ── Razorpay Signature Verification ───────────────────────────
  if (!RAZORPAY_SECRET) {
    console.error('[purchase-success] RAZORPAY_SECRET not set');
    return res.status(500).json({ success: false, message: 'Server configuration error' });
  }

  try {
    const generatedSignature = crypto
      .createHmac('sha256', RAZORPAY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    console.log(`[purchase-success] Generated Signature: ${generatedSignature}`);
    console.log(`[purchase-success] Received Signature: ${razorpay_signature}`);

    if (generatedSignature !== razorpay_signature) {
      console.warn(`[purchase-success] Invalid signature for order: ${razorpay_order_id}`);
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }
    console.log(`[purchase-success] Signature verified for order: ${razorpay_order_id}`);
  } catch (error) {
    console.error('[purchase-success] Signature verification error:', error);
    return res.status(500).json({ success: false, message: 'Error verifying payment signature' });
  }

  // Map website slug → LMS course ID
  const lmsCourseId = VALID_COURSE_IDS[courseId];
  if (!lmsCourseId) {
    return res.status(400).json({
      success: false,
      message: `Unknown courseId: ${courseId}`,
    });
  }

  // ── Build LMS payload (secret never leaves server) ────────────
  const lmsPayload = {
    secret: EXTERNAL_ENROLL_SECRET,
    email: email.trim().toLowerCase(),
    name: name.trim(),
    phone: phone.trim(),
    gender: gender,
    courseId: lmsCourseId,
  };

  // ── Call LMS (with one retry on failure) ──────────────────────
  let attempt = 0;
  const MAX_ATTEMPTS = 2;

  while (attempt < MAX_ATTEMPTS) {
    attempt++;
    try {
      // [LMS Request] logs
      console.log(`[LMS Request] (Attempt ${attempt}/${MAX_ATTEMPTS})`);
      console.log(`[LMS Request] URL: ${LMS_API_URL}/api/external-enroll`);
      console.log(`[LMS Request] Course: ${courseId} -> ${lmsCourseId}`);
      console.log(`[LMS Request] Payload: ${JSON.stringify({ ...lmsPayload, secret: '[REDACTED]' })}`);
      console.log(`[LMS Request] Secret Present: ${!!EXTERNAL_ENROLL_SECRET}`);

      const { status, statusText, body } = await callLmsEnroll(lmsPayload);

      // [LMS Response] logs
      console.log(`[LMS Response] Status: ${status} ${statusText}`);
      console.log(`[LMS Response] Body:`, JSON.stringify(body, null, 2));

      // Success or already enrolled → treat as success
      if (status >= 200 && status < 300) {
        console.log(`[LMS Request] ✅ Enrollment successful:`, body);
        return res.status(200).json({
          success: true,
          message: body?.message || 'Enrollment successful',
          alreadyEnrolled: body?.alreadyEnrolled || false,
        });
      }

      // ── LMS Error Handling ────────────────────────────────────
      let errorMessage = 'Enrollment service unavailable';
      if (status === 401) errorMessage = 'Unauthorized (check secret)';
      else if (status === 404) errorMessage = 'Course not found';
      else if (status === 500) errorMessage = 'LMS server error';
      
      // If LMS provided a message, include it
      const lmsMessage = body?.message || (typeof body === 'string' ? body : '');
      const finalError = lmsMessage ? `${errorMessage}: ${lmsMessage}` : errorMessage;

      console.error(`[LMS Error] ${status} ${statusText}: ${finalError}`);

      // If this was the last attempt, return the error
      if (attempt >= MAX_ATTEMPTS) {
        return res.status(status >= 500 ? 502 : status).json({
          success: false,
          message: finalError,
          lmsStatus: status
        });
      }

      // Otherwise, retry after a short delay
      console.log(`[LMS Request] Retrying in 1 second...`);
      await new Promise((r) => setTimeout(r, 1000));
    } catch (err: any) {
      console.error(`[LMS Error] Network or internal error (attempt ${attempt}):`, err?.message || err);

      if (attempt >= MAX_ATTEMPTS) {
        return res.status(502).json({
          success: false,
          message: `Unable to reach enrollment service: ${err?.message || 'Unknown network error'}`
        });
      }

      console.log(`[LMS Request] Retrying in 1 second...`);
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}
