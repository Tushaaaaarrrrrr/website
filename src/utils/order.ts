import type { WebsiteOrder } from '../types/app';

export function getOrderCourseNames(order: WebsiteOrder): string[] {
  if (Array.isArray(order.courseNames) && order.courseNames.length > 0) {
    return order.courseNames;
  }

  return order.courseName ? [order.courseName] : [];
}

export function getOrderCourseIds(order: WebsiteOrder): string[] {
  if (Array.isArray(order.courseIds) && order.courseIds.length > 0) {
    return order.courseIds;
  }

  return order.courseId ? [order.courseId] : [];
}
