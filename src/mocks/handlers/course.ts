import { http, HttpResponse } from 'msw';

export const courseHandlers = [
  http.get('/api/courses', () => {
    return HttpResponse.json({
      courses: [
        {
          id: 'course-1',
          title: 'React 완전 정복',
          instructor: '김강사',
          category: 'frontend',
          schedule: '매주 월·수 19:00-21:00',
          maxStudents: 30,
          currentStudents: 22,
          price: 150000,
          description: 'React 기초부터 고급 패턴까지 체계적으로 학습합니다.',
        },
        {
          id: 'course-2',
          title: 'Next.js App Router 마스터',
          instructor: '이강사',
          category: 'frontend',
          schedule: '매주 화·목 19:00-21:00',
          maxStudents: 25,
          currentStudents: 18,
          price: 180000,
          description: 'Next.js 13+ App Router를 활용한 풀스택 개발을 배웁니다.',
        },
        {
          id: 'course-3',
          title: 'TypeScript 심화 과정',
          instructor: '박강사',
          category: 'language',
          schedule: '매주 토 10:00-13:00',
          maxStudents: 20,
          currentStudents: 20,
          price: 120000,
          description: 'TypeScript 타입 시스템을 깊이 이해하고 활용합니다.',
        },
      ],
    });
  }),

  http.get('/api/courses/:courseId', ({ params }) => {
    const { courseId } = params;
    return HttpResponse.json({
      id: courseId,
      title: 'React 완전 정복',
      instructor: '김강사',
      category: 'frontend',
      schedule: '매주 월·수 19:00-21:00',
      maxStudents: 30,
      currentStudents: 22,
      price: 150000,
      description: 'React 기초부터 고급 패턴까지 체계적으로 학습합니다.',
    });
  }),
];
