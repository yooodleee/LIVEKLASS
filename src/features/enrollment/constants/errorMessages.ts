export const ENROLLMENT_ERROR_MESSAGES = {
  COURSE_FULL:
    '선택하신 강의의 정원이 마감되었습니다. 강의 선택 단계로 돌아가 다른 강의를 선택해 주세요.',
  DUPLICATE_ENROLLMENT: '이미 신청한 강의입니다. 신청 내역을 확인해 주세요.',
  INVALID_INPUT: '입력 정보를 다시 확인해 주세요.',
  NETWORK_ERROR: '네트워크 연결을 확인하고 다시 시도해 주세요.',
  SERVER_ERROR: '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
  UNKNOWN: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
} as const

export type EnrollmentErrorCode = keyof typeof ENROLLMENT_ERROR_MESSAGES
