export type {
  Course,
  CourseCategory,
  CourseListResponse,
  CourseStatus,
  EnrollmentFormValues,
  EnrollmentType,
  GroupFields,
  IndividualFields,
  Step,
} from '@/types/enrollment'

export interface EnrollmentRequest {
  courseId: string
  enrollmentType: 'INDIVIDUAL' | 'GROUP'
  individual?: {
    name: string
    email: string
    phone: string
  }
  group?: {
    organizationName: string
    managerName: string
    managerEmail: string
    managerPhone: string
    headCount: number
  }
}

export interface EnrollmentResponse {
  enrollmentId: string
  message: string
  createdAt: string
}
