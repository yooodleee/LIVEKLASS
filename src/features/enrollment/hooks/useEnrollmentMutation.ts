import { useMutation } from '@tanstack/react-query'

import type { EnrollmentRequest, EnrollmentResponse, ErrorResponse } from '@/types/enrollments'

async function submitEnrollment(request: EnrollmentRequest): Promise<EnrollmentResponse> {
  const res = await fetch('/api/enrollments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })

  if (!res.ok) {
    // 서버 에러 응답을 ErrorResponse 객체로 throw — onError에서 isErrorResponse()로 판별
    const body = (await res.json()) as ErrorResponse
    throw body
  }

  return res.json() as Promise<EnrollmentResponse>
}

export function useEnrollmentMutation() {
  return useMutation<EnrollmentResponse, unknown, EnrollmentRequest>({
    mutationFn: submitEnrollment,
  })
}
