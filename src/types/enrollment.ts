export type EnrollmentType = 'INDIVIDUAL' | 'GROUP'
export type Step = 1 | 2 | 3
export type CourseStatus = 'OPEN' | 'ALMOST_FULL' | 'FULL'
export type CourseCategory = 'development' | 'design' | 'marketing' | 'business'

export interface Course {
  id: string
  title: string
  instructor: string
  category: CourseCategory
  description: string
  schedule: string
  price: number
  maxCapacity: number
  currentEnrollment: number
}

export interface CourseListResponse {
  courses: Course[]
  total: number
}

export interface Participant {
  name: string
  email: string
}

export interface EnrollmentFormValues {
  // Step 1
  courseId: string
  enrollmentType: EnrollmentType
  // Step 2 - common (string | undefined before filled)
  name: string | undefined
  email: string | undefined
  phone: string | undefined
  motivation: string | undefined
  // Step 2 - GROUP only (set to undefined when switching to INDIVIDUAL)
  organizationName: string | undefined
  headCount: number | undefined
  participants: Participant[]
  managerPhone: string | undefined
}
