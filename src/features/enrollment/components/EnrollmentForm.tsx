'use client'

import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import type { EnrollmentFormValues, Step } from '@/types/enrollment'
import type { EnrollmentRequest, EnrollmentResponse } from '@/types/enrollments'
import { isErrorResponse } from '@/types/enrollments'

import { useEnrollmentMutation } from '../hooks/useEnrollmentMutation'

import StepIndicator from './StepIndicator'
import StepOne from './steps/StepOne'
import StepThree from './steps/StepThree'
import StepTwo from './steps/StepTwo'

export default function EnrollmentForm() {
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [returnToConfirm, setReturnToConfirm] = useState(false)
  const [completedData, setCompletedData] = useState<EnrollmentResponse | null>(null)

  const methods = useForm<EnrollmentFormValues>({
    mode: 'onBlur',
    defaultValues: {
      courseId: '',
      name: undefined,
      email: undefined,
      phone: undefined,
      motivation: undefined,
      organizationName: undefined,
      headCount: undefined,
      participants: [],
      managerPhone: undefined,
    },
  })

  const mutation = useEnrollmentMutation()

  // 수정 링크에서 돌아온 경우 Step 3으로 자동 복귀
  const goToStepForEdit = (step: 1 | 2) => {
    setReturnToConfirm(true)
    setCurrentStep(step)
  }

  const handleStepOneNext = () => {
    if (returnToConfirm) {
      setReturnToConfirm(false)
      setCurrentStep(3)
    } else {
      setCurrentStep(2)
    }
  }

  const handleStepTwoNext = () => {
    setReturnToConfirm(false)
    setCurrentStep(3)
  }

  const handleSubmit = (request: EnrollmentRequest) => {
    mutation.mutate(request, {
      onSuccess: (data) => {
        setCompletedData(data)
      },
      onError: (error) => {
        // INVALID_INPUT: setError()로 해당 필드에 에러 주입 후 Step 2로 이동
        if (isErrorResponse(error) && error.code === 'INVALID_INPUT' && error.details) {
          Object.entries(error.details).forEach(([field, message]) => {
            methods.setError(field as keyof EnrollmentFormValues, { message })
          })
          setCurrentStep(2)
        }
      },
    })
  }

  // 제출 완료 화면
  if (completedData) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-8">
        <div className="flex flex-col items-center gap-6 rounded-2xl border border-gray-200 bg-white py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">수강 신청이 완료되었습니다!</h2>
            <p className="mt-2 text-sm text-gray-500">
              신청 번호: {completedData.enrollmentId}
            </p>
          </div>
          <p className="max-w-xs text-sm text-gray-500">
            입력하신 이메일로 신청 확인 안내가 발송됩니다.
          </p>
        </div>
      </div>
    )
  }

  return (
    <FormProvider {...methods}>
      <div className="mx-auto w-full max-w-2xl px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">수강 신청</h1>
          <p className="mt-1 text-sm text-gray-500">원하는 강의를 선택하고 신청을 완료하세요.</p>
        </header>

        <StepIndicator
          currentStep={currentStep}
          isPending={mutation.isPending}
          onCompletedStepClick={(step) => {
            if (!mutation.isPending) setCurrentStep(step)
          }}
        />

        <main className="mt-8">
          {currentStep === 1 && <StepOne onNext={handleStepOneNext} />}
          {currentStep === 2 && (
            <StepTwo onBack={() => setCurrentStep(1)} onNext={handleStepTwoNext} />
          )}
          {currentStep === 3 && (
            <StepThree
              isPending={mutation.isPending}
              submitError={mutation.error}
              onSubmit={handleSubmit}
              onBack={() => !mutation.isPending && setCurrentStep(2)}
              onGoToStepForEdit={goToStepForEdit}
              onGoToStep1={() => {
                setReturnToConfirm(false)
                mutation.reset()
                setCurrentStep(1)
              }}
              onSuccess={setCompletedData}
            />
          )}
        </main>
      </div>
    </FormProvider>
  )
}
