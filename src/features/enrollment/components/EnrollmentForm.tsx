'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import type { Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import type { EnrollmentFormValues, Step } from '@/types/enrollment'
import type { EnrollmentRequest, EnrollmentResponse } from '@/types/enrollments'
import { isErrorResponse } from '@/types/enrollments'

import { stepOneSchema } from '../schema/stepOneSchema'
import { stepTwoSchema } from '../schema/stepTwoSchema'
import { useEnrollmentMutation } from '../hooks/useEnrollmentMutation'

// 각 스텝 스키마의 infer 타입이 EnrollmentFormValues보다 좁기 때문에 unknown 경유 캐스트
// zodResolver는 런타임 검증만 수행하며, values 반환값은 RHF가 폼 상태 갱신에 사용하지 않으므로 안전
const stepResolvers: Partial<Record<1 | 2, Resolver<EnrollmentFormValues>>> = {
  1: zodResolver(stepOneSchema) as unknown as Resolver<EnrollmentFormValues>,
  2: zodResolver(stepTwoSchema) as unknown as Resolver<EnrollmentFormValues>,
}

import StepIndicator from './StepIndicator'
import StepOne from './steps/StepOne'
import StepThree from './steps/StepThree'
import StepTwo from './steps/StepTwo'

export default function EnrollmentForm() {
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [returnToConfirm, setReturnToConfirm] = useState(false)
  const [completedData, setCompletedData] = useState<EnrollmentResponse | null>(null)

  // 항상 최신 currentStep을 참조하도록 ref로 관리 (resolver 내부에서 사용)
  // 검증은 버튼 클릭 시점에만 발생하므로 useEffect 동기화로 충분
  const currentStepRef = useRef<Step>(1)
  useEffect(() => {
    currentStepRef.current = currentStep
  }, [currentStep])

  const resolver = useCallback<Resolver<EnrollmentFormValues>>(
    async (...args) => {
      const step = currentStepRef.current
      if (step === 1 || step === 2) {
        const stepResolver = stepResolvers[step]
        if (stepResolver) return stepResolver(...args)
      }
      // Step 3의 agreedToTerms는 로컬 상태로 처리하므로 폼 검증 생략
      return { values: args[0], errors: {} }
    },
    [],
  )

  const methods = useForm<EnrollmentFormValues>({
    mode: 'onBlur',
    resolver,
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

  const handleReset = () => {
    methods.reset()
    mutation.reset()
    setCompletedData(null)
    setCurrentStep(1)
    setReturnToConfirm(false)
  }

  // 제출 완료 화면
  if (completedData) {
    return (
      <CompletionScreen
        data={completedData}
        onReset={handleReset}
      />
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

const STATUS_LABELS: Record<EnrollmentResponse['status'], string> = {
  confirmed: '신청 완료',
  pending: '확인 중',
}

const dateFormatter = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
})

function CompletionScreen({
  data,
  onReset,
}: {
  data: EnrollmentResponse
  onReset: () => void
}) {
  // 완료 화면 진입 시 뒤로 가기로 폼 재진입 차단
  useEffect(() => {
    // 현재 히스토리 항목을 교체하여 완료 화면이 스택에 남지 않게 처리
    window.history.replaceState(null, '', window.location.href)

    const handlePopState = () => {
      // 뒤로 가기 시도 시 현재 위치를 다시 push하여 이동 차단
      window.history.pushState(null, '', window.location.href)
    }

    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  const formattedDate = dateFormatter.format(new Date(data.enrolledAt))
  const statusLabel = STATUS_LABELS[data.status]

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <div className="flex flex-col items-center gap-8 rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center">
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

        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-gray-900">수강 신청이 완료되었습니다!</h2>
          <p className="mt-1 text-sm text-gray-500">
            입력하신 이메일로 신청 확인 안내가 발송됩니다.
          </p>
        </div>

        <dl className="w-full max-w-sm divide-y divide-gray-100 rounded-xl border border-gray-200 text-left">
          <div className="flex items-center gap-4 px-5 py-3">
            <dt className="w-24 shrink-0 text-xs text-gray-500">신청 번호</dt>
            <dd className="text-sm font-medium text-gray-900">{data.enrollmentId}</dd>
          </div>
          <div className="flex items-center gap-4 px-5 py-3">
            <dt className="w-24 shrink-0 text-xs text-gray-500">신청 상태</dt>
            <dd className="text-sm font-medium text-gray-900">{statusLabel}</dd>
          </div>
          <div className="flex items-center gap-4 px-5 py-3">
            <dt className="w-24 shrink-0 text-xs text-gray-500">신청 일시</dt>
            <dd className="text-sm text-gray-900">{formattedDate}</dd>
          </div>
        </dl>

        <button
          type="button"
          onClick={onReset}
          className="rounded-lg bg-blue-600 px-8 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          처음으로
        </button>
      </div>
    </div>
  )
}
