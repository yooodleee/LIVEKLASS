export type EnrollmentType = 'INDIVIDUAL' | 'GROUP'
export type Step = 1 | 2 | 3
export type CourseStatus = 'OPEN' | 'CLOSED' | 'FULL'

export interface Course {
  id: string
  title: string
  instructor: string
  status: CourseStatus
  maxCapacity: number
  currentCount: number
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
