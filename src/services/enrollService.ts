// ---------------------------------------------------------------------------
// enrollService.ts — Frontend utility for post-purchase LMS enrollment
// ---------------------------------------------------------------------------
// Calls the backend /api/purchase-success route.
// NEVER calls the LMS API directly. NEVER sends the secret.
// ---------------------------------------------------------------------------

export interface EnrollRequest {
  email: string;
  name: string;
  phone: string;
  gender?: string;
  courseId: string; // website slug, e.g. "python-data-science"
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface EnrollResponse {
  success: boolean;
  message: string;
  alreadyEnrolled?: boolean;
}

/**
 * Call the backend enrollment bridge after a successful payment.
 *
 * Usage (from a payment success callback):
 * ```ts
 * import { enrollAfterPurchase } from '../services/enrollService';
 *
 * const result = await enrollAfterPurchase({
 *   email: 'student@example.com',
 *   name: 'Student Name',
 *   courseId: 'python-data-science',
 * });
 *
 * if (result.success) {
 *   // Show success message, redirect, etc.
 * } else {
 *   // Show error to user
 * }
 * ```
 */
export async function enrollAfterPurchase(
  data: EnrollRequest,
): Promise<EnrollResponse> {
  try {
    const res = await fetch('/api/purchase-success', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: data.email,
        name: data.name,
        phone: data.phone,
        gender: data.gender,
        courseId: data.courseId,
        razorpay_payment_id: data.razorpay_payment_id,
        razorpay_order_id: data.razorpay_order_id,
        razorpay_signature: data.razorpay_signature,
      }),
    });

    const body = await res.json();

    if (res.ok && body.success) {
      return {
        success: true,
        message: body.message || 'Enrollment successful!',
        alreadyEnrolled: body.alreadyEnrolled || false,
      };
    }

    // Server responded with an error
    return {
      success: false,
      message: body.message || 'Enrollment failed. Please try again.',
    };
  } catch (err) {
    // Network error or server unreachable
    console.error('[enrollService] Network error:', err);
    return {
      success: false,
      message: 'Network error. Please check your connection and try again.',
    };
  }
}
