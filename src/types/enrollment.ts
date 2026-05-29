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

// Step 1 및 두 신청 유형 공통 필드
type BaseFormValues = {
  courseId: string
  name: string | undefined
  email: string | undefined
  phone: string | undefined
  motivation: string | undefined
  participants: Participant[]
}

// 개인 신청: GROUP 전용 필드를 never로 봉쇄하여 타입 레벨에서 혼입 차단
export type IndividualFormValues = BaseFormValues & {
  enrollmentType: 'INDIVIDUAL'
  organizationName?: never
  headCount?: never
  managerPhone?: never
}

// 단체 신청: GROUP 전용 필드 전부 포함
export type GroupFormValues = BaseFormValues & {
  enrollmentType: 'GROUP'
  organizationName: string | undefined
  headCount: number | undefined
  managerPhone: string | undefined
}

// enrollmentType을 판별자로 하는 discriminated union
// - RHF v7은 union 타입을 FieldPath 추론으로 지원하므로 register/setValue/trigger 모두 사용 가능
// - enrollmentType으로 좁힌 후 GROUP 전용 필드가 string | undefined로, INDIVIDUAL에서는 never로 추론됨
export type EnrollmentFormValues = IndividualFormValues | GroupFormValues
