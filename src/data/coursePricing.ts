// ---------------------------------------------------------------------------
// Course Pricing
// ---------------------------------------------------------------------------
// Centralized mapping of course slugs to their price in paise (for Razorpay)
// and their display price (for UI).

export const COURSE_PRICING: Record<string, { paise: number; display: string }> = {
  'python-data-science': { paise: 100, display: '₹1' },
  'deep-learning':       { paise: 39900, display: '₹399' },
  'advanced-ai':         { paise: 49900, display: '₹499' },
};
