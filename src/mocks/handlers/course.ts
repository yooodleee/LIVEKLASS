import { delay, http, HttpResponse } from 'msw'

import { MOCK_COURSES } from '@/mocks/data/courses'
import type { CourseCategory } from '@/types/enrollment'

const VALID_CATEGORIES = new Set<string>(['development', 'design', 'marketing', 'business'])

export const courseHandlers = [
  http.get('/api/courses', async ({ request }) => {
    await delay(800)

    const url = new URL(request.url)
    const category = url.searchParams.get('category')

    const courses =
      category !== null && VALID_CATEGORIES.has(category)
        ? MOCK_COURSES.filter((c) => c.category === (category as CourseCategory))
        : MOCK_COURSES

    return HttpResponse.json({ courses, total: courses.length })
  }),

  http.get('/api/courses/:courseId', async ({ params }) => {
    await delay(800)

    const { courseId } = params
    const course = MOCK_COURSES.find((c) => c.id === courseId)

    if (!course) {
      return HttpResponse.json({ message: '강의를 찾을 수 없습니다.' }, { status: 404 })
    }

    return HttpResponse.json(course)
  }),
]
