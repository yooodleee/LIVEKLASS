import { http, HttpResponse } from 'msw';

export const enrollmentHandlers = [
  http.post('/api/enrollments', async ({ request }) => {
    const body = await request.json();

    // 간단한 유효성 시뮬레이션
    if (!body || typeof body !== 'object') {
      return HttpResponse.json({ message: '잘못된 요청입니다.' }, { status: 400 });
    }

    return HttpResponse.json(
      {
        enrollmentId: `enroll-${Date.now()}`,
        message: '수강 신청이 완료되었습니다.',
        createdAt: new Date().toISOString(),
      },
      { status: 201 },
    );
  }),

  http.get('/api/enrollments/:enrollmentId', ({ params }) => {
    const { enrollmentId } = params;
    return HttpResponse.json({
      enrollmentId,
      status: 'confirmed',
      courseId: 'course-1',
      studentName: '홍길동',
      createdAt: new Date().toISOString(),
    });
  }),
];
