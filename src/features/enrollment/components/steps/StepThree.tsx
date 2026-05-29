'use client'

import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'

import type { Course, CourseListResponse, EnrollmentFormValues } from '@/types/enrollment'
import type { EnrollmentRequest, EnrollmentResponse } from '@/types/enrollments'
import { isErrorResponse } from '@/types/enrollments'

import { ENROLLMENT_ERROR_MESSAGES } from '../../constants/errorMessages'
import { stepThreeSchema } from '../../schema/stepThreeSchema'
import { buildEnrollmentRequest } from '../../utils/buildEnrollmentRequest'
import { formatPhoneDisplay } from '../../utils/formatPhone'

const CATEGORY_LABELS: Record<Course['category'], string> = {
  development: '개발',
  design: '디자인',
  marketing: '마케팅',
  business: '비즈니스',
}

const TERMS_CONTENT = `
제1조 (목적)
본 약관은 LIVEKLASS(이하 "서비스")가 제공하는 수강 신청 서비스의 이용 조건 및 절차에 관한 사항을 규정합니다.

제2조 (개인정보 수집)
서비스는 수강 신청 처리를 위해 이름, 이메일, 전화번호를 수집합니다. 수집된 정보는 수강 신청 목적 외에 사용되지 않습니다.

제3조 (환불 정책)
수강 시작 전 취소 시 전액 환불, 수강 시작 후 7일 이내 50% 환불, 이후 환불 불가합니다.

제4조 (면책 조항)
천재지변 등 불가항력으로 인한 서비스 중단에 대해 서비스는 책임을 지지 않습니다.
`.trim()

interface StepThreeProps {
  isPending: boolean
  submitError: unknown
  onSubmit: (request: EnrollmentRequest) => void
  onBack: () => void
  onGoToStepForEdit: (step: 1 | 2) => void
  onGoToStep1: () => void
  onSuccess: (data: EnrollmentResponse) => void
}

