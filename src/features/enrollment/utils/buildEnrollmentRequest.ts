import type { EnrollmentFormValues } from '@/types/enrollment'
import type { EnrollmentRequest } from '@/types/enrollments'

/**
 * EnrollmentFormValues → API EnrollmentRequest 변환
 * - enrollmentType 'INDIVIDUAL' → type 'personal'
 * - enrollmentType 'GROUP'      → type 'group'
 * - managerPhone               → group.contactPerson 매핑
 */
export function buildEnrollmentRequest(
  values: EnrollmentFormValues,
  agreedToTerms: boolean,
): EnrollmentRequest {
  const applicant = {
    name: values.name ?? '',
    email: values.email ?? '',
    phone: values.phone ?? '',
    ...(values.motivation ? { motivation: values.motivation } : {}),
  }

  if (values.enrollmentType === 'INDIVIDUAL') {
    return {
      courseId: values.courseId,
      type: 'personal',
      applicant,
      agreedToTerms,
    }
  }

  return {
    courseId: values.courseId,
    type: 'group',
    applicant,
    group: {
      organizationName: values.organizationName ?? '',
      headCount: values.headCount ?? 0,
      participants: values.participants,
      contactPerson: values.managerPhone ?? '',
    },
    agreedToTerms,
  }
}
