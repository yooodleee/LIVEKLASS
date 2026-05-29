'use client'

import { useEffect } from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'

import type { EnrollmentFormValues } from '@/types/enrollment'

export default function ParticipantsField() {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useFormContext<EnrollmentFormValues>()

  const headCount = watch('headCount')

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'participants',
  })

  // headCount 감소 시 초과 참가자만 제거 — 증가 시에는 자동 추가하지 않음 (점진적 추가 방식)
  useEffect(() => {
    const target = headCount ?? 0
    if (fields.length <= target) return
    const indicesToRemove = Array.from(
      { length: fields.length - target },
      (_, i) => fields.length - 1 - i,
    )
    remove(indicesToRemove)
  }, [headCount, fields.length, remove])

  const canAddMore = (headCount ?? 0) > fields.length

  if (!(headCount && headCount >= 2)) return null

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">
          참가자 명단 <span className="text-red-500">*</span>
        </h3>
        <span className="text-xs text-gray-400">
          {fields.length} / {headCount}명
        </span>
      </div>

      {fields.length > 0 && (
        <ul className="flex flex-col gap-2">
          {fields.map((field, index) => {
            const nameError = errors.participants?.[index]?.name
            const emailError = errors.participants?.[index]?.email

            return (
              <li key={field.id} className="flex items-start gap-2">
                <span className="mt-2.5 w-5 shrink-0 text-right text-xs font-medium text-gray-400">
                  {index + 1}.
                </span>
                <div className="flex flex-1 gap-2">
                  <div className="flex flex-1 flex-col gap-1">
                    <input
                      type="text"
                      placeholder="이름"
                      {...register(`participants.${index}.name`)}
                      className={[
                        'w-full rounded-lg border px-3 py-2 text-sm text-gray-900 outline-none transition-colors',
                        nameError
                          ? 'border-red-400 bg-red-50 focus:border-red-400'
                          : 'border-gray-300 bg-white focus:border-blue-500',
                      ].join(' ')}
                      aria-invalid={!!nameError}
                      aria-label={`참가자 ${index + 1} 이름`}
                    />
                    {nameError && (
                      <p role="alert" className="text-xs text-red-500">
                        {nameError.message}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <input
                      type="email"
                      placeholder="이메일"
                      {...register(`participants.${index}.email`)}
                      className={[
                        'w-full rounded-lg border px-3 py-2 text-sm text-gray-900 outline-none transition-colors',
                        emailError
                          ? 'border-red-400 bg-red-50 focus:border-red-400'
                          : 'border-gray-300 bg-white focus:border-blue-500',
                      ].join(' ')}
                      aria-invalid={!!emailError}
                      aria-label={`참가자 ${index + 1} 이메일`}
                    />
                    {emailError && (
                      <p role="alert" className="text-xs text-red-500">
                        {emailError.message}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="mt-2 shrink-0 rounded p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                  aria-label={`참가자 ${index + 1} 삭제`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <button
        type="button"
        onClick={() => append({ name: '', email: '' })}
        disabled={!canAddMore}
        className="rounded-lg border border-dashed border-gray-300 py-2.5 text-sm text-gray-500 transition-colors hover:border-blue-400 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {canAddMore
          ? `+ 참가자 추가 (${(headCount ?? 0) - fields.length}명 더 추가 가능)`
          : '인원이 모두 추가되었습니다'}
      </button>
    </div>
  )
}
