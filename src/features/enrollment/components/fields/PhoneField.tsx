'use client'

import { Controller, useFormContext } from 'react-hook-form'

import type { EnrollmentFormValues } from '@/types/enrollment'

import { PHONE_REGEX } from '../../schema/stepTwoSchema'
import { formatPhoneDisplay, stripPhoneHyphens } from '../../utils/formatPhone'

interface PhoneFieldProps {
  name: 'phone' | 'managerPhone'
  label: string
  required?: boolean
}

const PHONE_VALIDATION_MSG = '올바른 한국 전화번호 형식이 아닙니다. (예: 01012345678)'

export default function PhoneField({ name, label, required = true }: PhoneFieldProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext<EnrollmentFormValues>()

  const fieldError = name === 'phone' ? errors.phone : errors.managerPhone
  const hasError = !!fieldError

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      <Controller
        name={name}
        control={control}
        rules={{
          validate: (value) => {
            if (!value) return `${label}를 입력해 주세요.`
            if (!PHONE_REGEX.test(value)) return PHONE_VALIDATION_MSG
            return true
          },
        }}
        render={({ field }) => (
          <input
            id={name}
            type="tel"
            inputMode="numeric"
            placeholder="01012345678"
            value={formatPhoneDisplay(field.value ?? '')}
            onChange={(e) => {
              field.onChange(stripPhoneHyphens(e.target.value))
            }}
            onBlur={field.onBlur}
            className={[
              'w-full rounded-lg border px-3 py-2 text-sm text-gray-900 outline-none transition-colors',
              hasError
                ? 'border-red-400 bg-red-50 focus:border-red-400'
                : 'border-gray-300 bg-white focus:border-blue-500',
            ].join(' ')}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${name}-error` : undefined}
          />
        )}
      />
      {fieldError && (
        <p id={`${name}-error`} role="alert" className="text-xs text-red-500">
          {fieldError.message}
        </p>
      )}
    </div>
  )
}
