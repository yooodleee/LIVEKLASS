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

export interface IndividualFields {
  name: string
  email: string
  phone: string
}

export interface GroupFields {
  organizationName: string
  managerName: string
  managerEmail: string
  managerPhone: string
  headCount: number
}

export interface EnrollmentFormValues {
  // Step 1
  courseId: string
  // Step 2
  enrollmentType: EnrollmentType
  individual?: IndividualFields
  group?: GroupFields
}
