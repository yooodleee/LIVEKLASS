import type { Step } from '@/types/enrollment'

const STEPS: { step: Step; label: string }[] = [
  { step: 1, label: '강의 선택' },
  { step: 2, label: '신청자 정보' },
  { step: 3, label: '신청 확인' },
]

interface StepIndicatorProps {
  currentStep: Step
  isPending?: boolean
  onCompletedStepClick?: (step: Step) => void
}

export default function StepIndicator({
  currentStep,
  isPending = false,
  onCompletedStepClick,
}: StepIndicatorProps) {
  return (
    <ol className="flex items-center justify-center gap-0">
      {STEPS.map(({ step, label }, index) => {
        const isCompleted = step < currentStep
        const isActive = step === currentStep
        const isClickable = isCompleted && !isPending && !!onCompletedStepClick

        return (
          <li key={step} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              {isClickable ? (
                <button
                  type="button"
                  onClick={() => onCompletedStepClick(step)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-700"
                  aria-label={`${label} 단계로 이동`}
                >
                  <CheckIcon />
                </button>
              ) : (
                <div
                  className={[
                    'flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                    isCompleted
                      ? 'bg-blue-600 text-white'
                      : isActive
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                        : 'bg-gray-100 text-gray-400',
                  ].join(' ')}
                  aria-current={isActive ? 'step' : undefined}
                >
                  {isCompleted ? <CheckIcon /> : step}
                </div>
              )}
              <span
                className={[
                  'text-xs font-medium',
                  isActive || isCompleted ? 'text-blue-600' : 'text-gray-400',
                ].join(' ')}
              >
                {label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={[
                  'mb-5 h-px w-16 transition-colors sm:w-24',
                  isCompleted ? 'bg-blue-600' : 'bg-gray-200',
                ].join(' ')}
                aria-hidden="true"
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  )
}
