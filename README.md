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
│       │   └── fields/         # 조건부 필드 컴포넌트 (PhoneField, MotivationField, ParticipantsField)
│       ├── hooks/              # useCourses, useEnrollmentMutation, usePersistForm, useNavigationGuard
│       ├── schema/             # stepOneSchema, stepTwoSchema, stepThreeSchema
│       ├── utils/              # buildEnrollmentRequest, courseStatus, formatPhone
│       └── constants/          # errorMessages
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

Step 3 확인 화면에서 "수정" 링크 클릭 시 해당 스텝으로 이동하고, 수정 완료 후 자동으로 Step 3으로 복귀합니다. `EnrollmentForm`의 `returnToConfirm` 상태로 수정 진입 여부를 추적하며, `handleStepOneNext` / `handleStepTwoNext`에서 이를 확인하여 Step 3으로 바로 이동합니다.

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
// NOTE: 단체 -> 개인 전환 시 GROUP 전용 필드를 undefined로 초기화하여
// 이전 단체 데이터가 제출 payload에 포함되지 않도록 처리
setValue('organizationName', undefined)
setValue('headCount', undefined)
setValue('managerPhone', undefined)
```

**Discriminated Union 타입 설계**

`EnrollmentFormValues`를 `IndividualFormValues | GroupFormValues` discriminated union으로 정의하여 TypeScript 타입 레벨에서 개인/단체 필드를 분기합니다. INDIVIDUAL 분기에서 GROUP 전용 필드(`organizationName`, `headCount`, `managerPhone`)는 `never`로 봉쇄되어 컴파일 타임에 혼입이 차단됩니다. 유효성 검증 레이어에서는 `stepTwoSchema`의 `z.discriminatedUnion('enrollmentType', [...])`이 런타임 동작을 보장합니다. `optional` 남용으로 두 유형의 필드를 하나의 flat 스키마에 묶으면 타입 경계가 흐려지고 런타임에서 필드 존재 여부를 별도로 확인해야 하므로 이 방식을 선택했습니다.

### QueryClient 싱글턴 전략

Next.js App Router에서 서버/클라이언트 컴포넌트가 혼재합니다. `lib/query-client.ts`에서 서버사이드는 요청마다 새 인스턴스를 생성하고, 클라이언트사이드는 모듈 스코프 변수로 싱글턴을 유지합니다.

### MSW 지연 초기화 (Lazy Init)

`MSWProvider`는 클라이언트 컴포넌트로, `useEffect`에서 MSW를 동적 import하여 초기화합니다. Service Worker 등록 완료 전까지 자식 컴포넌트를 렌더링하지 않아 MSW 준비 전 API 요청이 나가는 경합 조건(race condition)을 방지합니다.

---

## 미구현 / 제약사항

### 스텝 인디케이터 텍스트 ("N / 3")

평가 기준에 "현재 스텝 번호와 전체 스텝 수를 텍스트로도 표시한다 (예: 2 / 3)" 항목이 있으나, 기존 스텝 인디케이터의 원형 숫자 + 레이블 조합으로 현재 위치가 충분히 전달된다고 판단하여 별도 텍스트 표기는 구현하지 않았습니다. 구현 시 `StepIndicator` 상단에 `<p>{currentStep} / {STEPS.length}</p>`를 추가하는 방식으로 적용 가능합니다.

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

### 환경 설정 및 하네스 구축

1. Claude에게 다단계 수강 신청 폼 과제를 위한 프로젝트 초기 환경을 npm run dev 하나로 실행할 수 있도록 Success Criteria 생성을 의뢰했습니다. 생성된 SC를 과제 제약 사항에 부합하는지 다시 점검한 후 Claude Code에게 SC를 주입하여 프로젝트를 생성했습니다.

2. Claude에게 개발자가 프로젝트를 GitHub Public Repository의 main 브랜치를 기준으로 npm run dev로 실행 가능하도록 Success Criteria 생성을 의뢰했습니다. 생성된 SC가 과제 제약 사항에 부합하는지 다시 점검한 후 Claude Code에게 SC를 주입하여 프로젝트와 GitHub을 연동했습니다.

3. Claude에게 에이전트가 수강 신청 폼 과제의 도메인 맥락과 개발 규칙을 사전 지식 없이 올바르게 파악할 수 있도록 Success Criteria 생성을 의뢰했습니다. 생성된 SC가 과제 제약 사항에 부합하는지 다시 점검한 후 Claude Code에게 SC를 주입하여 CLAUDE.md 및 도메인 초기 타입을 설정했습니다.

4. Claude에게 에이전트가 타입 오류를 즉시 감지하고 다음 작업 전에 자가 수정할 수 있도록 Success Criteria 생성을 의뢰했습니다. 생성된 SC가 과제 제약 사항에 부합하는지 다시 점검한 후 Claude Code에게 SC를 주입하여 PostToolUse 타입 체크 훅을 설정했습니다.

5. Claude에게 에이전트가 린트 위반을 즉시 감지하고 다음 작업 전에 자가 수정할 수 있도록 Success Criteria 생성을 의뢰했습니다. 생성된 SC가 과제 제약 사항에 부합하는지 다시 점검한 후 Claude Code에게 SC를 주입하여 PostToolUse ESLint 훅을 설정했습니다.

6. Claude에게 에이전트가 타입 오류 또는 린트 오류가 존재하는 상태에서 git push가 실행되면 push 자체를 차단할 수 있도록 Success Criteria 생성을 의뢰했습니다. 생성된 SC가 과제 제약 사항에 부합하는지 다시 점검한 후 Claude Code에게 SC를 주입하여 PreToolUse git push 게이트를 설정했습니다.

7. Claude에게 에이전트가 현재 개발 단계에서 실제로 필요한 명령으로만 축소하여 사용할 수 있도록 Success Criteria 생성을 의뢰했습니다. 생성된 SC가 과제 제약 사항에 부합하는지 다시 점검한 후 Claude Code에게 SC를 주입하여 settings.local.json 허용 목록을 정리했습니다.

8. Claude에게 에이전트가 작업이 완료될 때마다 변경된 파일 목록과 작업 요약을 Slack으로 전송할 수 있도록 Success Criteria 생성을 의뢰했습니다. 생성된 SC가 과제 제약 사항에 부합하는지 다시 점검한 후 Claude Code에게 SC를 주입하여 Stop 훅 섹션을 추가하고 Slack 알림 전송 설정을 추가했습니다.

9. Claude에게 에이전트가 세부 평가 기준에 따라 기능을 개발하고 구현할 수 있도록 Success Criteria 생성을 의뢰했습니다. 생성된 SC가 과제 제약 사항에 부합하는지 다시 점검한 후 Claude Code에게 SC를 주입하여 평가 기준 및 ADR 초기 구조를 설정했습니다.

### 기능 구현

10. Claude에게 수강생은 강의 목록에서 카테고리 별로 강의를 탐색하고, 원하는 강의를 선택할 수 있도록 Success Criteria 생성을 의뢰했습니다. 생성된 SC가 필수 구현 사항에 부합하는지 다시 점검한 후 Claude Code에게 SC를 주입하여 수강생이 강의 목록에서 카테고리 별로 강의를 탐색하고, 원하는 강의를 선택할 수 있도록 구현했습니다.

11. Claude에게 수강생이 수강생 정보를 입력할 수 있도록 Success Criteria 생성을 의뢰했습니다. 생성된 SC가 필수 구현 사항에 부합하는지 다시 점검한 후 Claude Code에게 SC를 주입하여 수강생이 수강생 정보를 입력할 수 있도록 구현했습니다.

12. Claude에게 수강생이 1 ~ 2 단계에서 입력한 전체 내용을 검토하고, 이용 약관에 동의한 뒤 수강 신청을 제출할 수 있도록 Success Criteria 생성을 의뢰했습니다. 생성된 SC가 필수 구현 사항에 부합하는지 다시 점검한 후 Claude Code에게 SC를 주입하여 수강생이 수강 신청을 확인하고 제출할 수 있도록 구현했습니다.

13. Claude에게 수강생이 수강 신청 완료 후 수강 신청 정보를 확인할 수 있도록 Success Criteria 생성을 의뢰했습니다. 생성된 SC가 필수 구현 사항에 부합하는지 다시 점검한 후 Claude Code에게 SC를 주입하여 수강생이 수강 신청 완료 후 수강 신청 정보를 확인할 수 있도록 구현했습니다.

### 선택 기능 구현

14. Claude에게 수강생이 페이지를 새로 고침하거나 브라우저를 닫아도 작성 중인 폼 데이터와 현재 스텝이 복구될 수 있도록 Success Criteria 생성을 의뢰했습니다. 생성된 SC가 선택 구현 사항에 부합하는지 다시 점검한 후 Claude Code에게 SC를 주입하여 수강생이 페이지를 새로 고침하거나 브라우저를 닫아도 작성 중인 폼 데이터와 현재 스텝이 복구될 수 있도록 구현했습니다.

15. Claude에게 수강생이 폼 작성 중 페이지를 이탈하려 할 때 입력 데이터 손실 전에 확인 절차가 실행될 수 있도록 Success Criteria 생성을 의뢰했습니다. 생성된 SC가 선택 구현 사항에 부합하는지 다시 점검한 후 Claude Code에게 SC를 주입하여 수강생이 폼 작성 중 페이지를 이탈하려 할 때 입력 데이터 손실 전에 확인 절차가 실행될 수 있도록 구현했습니다.

### 리팩터링 및 UX 개선

16. Claude에게 각 필드의 인라인 validate 함수와 스텝별 개별 스키마로 분산된 검증 로직을 useWatch()와 trigger()로 일원화할 수 있도록 Success Criteria 생성을 의뢰했습니다. 생성된 SC가 React Hook Form 모범 사례 및 평가 기준에 부합하는지 다시 점검한 후 Claude Code에게 SC를 주입하여 스텝별 검증 흐름을 리팩터링했습니다.

17. Claude에게 단체 신청에서 참가자 최대 10명의 이름과 이메일을 한꺼번에 입력해야 하는 UX 문제를 점진적 추가 방식으로 개선할 수 있도록 Success Criteria 생성을 의뢰했습니다. 생성된 SC가 필수 구현 사항에 부합하는지 다시 점검한 후 Claude Code에게 SC를 주입하여 "+ 참가자 추가" 버튼과 개별 삭제 기능, 중복 에러 메시지 구체화를 구현했습니다.

18. Claude에게 수강 신청 제출 실패 시 네트워크 에러(오프라인·타임아웃)와 비즈니스 에러(정원 마감·중복 신청)를 구분하여 각각에 맞는 사용자 메시지를 표시할 수 있도록 Success Criteria 생성을 의뢰했습니다. 생성된 SC가 안정성 및 예외 처리 기준에 부합하는지 다시 점검한 후 Claude Code에게 SC를 주입하여 useEnrollmentMutation의 에러 분류 로직과 errorMessages.ts 상수를 보완했습니다.

### 리뷰 및 보완

19. Claude에게 전체 구현 완료 시점의 코드를 평가 기준 90점 기준으로 점수화하고 주요 감점 요인을 도출하기 위한 Success Criteria 생성을 의뢰했습니다. 도출된 평가 결과를 직접 검토한 후 감점 요인을 우선순위별로 정리하여 Claude Code에게 항목별로 보완을 의뢰했습니다.

20. Claude에게 정원 마감 강의 명시 문구 추가, EnrollmentFormValues discriminated union 재설계, StepThree 불필요한 re-export 제거, StepOne 에러 섹션 포커스 이동 구현을 위한 Success Criteria 생성을 의뢰했습니다. 생성된 SC가 평가 기준에 부합하는지 다시 점검한 후 Claude Code에게 SC를 주입하여 각 항목을 보완했습니다.

### 설계 검토 및 문서화

21. Claude에게 현재 폼 상태 관리 방식의 기술적 trade-off, 3단계 폼을 5단계로 확장할 경우 변경이 필요한 구조, 클라이언트와 서버 유효성 검증을 분리해야 하는 이유에 대한 기술적 검토를 의뢰했습니다. 논의 결과를 직접 검토한 후 설계 방향의 타당성을 확인하고 README 설계 결정 섹션 작성에 반영했습니다.

22. Claude에게 평가 기준 5번(문서화 및 설명 가능성)에 대응하는 README 항목 — 폼 상태 관리 방식 선택 이유, 유효성 검증 전략, 조건부 필드 데이터 처리 방침, 미구현 항목 — 을 작성할 수 있도록 Success Criteria 생성을 의뢰했습니다. 생성된 SC가 평가 기준에 부합하는지 다시 점검한 후 Claude Code에게 SC를 주입하여 README를 완성했습니다.
