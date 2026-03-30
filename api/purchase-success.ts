import type { VercelRequest, VercelResponse } from '@vercel/node';

// ---------------------------------------------------------------------------
// /api/purchase-success — Secure bridge between payment and LMS enrollment
// ---------------------------------------------------------------------------
// Accepts POST { email, name, courseId }
// Attaches the server-side secret and forwards to the LMS external-enroll API.
// Retries once on failure. Treats "already enrolled" as success.
// ---------------------------------------------------------------------------

const LMS_API_URL = process.env.LMS_API_URL; // e.g. https://teaching-llm.onrender.com
const EXTERNAL_ENROLL_SECRET = process.env.EXTERNAL_ENROLL_SECRET;

/** Allowed course IDs — whitelist to prevent arbitrary courseId injection */
const VALID_COURSE_IDS: Record<string, string> = {
  'python-data-science': 'LMS-COURSE-cmnbmadrs000813fx1bwloni6',
  // Add more courses here as they become available on LMS
};

interface EnrollPayload {
  email: string;
  name: string;
  courseId: string; // website slug e.g. "python-data-science"
}

/**
 * Call the LMS external-enroll endpoint.
 * Returns the parsed JSON response and HTTP status.
 */
async function callLmsEnroll(payload: {
  secret: string;
  email: string;
  name: string;
  courseId: string;
}): Promise<{ status: number; body: any }> {
  const url = `${LMS_API_URL}/api/external-enroll`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  let body: any;
  try {
    body = await res.json();
  } catch {
    body = { message: 'Non-JSON response from LMS' };
  }

  return { status: res.status, body };
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
  const { email, name, courseId } = req.body as EnrollPayload;

  if (!email || !name || !courseId) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: email, name, courseId',
    });
  }

  // Basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'Invalid email format' });
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
    courseId: lmsCourseId,
  };

  console.log(`[purchase-success] Enrolling ${email} in ${courseId} (${lmsCourseId})`);

  // ── Call LMS (with one retry on failure) ──────────────────────
  let attempt = 0;
  const MAX_ATTEMPTS = 2;

  while (attempt < MAX_ATTEMPTS) {
    attempt++;
    try {
      const { status, body } = await callLmsEnroll(lmsPayload);

      // Success or already enrolled → treat as success
      if (status >= 200 && status < 300) {
        console.log(`[purchase-success] ✅ Enrollment successful (attempt ${attempt}):`, body);
        return res.status(200).json({
          success: true,
          message: body?.message || 'Enrollment successful',
          alreadyEnrolled: body?.alreadyEnrolled || false,
        });
      }

      // LMS returned an error
      console.error(
        `[purchase-success] ❌ LMS returned ${status} (attempt ${attempt}):`,
        JSON.stringify(body),
      );

      // If this was the last attempt, return the error
      if (attempt >= MAX_ATTEMPTS) {
        return res.status(502).json({
          success: false,
          message: 'Enrollment service temporarily unavailable. Please try again later.',
        });
      }

      // Otherwise, retry after a short delay
      console.log(`[purchase-success] Retrying in 1 second...`);
      await new Promise((r) => setTimeout(r, 1000));
    } catch (err: any) {
      console.error(
        `[purchase-success] ❌ Network error (attempt ${attempt}):`,
        err?.message || err,
      );

      if (attempt >= MAX_ATTEMPTS) {
        return res.status(502).json({
          success: false,
          message: 'Unable to reach enrollment service. Please try again later.',
        });
      }

      console.log(`[purchase-success] Retrying in 1 second...`);
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}
