import { useQuery } from '@tanstack/react-query';

import type { CourseListResponse } from '../types';

async function fetchCourses(): Promise<CourseListResponse> {
  const res = await fetch('/api/courses');
  if (!res.ok) throw new Error('강좌 목록을 불러오지 못했습니다.');
  return res.json() as Promise<CourseListResponse>;
}

export function useCourses() {
  return useQuery({
    queryKey: ['courses'],
    queryFn: fetchCourses,
  });
}
