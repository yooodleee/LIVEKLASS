import { useQuery } from '@tanstack/react-query'

import type { CourseCategory, CourseListResponse } from '@/types/enrollment'

async function fetchCourses(category: CourseCategory | null): Promise<CourseListResponse> {
  const url = category !== null ? `/api/courses?category=${category}` : '/api/courses'
  const res = await fetch(url)
  if (!res.ok) throw new Error('강의 목록을 불러오지 못했습니다.')
  return res.json() as Promise<CourseListResponse>
}

export function useCourses(category: CourseCategory | null = null) {
  return useQuery({
    queryKey: ['courses', category],
    queryFn: () => fetchCourses(category),
    staleTime: 1000 * 60 * 5,
  })
}
