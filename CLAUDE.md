@AGENTS.md

## 프로젝트 개요
- 서비스명: LIVEKLASS
- 목적: 온라인 교육 플랫폼의 강의 수강 신청 흐름을 다단계 폼으로 구현
- 평가 기준: 폼 상태 관리 / 유효성 검증 설계 / 조건부 필드 처리 / 스텝 간 데이터 흐름의 안정성과 UX

---

## 도메인 시나리오
- 수강생은 원하는 강의를 선택하고 신청 정보를 입력하여 수강 신청한다
- 신청 유형은 개인 신청과 단체 신청 두 가지로 나뉜다
- 신청 유형에 따라 입력 필드가 달라진다 (조건부 필드)
- 신청은 3단계로 구성되며 각 단계 입력값은 이전 단계로 돌아가도 유지된다
- 최종 확인 화면에서 전체 입력 내용을 검토한 후 제출한다

## 폼 스텝 구조
- Step 1: 강의 선택 (강의 목록 조회 및 선택)
- Step 2: 신청자 정보 입력 (신청 유형에 따라 조건부 필드 분기)
- Step 3: 최종 확인 및 제출

---

## 조건부 필드 규칙

### 개인 신청 (INDIVIDUAL)
- 신청자 이름
- 이메일
- 연락처

### 단체 신청 (GROUP)
- 기관명
- 담당자 이름
- 담당자 이메일
- 담당자 연락처
- 신청 인원 수 (2인 이상)

---

## 핵심 타입 (src/types/enrollment.ts 기준)
- EnrollmentType: 'INDIVIDUAL' | 'GROUP'
- Step: 1 | 2 | 3
- CourseStatus: 'OPEN' | 'CLOSED' | 'FULL'

---

## 기술 스택 규칙
- 폼 상태 관리: React Hook Form (useFormContext로 스텝 간 공유)
- 스키마 유효성 검증: Zod (스텝별 스키마 분리 적용)
- 서버 상태: TanStack Query (강의 목록 조회, 수강 신청 제출)
- 스타일: Tailwind CSS

## 허용 명령 범위 (settings.local.json 기준)
- npm run *    : 프로젝트 스크립트 실행
- git *        : 버전 관리 명령
- npx tsc *    : 타입 체크 (훅 전용)
- npx eslint * : 린트 검사 (훅 전용)

## 절대 하지 말아야 할 것
- useState로 폼 전체 상태를 직접 관리하지 않는다
- 스텝 이동 시 이전 스텝의 입력값을 초기화하지 않는다
- 유효성 검증을 인라인 조건문으로 구현하지 않는다
- any 타입을 사용하지 않는다
- rm -rf 등 파일 삭제 명령을 실행하지 않는다
- npm install 등 의존성 변경 명령을 임의로 실행하지 않는다
- 허용 목록 외 명령이 필요한 경우 반드시 사용자에게 먼저 확인한다

---

## 폴더 컨벤션
```
src/features/enrollment/
|-- components/
|   |-- steps/   # StepOne, StepTwo, StepThree
|   |-- fields/  # 조건부 필드 컴포넌트
|-- hooks/       # useEnrollmentForm, useStepNavigation
|-- schema/      # stepOneSchema, stepTwoSchema, stepThreeSchema
|-- types/       # EnrollmentFormValues, Course 등
|-- constants/   # ENROLLMENT_STEPS, STEP_LABELS
```

## 네이밍 규칙
- 컴포넌트: PascalCase (예: StepOneForm.tsx)
- 훅: camelCase + use 접두사 (예: useStepNavigation.ts)
- 스키마: camelCase + Schema 접미사 (예: stepTwoSchema.ts)
- 상수: UPPER_SNAKE_CASE

---

## Mock API 엔드포인트
```
GET  /api/courses        # 강의 목록 조회
GET  /api/courses/:id    # 강의 상세 조회
POST /api/enrollments    # 수강 신청 제출
```

## 응답 지연 설정 (MSW)
- 목록 조회: 800ms
- 제출: 1200ms (로딩 상태 UX 확인 목적)

---

## 작업 완료 Slack 알림 (Stop 훅)
- 에이전트 작업이 완료되면 .claude/scripts/notify-slack.sh 가 자동 실행된다
- 변경된 파일이 존재할 경우에만 Slack 알림이 전송된다
- 알림에는 현재 브랜치, 최근 커밋, 변경 파일 목록(최대 10개)이 포함된다
- SLACK_WEBHOOK_URL 이 .env.local 에 설정되지 않으면 알림 없이 정상 종료된다

