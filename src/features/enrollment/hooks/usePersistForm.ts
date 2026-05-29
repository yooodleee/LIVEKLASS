import { useEffect, useRef } from 'react'
import type { UseFormReturn } from 'react-hook-form'

import type { EnrollmentFormValues, Step } from '@/types/enrollment'

const DRAFT_KEY = 'liveklass_enrollment_draft'

// 24시간이 지난 임시 저장 데이터는 폐기
const DRAFT_TTL_MS = 24 * 60 * 60 * 1000

interface DraftData {
  formValues: Partial<EnrollmentFormValues>
  step: Step
  savedAt: string
}

export function loadDraft(): DraftData | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return null

    const draft = JSON.parse(raw) as DraftData

    if (Date.now() - new Date(draft.savedAt).getTime() > DRAFT_TTL_MS) {
      clearDraft()
      return null
    }

    return draft
  } catch {
    // SSR 환경(localStorage 미존재) 또는 JSON 파싱 실패 시 null 반환
    return null
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(DRAFT_KEY)
  } catch {
    // SSR 환경에서는 무시
  }
}

export function usePersistForm(
  methods: UseFormReturn<EnrollmentFormValues>,
  currentStep: Step,
): void {
  // ref로 최신 currentStep을 구독 — watch 구독을 재설정하지 않고도 항상 최신 스텝을 저장
  const currentStepRef = useRef<Step>(currentStep)
  useEffect(() => {
    currentStepRef.current = currentStep
  }, [currentStep])

  useEffect(() => {
    const subscription = methods.watch((formValues) => {
      try {
        const draft: DraftData = {
          // watch 콜백의 DeepPartial 반환 타입과 Partial<EnrollmentFormValues> 간 구조적 호환성 보장
          // JSON 직렬화/역직렬화 목적으로만 사용하므로 안전
          formValues: formValues as unknown as Partial<EnrollmentFormValues>,
          step: currentStepRef.current,
          savedAt: new Date().toISOString(),
        }
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
      } catch {
        // QuotaExceededError 등 localStorage 쓰기 실패 시 무시
      }
    })

    return () => subscription.unsubscribe()
  }, [methods])
}
