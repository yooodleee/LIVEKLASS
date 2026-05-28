# ADR-003 조건부 필드 데이터 처리 방침

## 결정 배경

신청 유형(INDIVIDUAL/GROUP) 전환 시 이전 타입에서 입력한 데이터를 어떻게 처리할지 결정이 필요했다. 데이터를 유지하는 방식과 초기화하는 방식 모두 유효한 선택지였다.

## 선택한 방식

- 유형 전환 시 확인 대화상자를 표시한다: "신청 유형을 변경하면 입력한 정보가 초기화됩니다. 계속하시겠습니까?"
- 확인 후에만 이전 타입 필드를 `setValue('individual', undefined)` / `setValue('group', undefined)`로 초기화한다
- 취소 시 타입 변경 없이 기존 입력값을 유지한다
- 타입 안전성을 위해 discriminated union을 적용한다

```typescript
type EnrollmentFields =
    | { enrollmentType: 'INDIVIDUAL'; individual: IndividualFields; group?: never }
    | { enrollmentType: 'GROUP'; group: GroupFields; individual?: never }
```

## 고려한 대안

- **유형 전환 시 데이터 유지**: 이전 타입 데이터를 그대로 두고 제출 시 현재 타입 데이터만 포함하는 방식
- **즉각 초기화(확인 없음)**: 전환 즉시 이전 데이터를 초기화하는 방식

## 선택 이유

사용자가 실수로 유형을 변경했을 때 입력 데이터 손실을 방지한다. discriminated union은 `group?: never` 패턴으로 현재 타입 외 필드가 제출 payload에 포함되지 않음을 타입 레벨에서 보장한다.

## 트레이드오프

- **장점**: 실수 방지 UX, 타입 레벨에서 잘못된 페이로드 전송 방지
- **단점**: 확인 대화상자로 인한 UX 마찰, `never` 타입 패턴으로 인한 코드 복잡도 증가
