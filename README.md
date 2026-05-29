# LIVEKLASS — 다단계 수강 신청 서비스

## 프로젝트 개요

온라인 교육 플랫폼의 강의 수강 신청 흐름을 다단계 폼으로 구현한 프로젝트입니다.

- **서비스명**: LIVEKLASS
- **목적**: 수강생이 강의를 선택하고 신청 정보를 입력하여 수강 신청을 완료하는 3단계 폼 구현
- **신청 유형**: 개인 신청(INDIVIDUAL) / 단체 신청(GROUP) — 유형별 조건부 필드 분기

---

## 기술 스택

| 분류 | 라이브러리 | 버전 |
| ---- | ---------- | ---- |
| 프레임워크 | Next.js (App Router) | 16.x |
| 폼 상태 관리 | React Hook Form | 7.x |
| 스키마 유효성 검증 | Zod | 4.x |
| 서버 상태 관리 | TanStack Query | 5.x |
| Mock API | MSW (Mock Service Worker) | 2.x |
| 스타일 | Tailwind CSS | 4.x |
| 언어 | TypeScript | 5.x |

---

## 실행 방법

```bash
git clone https://github.com/yooodleee/LIVEKLASS.git
cd LIVEKLASS
cp .env.example .env.local
npm install
npm run dev
```

브라우저에서 `http://localhost:3001` 접속

### 주요 스크립트

```bash
npm run dev        # 개발 서버 실행 (포트 3001)
npm run build      # 프로덕션 빌드
npm run type-check # TypeScript 타입 검사
npm run lint       # ESLint 검사
npm run format     # Prettier 포맷
```

### 환경 변수

`.env.example`을 참고하여 `.env.local`을 설정합니다.

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_API_MOCKING=enabled
SLACK_WEBHOOK_URL=  # Slack Incoming Webhook URL
```

---

## 프로젝트 구조 설명

```
src/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # 루트 레이아웃 (QueryClientProvider, MSWProvider)
│   └── page.tsx                # 홈 페이지
├── components/                 # 공통 UI 컴포넌트
│   ├── Providers.tsx           # TanStack Query Provider
│   └── MSWProvider.tsx         # MSW 초기화 Provider
├── features/
│   └── enrollment/             # 수강 신청 도메인 (Feature Slice)
│       ├── components/
│       │   ├── steps/          # StepOne, StepTwo, StepThree
│       │   └── fields/         # 조건부 필드 컴포넌트
│       ├── hooks/              # useEnrollmentForm, useStepNavigation
│       ├── schema/             # stepOneSchema, stepTwoSchema, stepThreeSchema
│       ├── types/              # EnrollmentFormValues, Course 등
│       └── constants/          # ENROLLMENT_STEPS, STEP_LABELS
├── lib/
│   └── query-client.ts         # QueryClient 싱글턴 팩토리
├── mocks/                      # MSW 핸들러
│   ├── browser.ts              # setupWorker 초기화
│   ├── index.ts                # initMocks 진입점
│   └── handlers/
│       ├── course.ts           # 강좌 관련 핸들러
│       ├── enrollment.ts       # 수강 신청 핸들러
│       └── index.ts            # 핸들러 통합
└── types/
    └── enrollment.ts           # 도메인 핵심 타입 정의
