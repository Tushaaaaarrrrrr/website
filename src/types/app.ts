export type WebsiteRole = 'MANAGER' | 'STUDENT';

export type PaymentStatus = 'CREATED' | 'FAILED' | 'PAID';

export type EnrollmentStatus = 'PENDING' | 'FAILED' | 'ENROLLED';

export type ActivityAction =
  | 'VISIT'
  | 'FAILED_PURCHASE'
  | 'SUCCESS_PURCHASE'
  | 'SUPPORT_TICKET'
  | string;

export interface Profile {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  gender: string | null;
  role: WebsiteRole;
  rawRole?: string | null;
}

export interface BundleItem {
  courseId: string;
  courseName: string;
  price: number;
}

export interface Course {
  id: string;
  lms_id?: string | null;
  googleGroupEmail?: string | null;
  name: string;
  subtitle?: string | null;
  category?: string | null;
  description: string;
  price: number;
  discountPrice?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  isBundle?: boolean;
  bundleItems?: BundleItem[] | null;
  isPinned?: boolean;
  learn?: string[];
  who?: string;
  outcomes?: string;
  createdAt?: string;
}

export interface WebsiteOrder {
  id: string;
  orderId: string;
  userId: string;
  userName: string | null;
  userEmail: string;
  courseIds?: string[] | null;
  courseNames?: string[] | null;
  courseCount?: number | null;
  courseId: string;
  courseName: string;
  amount: number;
  paymentStatus: PaymentStatus;
  enrollmentStatus: EnrollmentStatus;
  paymentId: string | null;
  source: 'WEBSITE';
  createdAt: string;
  updatedAt: string;
  paidAt: string | null;
  failureReason?: string | null;
}

export interface ActivityLog {
  id: string;
  userId: string | null;
  userName: string | null;
  email: string | null;
  action: ActivityAction;
  courseId: string | null;
  courseName: string | null;
  metadata: Record<string, unknown> | null;
  timestamp: string;
}