## 자동 타입 체크 훅
- Write / Edit 를 실행한 직후 tsc --noEmit이 자동 실행된다
- 타입 오류가 출력되면 다음 작업으로 넘어가기 전에 즉시 수정한다
- 오류 수정 없이 다음 스텝을 진행하지 않는다
- any 타입은 tsconfig noImplicitAny 설정으로 컴파일 오류 처리된다

## 자동 ESLint 체크 훅
- Write / Edit 실행 직후 tsc → eslint 순으로 자동 실행된다
- 린트 오류가 출력되면 다음 작업으로 넘어가기 전에 즉시 수정한다
- --max-warnings 0 설정으로 경고도 오류로 처리된다
- react-hooks/exhaustive-deps 위반은 useEffect 의존성 배열을 반드시 수정한다
- import 순서 오류는 eslint --fix 로 자동 수정 후 재확인한다

## git push 게이트
- git push 실행 전 tsc --noEmit → eslint src/ 가 순서대로 자동 실행된다
- 둘 중 하나라도 오류가 있으면 push가 차단된다
- push가 차단되면 오류를 모두 수정한 뒤 다시 push를 시도한다
- push 게이트는 PostToolUse 훅의 즉시 피드백과 별개로 동작하는 최종 안전망이다
- 게이트를 우회하는 --no-verify 옵션은 사용하지 않는다

---

## 평가 기준 1 - 요구사항 이해 및 문제 정의 (20점)

### 조건부 필드 전환 규칙 (높은 숙련도 기준)
- 신청 유형(INDIVIDUAL <-> GROUP) 변경 시 반드시 확인 대화상자를 표시한다
  - "신청 유형을 변경하면 입력한 정보가 초기화됩니다. 계속하시겠습니까?"
- 확인 후에만 이전 타입의 데이터를 폼 상태에서 초기화한다
- 취소 시 타입 변경 없이 기존 입력값을 유지한다

### 이메일 중복 처리 규칙
- 단체 신청 참가자 명단 내 이메일 중복은 Zod `refine()`으로 배열 레벨에서 검증한다
- 중복 발생 시 중복된 항목의 인덱스를 특정하여 해당 필드에 에러를 표시한다
- 에러 메시지: "이미 입력된 이메일 주소입니다."

### 정원 임박 강의 UX 규칙
- 잔여석이 전체 정원의 20% 이하인 경우 "마감 임박" 배지를 표시한다
  - 잔여석 = `maxCapacity - currentCount`
  - 임박 기준 = `Math.ceil(maxCapacity * 0.2)`
- 잔여석이 0인 경우(`CourseStatus: 'FULL'`) 선택 버튼을 비활성화하고 "정원이 마감된 강의입니다." 메시지를 표시한다
- 정원 임박 강의를 선택한 경우 Step 1 하단에 인라인 경고를 표시한다

---

## 평가 기준 2 - 설계 및 코드 구조 (25점)

### 폼 상태 관리 패턴 (높은 숙련도 기준)
- 전체 폼 상태는 최상위 `useForm` 인스턴스 하나로 통합 관리한다
- 각 스텝 컴포넌트는 `useFormContext()`로 상태를 공유한다
- `useState`로 폼 입력값을 직접 관리하지 않는다
- 스텝 이동 시 `trigger()`로 해당 스텝 필드만 부분 검증한다

### 스텝별 Zod 스키마 분리 규칙
```
src/features/enrollment/schema/
├── stepOneSchema.ts    # courseId 검증
├── stepTwoSchema.ts    # enrollmentType + discriminated union
└── stepThreeSchema.ts  # 전체 통합 스키마 (제출 직전 최종 검증)
```

### Discriminated Union 타입 설계 (높은 숙련도 기준)
- 개인/단체 필드를 discriminated union으로 분리한다
```typescript
type EnrollmentFields =
    | { enrollmentType: 'INDIVIDUAL'; individual: IndividualFields; group?: never }
    | { enrollmentType: 'GROUP'; group: GroupFields; individual?: never }
```
- `any` 또는 `optional` 남용으로 타입 경계를 흐리지 않는다

### 컴포넌트 분리 기준
- 스텝 컴포넌트 (`steps/`): 레이아웃 + 필드 조합만 담당
- 필드 컴포넌트 (`fields/`): 단일 입력 단위, 에러 표시 포함
- 훅 (`hooks/`): 폼 상태 / 스텝 네비게이션 / 제출 로직
- 스키마 (`schema/`): 유효성 검증 로직 — UI 컴포넌트와 완전히 분리
- 한 파일에 스텝 UI + 검증 로직 + 제출 로직을 함께 작성하지 않는다

---

## 평가 기준 3 - 안정성 및 예외 처리 (20점)