```

### Mock API 엔드포인트

MSW v2 Service Worker(`public/mockServiceWorker.js`)가 브라우저에서 네트워크 요청을 인터셉트합니다.

| 메서드 | 엔드포인트 | 설명 | 지연 |
| ------ | ---------- | ---- | ---- |
| `GET` | `/api/courses` | 강의 목록 조회 | 800ms |
| `GET` | `/api/courses/:id` | 강의 상세 조회 | 800ms |
| `POST` | `/api/enrollments` | 수강 신청 제출 | 1200ms |

---

## 요구사항 해석 및 가정

### 정원 임박 기준 해석

요구사항의 "잔여석이 전체 정원의 20% 이하"를 `Math.ceil(maxCapacity * 0.2)` 기준으로 해석했습니다. 구현에서는 동일하게 `currentEnrollment >= maxCapacity * 0.8`(80% 이상 차면 임박)로 처리합니다.

### 단체 신청 참가자 명단 범위

요구사항에서 단체 신청 시 참가자 명단 이메일 중복 검증 대상을 "참가자 배열 내부"로 한정하여 해석했습니다. 담당자 이메일과 참가자 이메일 간의 교차 중복은 검증 범위에 포함하지 않았습니다.

### Step 3 수정 후 복귀

Step 3 확인 화면에서 "수정" 링크 클릭 시 해당 스텝으로 이동하고, 수정 완료 후 "다음 단계로" 버튼을 통해 Step 3으로 복귀하는 방식으로 구현했습니다. 수정 전 위치를 별도 상태로 기억하여 자동 복귀하는 방식은 스텝 이동 흐름을 복잡하게 만들 수 있어 단계적 진행 방식을 유지했습니다.

---

## 설계 결정과 이유

### React Hook Form + useFormContext — 스텝 간 상태 공유

다단계 폼에서 스텝 이동 시 이전 입력값을 유지하기 위해 루트 `EnrollmentForm`에서 `useForm`을 단일 인스턴스로 선언하고 `FormProvider`로 모든 스텝 컴포넌트에 공유합니다.

`useState`로 전체 폼 상태를 직접 관리하는 방식과 비교했을 때 다음 이점이 있습니다.

- **불필요한 리렌더링 방지**: React Hook Form은 비제어 컴포넌트(uncontrolled input) 방식으로 동작하여 입력값 변경 시 해당 필드만 리렌더링합니다.
- **스텝 간 데이터 유지**: 스텝 이동 시 컴포넌트가 언마운트되더라도 `useForm` 인스턴스가 유지되므로 별도 저장 로직 없이 입력값이 보존됩니다.
- **부분 검증 지원**: `trigger(fields)` API로 현재 스텝 필드만 선택적으로 검증할 수 있어 스텝별 진행 제어가 용이합니다.

### 유효성 검증 전략

**스텝별 부분 검증 vs 제출 시 전체 검증**

스텝 이동 시 해당 스텝 필드만 `trigger()`로 검증합니다. 제출 직전 Step 3에서 `agreedToTerms`를 최종 검증하는 방식으로 분리했습니다. 모든 필드를 제출 시점에 한꺼번에 검증하면 사용자가 오류 위치를 파악하기 어렵기 때문에 스텝 단위 즉시 피드백을 선택했습니다.

**blur 시 개별 필드 검증**

`useFormContext`의 `mode: 'onBlur'` 설정 또는 `onBlur` 핸들러에서 `trigger(fieldName)`을 호출하여 필드 이탈 시 해당 필드만 검증합니다. 입력 중 에러가 표시되면 사용자 경험을 저해하므로 blur 시점을 선택했습니다.

**클라이언트 검증과 서버 에러 처리 분리**

클라이언트 Zod 검증은 입력 형식·필수 여부 등 즉각 피드백이 가능한 항목에 한정합니다. 서버에서만 판단 가능한 오류(정원 마감, 중복 신청 등)는 `constants/errorMessages.ts`에 에러 코드별 메시지를 상수로 분리하고, `useEnrollmentMutation`의 `onError` 콜백에서 처리합니다. 에러 메시지를 컴포넌트에 하드코딩하지 않아 메시지 변경 시 단일 파일만 수정합니다.

### 조건부 필드 데이터 처리 방침

**신청 유형 전환 시 데이터 초기화 정책**

개인 ↔ 단체 전환 시 확인 대화상자를 먼저 표시하고, 사용자가 확인한 경우에만 이전 유형의 필드를 `setValue`로 `undefined` 처리합니다. 이는 두 가지 이유에서 결정했습니다.

1. 유형별 필드가 완전히 다르기 때문에 이전 데이터를 그대로 유지하면 제출 payload에 불필요한 값이 포함될 수 있습니다.
2. 사용자가 의도치 않게 유형을 변경한 경우 입력한 데이터를 보호할 수 있어야 합니다.

```typescript
// NOTE: 단체 -> 개인 전환 시 group 필드를 undefined로 초기화하여
// 이전 단체 데이터가 제출 payload에 포함되지 않도록 처리
setValue('group', undefined)
```

**Discriminated Union 타입 설계**

`stepTwoSchema`에서 `z.discriminatedUnion('enrollmentType', [...])` 을 사용하여 개인/단체 필드를 명시적으로 분기합니다. `optional` 남용으로 두 유형의 필드를 하나의 flat 스키마에 묶으면 타입 경계가 흐려지고 런타임에서 필드 존재 여부를 별도로 확인해야 합니다. Discriminated union은 TypeScript가 `enrollmentType` 값에 따라 가능한 필드를 정적으로 추론하므로 타입 안전성이 높아집니다.

### QueryClient 싱글턴 전략

Next.js App Router에서 서버/클라이언트 컴포넌트가 혼재합니다. `lib/query-client.ts`에서 서버사이드는 요청마다 새 인스턴스를 생성하고, 클라이언트사이드는 모듈 스코프 변수로 싱글턴을 유지합니다.

### MSW 지연 초기화 (Lazy Init)

`MSWProvider`는 클라이언트 컴포넌트로, `useEffect`에서 MSW를 동적 import하여 초기화합니다. Service Worker 등록 완료 전까지 자식 컴포넌트를 렌더링하지 않아 MSW 준비 전 API 요청이 나가는 경합 조건(race condition)을 방지합니다.

---

## 미구현 / 제약사항

### 스텝 인디케이터 텍스트 ("N / 3")

평가 기준에 "현재 스텝 번호와 전체 스텝 수를 텍스트로도 표시한다 (예: 2 / 3)" 항목이 있으나, 기존 스텝 인디케이터의 원형 숫자 + 레이블 조합으로 현재 위치가 충분히 전달된다고 판단하여 별도 텍스트 표기는 구현하지 않았습니다. 구현 시 `StepIndicator` 상단에 `<p>{currentStep} / {STEPS.length}</p>`를 추가하는 방식으로 적용 가능합니다.

### 수정 후 Step 3 자동 복귀

Step 3에서 "수정" 링크로 이전 스텝 이동 후 자동으로 Step 3에 복귀하는 기능은 부분 구현 상태입니다. 현재는 수정 후 "다음 단계로" 버튼을 통해 순차적으로 Step 3까지 진행해야 합니다. 완전한 자동 복귀를 위해서는 `returnToStep` 상태를 `EnrollmentForm`에 추가하고 스텝 전환 시 이를 참조하는 방식으로 구현할 수 있습니다.

### 참가자 명단 CSV 붙여넣기 (추후 개선 예정)

현재 단체 신청 참가자 명단은 한 명씩 수동으로 추가하는 방식으로 구현되어 있습니다. 실무에서는 엑셀·스프레드시트에서 복사한 데이터를 한 번에 붙여넣는 방식이 훨씬 효율적입니다.

구현 접근법:
- textarea에 붙여넣은 텍스트를 파싱 (탭 `\t` 구분 → 컬럼, 줄바꿈 `\n` 구분 → 행)
- 파싱 결과를 `useFieldArray`의 `replace()`로 한 번에 채움
- 형식 안내 및 파싱 실패 시 인라인 에러 표시

```
엑셀에서 복사한 내용을 붙여넣으세요 (이름, 이메일 순서)
┌────────────────────────────────────────┐
│ 홍길동  hong@example.com              │
│ 김철수  kim@example.com               │
└────────────────────────────────────────┘
[붙여넣기로 추가]
```

---

## AI 활용 범위

<!-- Claude Code를 활용한 작업 범위와 직접 작성한 코드의 범위를 구분하여 기술 -->
