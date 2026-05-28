'use client'

import { useFormContext } from 'react-hook-form'

import type { EnrollmentFormValues } from '@/types/enrollment'

const MAX_CHARS = 300

export default function MotivationField() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<EnrollmentFormValues>()

  const value = watch('motivation') ?? ''
  const charCount = value.length
  const isOverLimit = charCount > MAX_CHARS
  const hasError = !!errors.motivation

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="motivation" className="text-sm font-medium text-gray-700">
        수강 동기
        <span className="ml-1.5 text-xs font-normal text-gray-400">(선택)</span>
      </label>
      <div className="relative">
        <textarea
          id="motivation"
          rows={4}
          placeholder="수강 동기를 자유롭게 입력해 주세요."
          {...register('motivation', {
            validate: (value) => {
              if (value && value.length > MAX_CHARS) {
                return `수강 동기는 최대 ${MAX_CHARS}자까지 입력 가능합니다.`
              }
              return true
            },
          })}
          className={[
            'w-full resize-none rounded-lg border px-3 py-2 text-sm text-gray-900 outline-none transition-colors',
            hasError || isOverLimit
              ? 'border-red-400 bg-red-50 focus:border-red-400'
              : 'border-gray-300 bg-white focus:border-blue-500',
          ].join(' ')}
          aria-invalid={hasError || isOverLimit}
          aria-describedby="motivation-counter"
        />
        <p
          id="motivation-counter"
          className={[
            'mt-1 text-right text-xs',
            isOverLimit ? 'font-medium text-red-500' : 'text-gray-400',
          ].join(' ')}
          aria-live="polite"
        >
          {charCount} / {MAX_CHARS}자
        </p>
      </div>
      {hasError && (
        <p role="alert" className="text-xs text-red-500">
          {errors.motivation?.message}
        </p>
      )}
    </div>
  )
}