export default function StepThree({
  isPending,
  submitError,
  onSubmit,
  onBack,
  onGoToStepForEdit,
  onGoToStep1,
}: StepThreeProps) {
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [termsError, setTermsError] = useState<string | null>(null)
  const [showTerms, setShowTerms] = useState(false)

  const { getValues } = useFormContext<EnrollmentFormValues>()
  const queryClient = useQueryClient()

  const formValues = getValues()
  const { courseId, enrollmentType, name, email, phone, motivation } = formValues
  const isGroup = enrollmentType === 'GROUP'

  // Step 1에서 로드된 TanStack Query 캐시에서 강의 정보 조회
  const selectedCourse = (() => {
    const allQueries = queryClient.getQueriesData<CourseListResponse>({ queryKey: ['courses'] })
    for (const [, data] of allQueries) {
      const found = data?.courses.find((c) => c.id === courseId)
      if (found) return found
    }
    return undefined
  })()

  const handleSubmit = () => {
    setTermsError(null)
    const result = stepThreeSchema.safeParse({ agreedToTerms })
    if (!result.success) {
      setTermsError(result.error.issues[0]?.message ?? '이용 약관에 동의해 주세요.')
      return
    }
    const request = buildEnrollmentRequest(getValues(), agreedToTerms)
    onSubmit(request)
  }

  const errorMessage = (() => {
    if (!submitError) return null
    if (isErrorResponse(submitError)) {
      const key = submitError.code as keyof typeof ENROLLMENT_ERROR_MESSAGES
      return ENROLLMENT_ERROR_MESSAGES[key] ?? ENROLLMENT_ERROR_MESSAGES.UNKNOWN
    }
    return ENROLLMENT_ERROR_MESSAGES.UNKNOWN
  })()

  const isCourseFull =
    isErrorResponse(submitError) && submitError.code === 'COURSE_FULL'

  return (
    <div className="flex flex-col gap-6">
      {/* 섹션 1: 강의 정보 */}
      <section className="rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-900">강의 정보</h2>
          <button
            type="button"
            onClick={() => onGoToStepForEdit(1)}
            disabled={isPending}
            className="text-sm font-medium text-blue-600 hover:underline disabled:opacity-40"
          >
            수정
          </button>
        </div>
        <dl className="divide-y divide-gray-100">
          <SummaryRow label="강의명" value={selectedCourse?.title ?? courseId} />
          <SummaryRow
            label="카테고리"
            value={selectedCourse ? CATEGORY_LABELS[selectedCourse.category] : '-'}
          />
          <SummaryRow label="강사" value={selectedCourse?.instructor ?? '-'} />
          <SummaryRow
            label="수강료"
            value={
              selectedCourse
                ? `${selectedCourse.price.toLocaleString('ko-KR')}원`
                : '-'
            }
          />
          <SummaryRow label="일정" value={selectedCourse?.schedule ?? '-'} />
          <SummaryRow
            label="신청 유형"
            value={isGroup ? '단체 신청' : '개인 신청'}
          />
        </dl>
      </section>

      {/* 섹션 2: 신청자 정보 */}
      <section className="rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-900">신청자 정보</h2>
          <button
            type="button"
            onClick={() => onGoToStepForEdit(2)}
            disabled={isPending}
            className="text-sm font-medium text-blue-600 hover:underline disabled:opacity-40"
          >
            수정
          </button>
        </div>
        <dl className="divide-y divide-gray-100">
          <SummaryRow label="이름" value={name ?? '-'} />
          <SummaryRow label="이메일" value={email ?? '-'} />
          <SummaryRow
            label="전화번호"
            value={phone ? formatPhoneDisplay(phone) : '-'}
          />
          {isGroup && (
            <>
              <SummaryRow
                label="단체명"
                value={formValues.organizationName ?? '-'}
              />
              <SummaryRow
                label="신청 인원"
                value={
                  formValues.headCount !== undefined ? `${formValues.headCount}명` : '-'
                }
              />
              <SummaryRow
                label="담당자 연락처"
                value={
                  formValues.managerPhone
                    ? formatPhoneDisplay(formValues.managerPhone)
                    : '-'
                }
              />
              <div className="px-5 py-3">
                <dt className="text-xs text-gray-500">참가자 명단</dt>
                <dd className="mt-1.5 flex flex-col gap-1">
                  {formValues.participants.length > 0 ? (
                    formValues.participants.map((p, i) => (
                      <span key={i} className="text-sm text-gray-900">
                        {i + 1}. {p.name} / {p.email}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </dd>
              </div>
            </>
          )}
          <SummaryRow
            label="수강 동기"
            value={motivation || '미입력'}
            muted={!motivation}
          />
        </dl>
      </section>

      {/* 이용 약관 동의 */}
      <section className="flex flex-col gap-2">
        <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white px-5 py-4">
          <input
            id="agreedToTerms"
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => {
              setAgreedToTerms(e.target.checked)
              if (e.target.checked) setTermsError(null)
            }}
            className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-blue-600"
          />
          <label htmlFor="agreedToTerms" className="flex-1 cursor-pointer text-sm text-gray-700">
            수강 신청 이용 약관에 동의합니다.{' '}
            <span className="text-red-500">(필수)</span>
          </label>
          <button
            type="button"
            onClick={() => setShowTerms((v) => !v)}
            className="shrink-0 text-xs text-blue-600 hover:underline"
          >
            {showTerms ? '접기' : '약관 보기'}
          </button>
        </div>

        {showTerms && (
          <div className="max-h-40 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 text-xs leading-relaxed text-gray-600 whitespace-pre-wrap">
            {TERMS_CONTENT}
          </div>
        )}

        {termsError && (
          <p role="alert" className="text-xs text-red-500 px-1">
            {termsError}
          </p>
        )}
      </section>

      {/* 제출 에러 인라인 표시 */}
      {errorMessage && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-600">
            <span aria-hidden="true">⚠ </span>
            {errorMessage}
          </p>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="shrink-0 rounded-lg border border-red-300 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100 disabled:opacity-40"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* COURSE_FULL 전용 강의 재선택 버튼 */}
      {isCourseFull && (
        <button
          type="button"
          onClick={onGoToStep1}
          className="w-full rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          강의 다시 선택하기
        </button>
      )}

      {/* 하단 네비게이션 */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          disabled={isPending}
          className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          ← 이전 단계
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="flex min-w-[140px] items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? (
            <>
              <Spinner />
              신청 중...
            </>
          ) : (
            '수강 신청하기'
          )}
        </button>
      </div>
    </div>
  )
}

function SummaryRow({
  label,
  value,
  muted = false,
}: {
  label: string
  value: string
  muted?: boolean
}) {
  return (
    <div className="flex items-start gap-4 px-5 py-3">
      <dt className="w-28 shrink-0 text-xs text-gray-500">{label}</dt>
      <dd className={['flex-1 text-sm', muted ? 'text-gray-400' : 'text-gray-900'].join(' ')}>
        {value}
      </dd>
    </div>
  )
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}

