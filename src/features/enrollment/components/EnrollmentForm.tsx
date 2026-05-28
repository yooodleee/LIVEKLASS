'use client'

import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import type { EnrollmentFormValues, Step } from '@/types/enrollment'

import StepIndicator from './StepIndicator'
import StepOne from './steps/StepOne'

export default function EnrollmentForm() {
  const [currentStep, setCurrentStep] = useState<Step>(1)

  const methods = useForm<EnrollmentFormValues>({
    mode: 'onBlur',
    defaultValues: {
      courseId: '',
    },
  })

  return (
    <FormProvider {...methods}>
      <div className="mx-auto w-full max-w-2xl px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">수강 신청</h1>
          <p className="mt-1 text-sm text-gray-500">원하는 강의를 선택하고 신청을 완료하세요.</p>
        </header>

        <StepIndicator currentStep={currentStep} />

        <main className="mt-8">
          {currentStep === 1 && <StepOne onNext={() => setCurrentStep(2)} />}
          {currentStep === 2 && (
            <PlaceholderStep
              title="신청자 정보"
              onBack={() => setCurrentStep(1)}
              onNext={() => setCurrentStep(3)}
            />
          )}
          {currentStep === 3 && (
            <PlaceholderStep title="신청 확인" onBack={() => setCurrentStep(2)} />
          )}
        </main>
      </div>
    </FormProvider>
  )
}

function PlaceholderStep({
  title,
  onBack,
  onNext,
}: {
  title: string
  onBack: () => void
  onNext?: () => void
}) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-16">
        <p className="text-sm text-gray-400">{title} — 준비 중</p>
      </div>
      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          ← 이전 단계
        </button>
        {onNext && (
          <button
            type="button"
            onClick={onNext}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            다음 단계로 →
          </button>
        )}
      </div>
    </div>
  )
}
