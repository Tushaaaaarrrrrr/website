// ---------------------------------------------------------------------------
// Course Slug → LMS Course ID mapping
// ---------------------------------------------------------------------------
// The website uses URL-friendly slugs (e.g. "python-data-science")
// but the LMS uses its own internal IDs. This map bridges the two.
//
// ⚠️ When adding a new course:
//   1. Add the slug + LMS ID here
//   2. Also add it to the VALID_COURSE_IDS whitelist in api/purchase-success.ts
// ---------------------------------------------------------------------------

export const COURSE_LMS_MAP: Record<string, string> = {
  'python-data-science': 'LMS-COURSE-cmnbmadrs000813fx1bwloni6',
  // 'deep-learning': 'LMS-COURSE-...',      // Add when available
  // 'advanced-ai':   'LMS-COURSE-...',       // Add when available
};

/**
 * Check if a course slug has a corresponding LMS course ID.
 */
export function hasLmsCourseId(slug: string): boolean {
  return slug in COURSE_LMS_MAP;
}

/**
 * Get the LMS course ID for a given website course slug.
 * Returns undefined if the course doesn't have an LMS mapping yet.
 */
export function getLmsCourseId(slug: string): string | undefined {
  return COURSE_LMS_MAP[slug];
}
