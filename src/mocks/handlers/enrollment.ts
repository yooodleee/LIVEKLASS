import { delay, http, HttpResponse } from 'msw'

// 에러 시나리오 재현용 상수
export const MOCK_COURSE_FULL_ID = 'course-dev-03' // currentEnrollment >= maxCapacity
export const MOCK_DUPLICATE_EMAIL = 'already@enrolled.com'

export const enrollmentHandlers = [
  http.post('/api/enrollments', async ({ request }) => {
    await delay(1200)

    const body = await request.json()

    if (!body || typeof body !== 'object') {
      return HttpResponse.json(
        { code: 'INVALID_INPUT', message: '잘못된 요청입니다.' },
        { status: 400 },
      )
    }

    const payload = body as Record<string, unknown>

    // 에러 시나리오 1: 정원 마감 강의
    if (payload.courseId === MOCK_COURSE_FULL_ID) {
      return HttpResponse.json(
        { code: 'COURSE_FULL', message: '정원이 초과된 강의입니다.' },
        { status: 409 },
      )
    }

    // 에러 시나리오 2: 중복 신청
    const applicant = payload.applicant as Record<string, unknown> | undefined
    if (applicant?.email === MOCK_DUPLICATE_EMAIL) {
      return HttpResponse.json(
        { code: 'DUPLICATE_ENROLLMENT', message: '이미 신청한 강의입니다.' },
        { status: 409 },
      )
    }

    // 성공 응답
    return HttpResponse.json(
      {
        enrollmentId: crypto.randomUUID(),
        status: 'confirmed',
        enrolledAt: new Date().toISOString(),
      },
      { status: 201 },
    )
  }),
]
