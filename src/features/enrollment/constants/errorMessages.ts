export const ENROLLMENT_ERROR_MESSAGES = {
  COURSE_FULL:
    '선택하신 강의의 정원이 마감되었습니다. 다른 강의를 선택해 주세요.',
  DUPLICATE_ENROLLMENT: '이미 신청한 강의입니다.',
  INVALID_HEAD_COUNT: '신청 인원이 잔여석을 초과합니다.',
  UNKNOWN: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
} as const

export type EnrollmentErrorCode = keyof typeof ENROLLMENT_ERROR_MESSAGES