### 제출 실패 처리 규칙
- TanStack Query `useMutation`의 `onError` 콜백에서 에러를 처리한다
- 제출 실패 시 폼 입력값을 초기화하지 않는다
- 재시도 버튼을 Step 3 확인 화면에 표시한다
- `mutate()` 실행 중 다른 스텝으로 이동하지 않는다

### 서버 에러 코드별 사용자 메시지
- 에러 코드와 사용자 메시지를 상수로 분리하여 관리한다
  - 파일 위치: `src/features/enrollment/constants/errorMessages.ts`
- 에러 메시지를 컴포넌트 내 하드코딩하지 않는다

### 빈 상태 / 로딩 상태 처리 규칙
- 강의 목록 로딩 중: 스켈레톤 UI 또는 스피너를 표시한다
- 강의 목록이 비어있을 때: "현재 신청 가능한 강의가 없습니다." 안내 메시지를 표시한다
- 강의 목록 조회 실패 시: 에러 메시지 + 재시도 버튼을 표시한다
- 제출 중: 제출 버튼을 비활성화하고 로딩 인디케이터를 표시한다

### 중복 제출 방지 규칙
- `useMutation`의 `isPending` 상태가 `true`인 동안 제출 버튼을 `disabled` 처리한다
- `isPending` 상태에서 스텝 뒤로 가기 버튼도 비활성화한다
- 버튼 `disabled` 처리만으로 충분하며 별도 debounce는 적용하지 않는다

---

## 평가 기준 4 - UI/UX 구현 (15점)

### 스텝 인디케이터 구현 기준
- 완료 스텝 / 현재 스텝 / 미완료 스텝을 시각적으로 구분한다
- 완료된 스텝은 클릭하여 해당 스텝으로 이동할 수 있다 (단, 미완료 스텝으로의 직접 이동은 허용하지 않는다)
- 현재 스텝 번호와 전체 스텝 수를 텍스트로도 표시한다 (예: "2 / 3")

### 유효성 에러 UX 기준 (높은 숙련도 기준)
- 스텝 전환 시 해당 스텝 전체 필드를 `trigger()`로 검증한다
- 필드 blur 시 해당 필드를 개별 검증한다 (`mode: 'onBlur'` 또는 `trigger(fieldName)`)
- 에러 발생 시 첫 번째 에러 필드로 포커스를 이동한다
```typescript
// 에러 필드 포커스 이동 예시
const firstErrorField = Object.keys(errors)[0]
setFocus(firstErrorField)
```
- 에러 상태 필드는 테두리 색상 변경 + 에러 메시지 텍스트로 시각적으로 강조한다

### Step 3 확인 화면 구현 기준
- 전체 입력 내용을 섹션별(강의 정보 / 신청자 정보)로 구분하여 표시한다
- 각 섹션 우측에 "수정" 링크를 배치하여 해당 스텝으로 바로 이동한다
- 수정 후 Step 3으로 자동 복귀한다 (수정 전 스텝 위치를 기억)

### 조건부 필드 전환 UX 기준
- 개인 <-> 단체 전환 시 필드 영역이 자연스럽게 교체되어야 한다
- 확인 대화상자 없이 즉각적인 필드 교체가 일어나지 않는다 (평가 기준 1 동일 적용)

---

## 평가 기준 5 - 문서화 및 설명 가능성 (10점)

### README 필수 기술 항목
기능 구현 완료 후 README에 아래 항목을 반드시 작성한다.

#### 폼 상태 관리 방식 선택 이유
- React Hook Form + `useFormContext` 선택 이유
- `useState` 대비 비제어 컴포넌트 방식의 성능상 이점
- 스텝 간 데이터 유지 전략

#### 유효성 검증 전략
- 스텝별 부분 검증 vs 제출 시 전체 검증 선택 이유
- blur 시 개별 검증 적용 이유
- 클라이언트 검증과 서버 에러 코드 처리 분리 전략

#### 조건부 필드 데이터 처리 방침
- 신청 유형 전환 시 데이터 초기화 정책 결정 이유
- discriminated union 타입 설계 선택 이유

#### 미구현 항목 (해당 시)
- 구현하지 못한 기능과 그 이유를 솔직하게 기술한다
- 구현했을 경우의 접근 방법(대안)을 간략히 명시한다

### 기술 결정 주석 규칙
- 비자명한 구현 결정에는 인라인 주석으로 이유를 기술한다
```typescript
// NOTE: 단체 -> 개인 전환 시 group 필드를 undefined로 초기화하여
// 이전 단체 데이터가 제출 payload에 포함되지 않도록 처리
setValue('group', undefined)
```
