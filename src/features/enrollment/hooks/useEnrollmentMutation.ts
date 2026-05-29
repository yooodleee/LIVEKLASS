import { useMutation } from '@tanstack/react-query'

import type { EnrollmentRequest, EnrollmentResponse, ErrorResponse } from '@/types/enrollments'
import { isErrorResponse } from '@/types/enrollments'

async function submitEnrollment(request: EnrollmentRequest): Promise<EnrollmentResponse> {
  let res: Response

  try {
    res = await fetch('/api/enrollments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })
  } catch {
    // fetch 자체 실패 = 오프라인 / DNS 실패 / 타임아웃 등 네트워크 에러
    throw { code: 'NETWORK_ERROR', message: '네트워크 연결을 확인해 주세요.' } satisfies ErrorResponse
  }

  if (!res.ok) {
    try {
      const body = (await res.json()) as ErrorResponse
      // JSON 파싱 성공 → 비즈니스 에러 (code 포함 구조화된 응답)
      throw body
    } catch (e) {
      if (isErrorResponse(e)) throw e
      // JSON 파싱 실패 = 502·503 등 서버가 HTML 에러 페이지를 반환한 경우
      throw { code: 'SERVER_ERROR', message: '서버 오류가 발생했습니다.' } satisfies ErrorResponse
    }
  }

  return res.json() as Promise<EnrollmentResponse>
}

export function useEnrollmentMutation() {
  return useMutation<EnrollmentResponse, unknown, EnrollmentRequest>({
    mutationFn: submitEnrollment,
  })
}
