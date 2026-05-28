export type {
  Course,
  CourseCategory,
  CourseListResponse,
  CourseStatus,
  EnrollmentFormValues,
  EnrollmentType,
  Participant,
  Step,
} from '@/types/enrollment'

export interface EnrollmentRequest {
  courseId: string
  enrollmentType: 'INDIVIDUAL' | 'GROUP'
  individual?: {
    name: string
    email: string
    phone: string
    motivation?: string
  }
  group?: {
    name: string
    email: string
    phone: string
    motivation?: string
    organizationName: string
    headCount: number
    participants: Array<{ name: string; email: string }>
    managerPhone: string
  }
}

export interface EnrollmentResponse {
  enrollmentId: string
  message: string
  createdAt: string
}
