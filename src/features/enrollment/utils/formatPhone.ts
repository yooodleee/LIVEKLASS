/**
 * 숫자 문자열을 화면 표시용 하이픈 포맷으로 변환합니다.
 * 저장값: 01012345678 → 표시값: 010-1234-5678
 */
export function formatPhoneDisplay(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 11)
  if (digits.length < 4) return digits
  if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  if (digits.length < 11) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
}

/**
 * 입력값에서 하이픈을 제거한 순수 숫자 문자열을 반환합니다.
 * 표시값: 010-1234-5678 → 저장값: 01012345678
 */
export function stripPhoneHyphens(value: string): string {
  return value.replace(/\D/g, '').slice(0, 11)
}
