'use client'

import { useState } from 'react'
import { type FieldPath, useFormContext } from 'react-hook-form'

import type { EnrollmentFormValues, EnrollmentType } from '@/types/enrollment'

import MotivationField from '../fields/MotivationField'
import ParticipantsField from '../fields/ParticipantsField'
import PhoneField from '../fields/PhoneField'
import { stepTwoSchema } from '../../schema/stepTwoSchema'

interface StepTwoProps {
  onNext: () => void
  onBack: () => void
}

const TYPE_LABELS: Record<EnrollmentType, { title: string; desc: string }> = {
  INDIVIDUAL: { title: '개인 신청', desc: '개인 수강생 1인 신청' },
  GROUP: { title: '단체 신청', desc: '기업·기관 단체 신청' },
}

export default function StepTwo({ onNext, onBack }: StepTwoProps) {
  const [pendingType, setPendingType] = useState<EnrollmentType | null>(null)

  const {
    register,
    watch,
    setValue,
    setError,
    clearErrors,
    setFocus,
    getValues,
    trigger,
    formState: { errors },
  } = useFormContext<EnrollmentFormValues>()

  const enrollmentType = watch('enrollmentType')
  const isGroup = enrollmentType === 'GROUP'

  // enrollmentType이 아직 설정되지 않은 경우 (Step 1을 거치지 않은 경우)
  if (!enrollmentType) return null

  const handleTypeChange = (newType: EnrollmentType) => {
    if (enrollmentType === newType) return
    setPendingType(newType)
  }

  const confirmTypeChange = () => {
    if (!pendingType) return
    // GROUP → INDIVIDUAL 전환: GROUP 전용 필드 초기화, 공통 필드 유지
    if (pendingType === 'INDIVIDUAL') {
      setValue('organizationName', undefined)
      setValue('headCount', undefined)
      setValue('managerPhone', undefined)
      setValue('participants', [])
      clearErrors(['organizationName', 'headCount', 'managerPhone'])
    }
    setValue('enrollmentType', pendingType, { shouldValidate: false })
    clearErrors()
    setPendingType(null)
  }

  const cancelTypeChange = () => setPendingType(null)

  const handleNext = async () => {
    clearErrors()

    // participants sub-field 검증 (useFieldArray 개별 필드)
    if (isGroup) {
      const participants = getValues('participants')
      const participantPaths = participants.flatMap((_, idx) => [
        `participants.${idx}.name` as FieldPath<EnrollmentFormValues>,
        `participants.${idx}.email` as FieldPath<EnrollmentFormValues>,
      ])
      if (participantPaths.length > 0) {
        await trigger(participantPaths)
      }
    }

    // Zod 스키마로 현재 스텝 전체 검증
    const raw = {
      enrollmentType,
      name: getValues('name'),
      email: getValues('email'),
      phone: getValues('phone'),
      motivation: getValues('motivation') || undefined,
      ...(isGroup && {
        organizationName: getValues('organizationName'),
        headCount: getValues('headCount'),
        participants: getValues('participants'),
        managerPhone: getValues('managerPhone'),
      }),
    }

    const result = stepTwoSchema.safeParse(raw)

    if (!result.success) {
      let firstErrorPath: FieldPath<EnrollmentFormValues> | null = null

      result.error.issues.forEach((issue) => {
        if (issue.path.length === 0) return

        let fieldPath: FieldPath<EnrollmentFormValues>

        if (issue.path.length === 1) {
          fieldPath = String(issue.path[0]) as FieldPath<EnrollmentFormValues>
        } else {
          // 참가자 배열 중첩 경로: ['participants', index, 'name'|'email']
          fieldPath = issue.path.map(String).join('.') as FieldPath<EnrollmentFormValues>
        }

        setError(fieldPath, { message: issue.message })
        if (!firstErrorPath) firstErrorPath = fieldPath
      })

      if (firstErrorPath) setFocus(firstErrorPath)
      return
    }

    onNext()
  }

  const inputClass = (hasError: boolean) =>
    [
      'w-full rounded-lg border px-3 py-2 text-sm text-gray-900 outline-none transition-colors',
      hasError
        ? 'border-red-400 bg-red-50 focus:border-red-400'
        : 'border-gray-300 bg-white focus:border-blue-500',
    ].join(' ')

  return (
    <div className="flex flex-col gap-6">
      {/* 신청 유형 선택 */}
      <section>
        <h2 className="mb-3 text-base font-semibold text-gray-900">신청 유형</h2>
        <div className="grid grid-cols-2 gap-3">
          {(Object.entries(TYPE_LABELS) as [EnrollmentType, { title: string; desc: string }][]).map(
            ([value, { title, desc }]) => (
              <label
                key={value}
                className={[
                  'flex cursor-pointer flex-col gap-1 rounded-xl border-2 p-4 transition-all',
                  enrollmentType === value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-blue-300',
                ].join(' ')}
              >
                <input
                  type="radio"
                  name="enrollmentType"
                  value={value}
                  checked={enrollmentType === value}
                  onChange={() => handleTypeChange(value)}
                  className="sr-only"
                />
                <span className="text-sm font-semibold text-gray-900">{title}</span>
                <span className="text-xs text-gray-500">{desc}</span>
              </label>
            ),
          )}
        </div>
      </section>

      {/* 공통 필드 */}
      <section className="flex flex-col gap-4">
        <h2 className="text-base font-semibold text-gray-900">
          {isGroup ? '담당자 정보' : '신청자 정보'}
        </h2>

        {/* 이름 */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-sm font-medium text-gray-700">
            이름 <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            placeholder="홍길동"
            {...register('name', {
              validate: (value) => {
                if (!value || value.trim().length < 2) return '이름은 최소 2자 이상 입력해 주세요.'
                if (value.trim().length > 20) return '이름은 최대 20자까지 입력 가능합니다.'
                return true
              },
            })}
            className={inputClass(!!errors.name)}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && (
            <p id="name-error" role="alert" className="text-xs text-red-500">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* 이메일 */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            이메일 <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            placeholder="example@email.com"
            {...register('email', {
              validate: (value) => {
                if (!value || value.trim().length < 1) return '이메일을 입력해 주세요.'
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return '올바른 이메일 형식이 아닙니다.'
                return true
              },
            })}
            className={inputClass(!!errors.email)}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <p id="email-error" role="alert" className="text-xs text-red-500">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* 전화번호 */}
        <PhoneField name="phone" label="전화번호" />
      </section>

      {/* 단체 신청 전용 필드 */}
      {isGroup && (
        <section className="flex flex-col gap-4">
          <h2 className="text-base font-semibold text-gray-900">단체 정보</h2>

          {/* 단체명 */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="organizationName" className="text-sm font-medium text-gray-700">
              단체명 <span className="text-red-500">*</span>
            </label>
            <input
              id="organizationName"
              type="text"
              placeholder="(주)회사명 또는 기관명"
              {...register('organizationName', {
                validate: (value) =>
                  value && value.trim().length > 0 ? true : '단체명을 입력해 주세요.',
              })}
              className={inputClass(!!errors.organizationName)}
              aria-invalid={!!errors.organizationName}
              aria-describedby={errors.organizationName ? 'org-error' : undefined}
            />
            {errors.organizationName && (
              <p id="org-error" role="alert" className="text-xs text-red-500">
                {errors.organizationName.message}
              </p>
            )}
          </div>

          {/* 신청 인원수 */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="headCount" className="text-sm font-medium text-gray-700">
              신청 인원수 <span className="text-red-500">*</span>
              <span className="ml-1.5 text-xs font-normal text-gray-400">(2~10명)</span>
            </label>
            <input
              id="headCount"
              type="number"
              min={2}
              max={10}
              placeholder="2"
              {...register('headCount', {
                valueAsNumber: true,
                validate: (value) => {
                  if (value === undefined || Number.isNaN(value))
                    return '신청 인원수를 입력해 주세요.'
                  if (!Number.isInteger(value)) return '신청 인원수는 정수로 입력해 주세요.'
                  if (value < 2) return '단체 신청은 최소 2명 이상이어야 합니다.'
                  if (value > 10) return '단체 신청은 최대 10명까지 가능합니다.'
                  return true
                },
              })}
              className={inputClass(!!errors.headCount)}
              aria-invalid={!!errors.headCount}
              aria-describedby={errors.headCount ? 'headcount-error' : undefined}
            />
            {errors.headCount && (
              <p id="headcount-error" role="alert" className="text-xs text-red-500">
                {errors.headCount.message}
              </p>
            )}
          </div>

          {/* 담당자 연락처 */}
          <PhoneField name="managerPhone" label="담당자 연락처" />

          {/* 참가자 명단 */}
          <ParticipantsField />
        </section>
      )}

      {/* 수강 동기 */}
      <MotivationField />

      {/* 하단 네비게이션 */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          ← 이전 단계
        </button>
        <button
          type="button"
          onClick={() => void handleNext()}
          className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 active:bg-blue-800"
        >
          다음 단계로 →
        </button>
      </div>

      {/* 신청 유형 변경 확인 대화상자 */}
      {pendingType !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 id="confirm-dialog-title" className="text-base font-semibold text-gray-900">
              신청 유형 변경
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              신청 유형을 변경하면 입력한 정보가 초기화됩니다. 계속하시겠습니까?
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={cancelTypeChange}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={confirmTypeChange}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
