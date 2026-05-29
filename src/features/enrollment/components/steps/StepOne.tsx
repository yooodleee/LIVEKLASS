'use client'

import { useRef, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import type { Course, CourseCategory, EnrollmentFormValues } from '@/types/enrollment'

import { useCourses } from '../../hooks/useCourses'
import { getCourseStatus } from '../../utils/courseStatus'

const CATEGORIES: { value: CourseCategory | null; label: string }[] = [
  { value: null, label: '전체' },
  { value: 'development', label: '개발' },
  { value: 'design', label: '디자인' },
  { value: 'marketing', label: '마케팅' },
  { value: 'business', label: '비즈니스' },
]

const STATUS_CONFIG = {
  OPEN: { label: '모집중', className: 'bg-green-100 text-green-700' },
  ALMOST_FULL: { label: '마감임박', className: 'bg-amber-100 text-amber-700' },
  FULL: { label: '마감', className: 'bg-red-100 text-red-600' },
} as const

interface StepOneProps {
  onNext: () => void
}

export default function StepOne({ onNext }: StepOneProps) {
  const [selectedCategory, setSelectedCategory] = useState<CourseCategory | null>(null)
  const { data, isLoading, isError, refetch } = useCourses(selectedCategory)

  const {
    control,
    setValue,
    trigger,
    register,
    setFocus,
    getFieldState,
    formState: { errors },
  } = useFormContext<EnrollmentFormValues>()

  // courseId는 register 없이 setValue로만 관리되므로 setFocus 대신 ref 스크롤로 포커스 처리
  const courseListRef = useRef<HTMLElement>(null)
  const enrollmentTypeRef = useRef<HTMLElement>(null)

  const selectedCourseId = useWatch({ control, name: 'courseId' })
  const selectedEnrollmentType = useWatch({ control, name: 'enrollmentType' })

  const selectedCourse = data?.courses.find((c) => c.id === selectedCourseId)
  const isAlmostFull =
    selectedCourse !== undefined && getCourseStatus(selectedCourse) === 'ALMOST_FULL'
  const remainingSeats = selectedCourse
    ? selectedCourse.maxCapacity - selectedCourse.currentEnrollment
    : 0

  const handleCourseSelect = (course: Course) => {
    const status = getCourseStatus(course)
    if (status === 'FULL') return
    setValue('courseId', course.id, { shouldValidate: false })
  }

  const handleNext = async () => {
    const isValid = await trigger(['courseId', 'enrollmentType'])
    if (isValid) {
      onNext()
      return
    }
    // trigger 완료 후 getFieldState로 에러 필드를 확인하여 해당 섹션으로 이동
    if (getFieldState('courseId').error) {
      courseListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    } else if (getFieldState('enrollmentType').error) {
      // enrollmentType은 register된 라디오 입력이므로 setFocus 사용
      setFocus('enrollmentType')
      enrollmentTypeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* 카테고리 탭 */}
      <section aria-labelledby="category-heading">
        <h2 id="category-heading" className="sr-only">
          카테고리 선택
        </h2>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="강의 카테고리">
          {CATEGORIES.map(({ value, label }) => (
            <button
              key={label}
              type="button"
              role="tab"
              aria-selected={selectedCategory === value}
              onClick={() => setSelectedCategory(value)}
              className={[
                'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                selectedCategory === value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* 강의 목록 */}
      <section ref={courseListRef} aria-labelledby="course-list-heading">
        <h2 id="course-list-heading" className="mb-3 text-base font-semibold text-gray-900">
          강의 선택
        </h2>

        {isLoading ? (
          <CourseSkeleton />
        ) : isError ? (
          <ErrorState onRetry={() => void refetch()} />
        ) : !data?.courses.length ? (
          <EmptyState />
        ) : (
          <ul
            className="grid grid-cols-1 gap-3 sm:grid-cols-2"
            role="listbox"
            aria-label="강의 목록"
            aria-multiselectable="false"
          >
            {data.courses.map((course) => {
              const status = getCourseStatus(course)
              const isFull = status === 'FULL'
              const isSelected = selectedCourseId === course.id
              const { label: statusLabel, className: statusClass } = STATUS_CONFIG[status]
              const remaining = course.maxCapacity - course.currentEnrollment

              return (
                <li key={course.id} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    disabled={isFull}
                    onClick={() => handleCourseSelect(course)}
                    className={[
                      'w-full rounded-xl border-2 p-4 text-left transition-all',
                      isFull
                        ? 'cursor-not-allowed border-gray-100 bg-gray-50 opacity-60'
                        : isSelected
                          ? 'border-blue-500 bg-blue-50 shadow-sm'
                          : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm',
                    ].join(' ')}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="flex-1 text-sm font-semibold text-gray-900 leading-snug">
                        {course.title}
                      </span>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass}`}
                      >
                        {statusLabel}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">{course.instructor} 강사</p>
                    <p className="mt-1 text-xs text-gray-400">{course.schedule}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm font-bold text-blue-600">
                        {course.price.toLocaleString('ko-KR')}원
                      </span>
                      <span className="text-xs text-gray-400">
                        {isFull ? '잔여석 없음' : `잔여 ${remaining}석`}
                      </span>
                    </div>
                    {isFull && (
                      <p className="mt-2 text-xs text-red-500">정원이 마감된 강의입니다.</p>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        )}

        {errors.courseId && (
          <p role="alert" className="mt-2 text-sm text-red-500">
            {errors.courseId.message}
          </p>
        )}
      </section>

      {/* 신청 유형 */}
      <section ref={enrollmentTypeRef} aria-labelledby="enrollment-type-heading">
        <h2 id="enrollment-type-heading" className="mb-3 text-base font-semibold text-gray-900">
          신청 유형
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              { value: 'INDIVIDUAL', label: '개인 신청', desc: '개인 수강생 1인 신청' },
              { value: 'GROUP', label: '단체 신청', desc: '기업·기관 단체 신청' },
            ] as const
          ).map(({ value, label, desc }) => (
            <label
              key={value}
              className={[
                'flex cursor-pointer flex-col gap-1 rounded-xl border-2 p-4 transition-all',
                selectedEnrollmentType === value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-blue-300',
              ].join(' ')}
            >
              <input
                type="radio"
                value={value}
                {...register('enrollmentType')}
                className="sr-only"
              />
              <span className="text-sm font-semibold text-gray-900">{label}</span>
              <span className="text-xs text-gray-500">{desc}</span>
            </label>
          ))}
        </div>
        {errors.enrollmentType && (
          <p role="alert" className="mt-2 text-sm text-red-500">
            {errors.enrollmentType.message}
          </p>
        )}
      </section>

      {/* 정원 임박 인라인 경고 */}
      {isAlmostFull && (
        <div
          role="alert"
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700"
        >
          선택하신 강의의 잔여석이 얼마 남지 않았습니다. (잔여석: {remainingSeats}석) 빠르게
          신청을 완료해 주세요.
        </div>
      )}

      {/* 다음 단계 버튼 */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => void handleNext()}
          className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 active:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          다음 단계로 →
        </button>
      </div>
    </div>
  )
}

function CourseSkeleton() {
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2" aria-busy="true" aria-label="로딩 중">
      {Array.from({ length: 4 }).map((_, i) => (
        <li key={i} className="animate-pulse rounded-xl border-2 border-gray-100 bg-gray-50 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="h-4 w-3/4 rounded bg-gray-200" />
            <div className="h-5 w-12 rounded-full bg-gray-200" />
          </div>
          <div className="mt-2 h-3 w-1/3 rounded bg-gray-200" />
          <div className="mt-1 h-3 w-1/2 rounded bg-gray-200" />
          <div className="mt-3 flex items-center justify-between">
            <div className="h-4 w-16 rounded bg-gray-200" />
            <div className="h-3 w-12 rounded bg-gray-200" />
          </div>
        </li>
      ))}
    </ul>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-12 text-center">
      <p className="text-sm text-gray-500">해당 카테고리에 강의가 없습니다.</p>
    </div>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-red-200 py-12 text-center gap-3">
      <p className="text-sm text-red-500">강의 목록을 불러오지 못했습니다.</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-lg border border-gray-300 px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
      >
        다시 시도
      </button>
    </div>
  )
}
