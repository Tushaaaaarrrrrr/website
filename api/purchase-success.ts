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
  userId?: string;
  email: string;
  name: string;
  phone: string;
  gender?: string;
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

async function callGoogleGroupSync(payload: {
  secret: string;
  email: string;
  name: string;
  courseId: string;
  googleGroupEmail: string;
}) {
  const syncUrl = process.env.GOOGLE_GROUP_SYNC_URL;

  if (!syncUrl) {
    return { skipped: true };
  }

  const res = await fetch(syncUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  let body: any;
  try {
    body = await res.json();
  } catch {
    body = await res.text();
  }

  return {
    skipped: false,
    ok: res.ok,
    status: res.status,
    body,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

  const { 
    userId,
    email, name, phone, gender,
    razorpay_payment_id, razorpay_order_id, razorpay_signature 
  } = req.body as EnrollPayload;

  if (!email || !name || !phone || !razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
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

  const { data: orderRecord, error: orderError } = await supabase
    .from('website_orders')
    .select('courseId, courseIds, courseNames, amount')
    .eq('orderId', razorpay_order_id)
    .maybeSingle();

  const lmsCourseIds = Array.isArray(orderRecord?.courseIds)
    ? orderRecord.courseIds.filter((id): id is string => typeof id === 'string')
    : [];
    
  let courseNames = Array.isArray(orderRecord?.courseNames)
    ? orderRecord.courseNames.filter((id): id is string => typeof id === 'string')
    : [];

  if (courseNames.length !== lmsCourseIds.length) {
    courseNames = lmsCourseIds.map(id => `Course ${id}`);
  }

  if (orderError || !orderRecord || lmsCourseIds.length === 0) {
    console.error('[purchase-success] Website order lookup failed', orderError);
    await supabase
      .from('website_orders')
      .update({
        paymentStatus: 'PAID',
        enrollmentStatus: 'FAILED',
        paymentId: razorpay_payment_id,
        failureReason: 'Order not found or invalid configuration',
        paidAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .eq('orderId', razorpay_order_id);

    return res.status(404).json({ success: false, message: 'Website order not found. Contact support.' });
  }

  // Get parent course to check for group sync email
  const { data: parentCourse } = await supabase
    .from('courses')
    .select('googleGroupEmail')
    .eq('id', orderRecord.courseId)
    .maybeSingle();

  const orderedCourses = lmsCourseIds
    .map((lmsId, index) => ({ 
       id: lmsId, 
       name: courseNames[index], 
       lms_id: lmsId,
       googleGroupEmail: parentCourse?.googleGroupEmail || null 
    }));

  const totalAmount = orderRecord.amount || 0;

  if (userId) {
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (existingProfile) {
      await supabase
        .from('profiles')
        .update({
          email: email.trim().toLowerCase(),
          name: name.trim(),
          phone: phone.trim(),
          gender: (gender || 'MALE').toUpperCase(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
    } else {
      await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: email.trim().toLowerCase(),
          name: name.trim(),
          phone: phone.trim(),
          gender: (gender || 'MALE').toUpperCase(),
          role: 'STUDENT',
          updated_at: new Date().toISOString(),
        });
    }
  }

  await supabase
    .from('website_orders')
    .update({
      userId: userId || null,
      userName: name.trim(),
      userEmail: email.trim().toLowerCase(),
      courseId: orderedCourses[0].id,
      courseName: orderedCourses[0].name,
      courseIds: orderedCourses.map((course) => course.id),
      courseNames: orderedCourses.map((course) => course.name),
      courseCount: orderedCourses.length,
      amount: totalAmount,
      paymentStatus: 'PAID',
      paymentId: razorpay_payment_id,
      paidAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .eq('orderId', razorpay_order_id);

  const MAX_ATTEMPTS = 2;

  for (const course of orderedCourses) {
    let attempt = 0;

    while (attempt < MAX_ATTEMPTS) {
      attempt++;

      try {
        const { status, body } = await callLmsEnroll({
          secret: EXTERNAL_ENROLL_SECRET!,
          email: email.trim().toLowerCase(),
          name: name.trim(),
          phone: phone.trim(),
          gender: (gender || 'MALE').toUpperCase(),
          courseId: course.lms_id,
        });

        if (status >= 200 && status < 300) {
          break;
        }

        if (attempt >= MAX_ATTEMPTS) {
          await supabase
            .from('website_orders')
            .update({
              enrollmentStatus: 'FAILED',
              failureReason: body?.message || `Enrollment failed for ${course.name}`,
              updatedAt: new Date().toISOString(),
            })
            .eq('orderId', razorpay_order_id);

          return res.status(status >= 500 ? 502 : status).json({
            success: false,
            message: body?.message || `Enrollment failed for ${course.name}`,
          });
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (err) {
        if (attempt >= MAX_ATTEMPTS) {
          await supabase
            .from('website_orders')
            .update({
              enrollmentStatus: 'FAILED',
              failureReason: `LMS service unreachable for ${course.name}`,
              updatedAt: new Date().toISOString(),
            })
            .eq('orderId', razorpay_order_id);

          return res.status(502).json({ success: false, message: `LMS service unreachable for ${course.name}` });
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  const groupSyncSecret = process.env.GOOGLE_GROUP_SYNC_SECRET;

  if (groupSyncSecret) {
    for (const course of orderedCourses) {
      if (!course.googleGroupEmail) {
        continue;
      }

      try {
        const groupSyncResult = await callGoogleGroupSync({
          secret: groupSyncSecret,
          email: email.trim().toLowerCase(),
          name: name.trim(),
          courseId: course.id,
          googleGroupEmail: course.googleGroupEmail,
        });

        if (!groupSyncResult.skipped && !groupSyncResult.ok) {
          console.error('[purchase-success] Google group sync failed', groupSyncResult);
        }
      } catch (groupError) {
        console.error('[purchase-success] Google group sync error', groupError);
      }
    }
  }

  await supabase
    .from('website_orders')
    .update({
      enrollmentStatus: 'ENROLLED',
      failureReason: null,
      updatedAt: new Date().toISOString(),
    })
    .eq('orderId', razorpay_order_id);

  return res.status(200).json({
    success: true,
    message: `Enrollment successful for ${orderedCourses.length} course${orderedCourses.length === 1 ? '' : 's'}`,
  });
}
