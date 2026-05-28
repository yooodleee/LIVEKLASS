import { useMutation } from '@tanstack/react-query';

import type { EnrollmentRequest, EnrollmentResponse } from '../types';

async function submitEnrollment(data: EnrollmentRequest): Promise<EnrollmentResponse> {
  const res = await fetch('/api/enrollments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('수강 신청에 실패했습니다.');
  return res.json() as Promise<EnrollmentResponse>;
}

export function useEnrollment() {
  return useMutation({
    mutationFn: submitEnrollment,
  });
}
