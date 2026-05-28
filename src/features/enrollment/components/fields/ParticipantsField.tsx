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

  // headCount 변경 시 participants 배열 길이 자동 동기화
  useEffect(() => {
    const currentLength = fields.length
    const target = headCount ?? 0

    if (target === currentLength) return

    if (target > currentLength) {
      const toAdd = Array.from({ length: target - currentLength }, () => ({ name: '', email: '' }))
      append(toAdd)
    } else {
      const indicesToRemove = Array.from(
        { length: currentLength - target },
        (_, i) => currentLength - 1 - i,
      )
      remove(indicesToRemove)
    }
  }, [headCount, fields.length, append, remove])

  if (!fields.length) return null

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-medium text-gray-700">
        참가자 명단 <span className="text-red-500">*</span>
      </h3>
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
                    {...register(`participants.${index}.name`, {
                      validate: (value) =>
                        (value?.trim().length ?? 0) > 0 ? true : '참가자 이름을 입력해 주세요.',
                    })}
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
                    {...register(`participants.${index}.email`, {
                      validate: (value) => {
                        if (!value?.trim()) return '참가자 이메일을 입력해 주세요.'
                        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
                          return '올바른 이메일 형식이 아닙니다.'
                        return true
                      },
                    })}
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
            </li>
          )
        })}
      </ul>
    </div>
  )
}
