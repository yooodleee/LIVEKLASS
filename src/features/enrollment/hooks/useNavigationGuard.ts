import { useEffect, useRef } from 'react'

const CONFIRM_MESSAGE = '작성 중인 신청서가 있습니다. 페이지를 나가시겠습니까?'

/**
 * 폼 입력 중 브라우저 뒤로가기 / 탭 닫기 / 새로고침 시 이탈 확인 대화상자를 표시합니다.
 *
 * - beforeunload: 탭 닫기·새로고침 → 브라우저 기본 다이얼로그
 * - popstate: 브라우저 뒤로가기 → window.confirm 다이얼로그
 * - Next.js 내부 Link 이동은 router blocker API 부재로 차단하지 않습니다.
 */
export function useNavigationGuard(isActive: boolean): void {
  // popstate 핸들러가 자신의 history.back() 호출로 재진입하지 않도록 플래그 관리
  const allowNavigationRef = useRef(false)

  useEffect(() => {
    if (!isActive) return

    // 뒤로가기 차단을 위해 현재 위치를 히스토리 스택에 추가
    window.history.pushState(null, '', window.location.href)
    allowNavigationRef.current = false

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      // 일부 브라우저에서 필요한 레거시 속성
      e.returnValue = ''
    }

    const handlePopState = () => {
      if (allowNavigationRef.current) return

      const confirmed = window.confirm(CONFIRM_MESSAGE)
      if (confirmed) {
        // 확인 시: 재진입 방지 플래그 설정 후 실제 뒤로가기 실행
        allowNavigationRef.current = true
        window.history.back()
      } else {
        // 취소 시: 현재 위치를 다시 push하여 뒤로가기 차단 상태 유지
        window.history.pushState(null, '', window.location.href)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [isActive])
}
