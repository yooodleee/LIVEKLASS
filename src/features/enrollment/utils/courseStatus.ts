import type { Course, CourseStatus } from '@/types/enrollment'

const ALMOST_FULL_THRESHOLD = 0.8

export function getCourseStatus(
  course: Pick<Course, 'maxCapacity' | 'currentEnrollment'>,
): CourseStatus {
  const { maxCapacity, currentEnrollment } = course

  if (currentEnrollment >= maxCapacity) return 'FULL'
  if (currentEnrollment >= maxCapacity * ALMOST_FULL_THRESHOLD) return 'ALMOST_FULL'
  return 'OPEN'
}
