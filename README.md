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

<!-- 과제 요구사항 중 명확하지 않은 부분을 어떻게 해석했는지 기술 -->

---

## 설계 결정과 이유

### React Hook Form + useFormContext — 스텝 간 상태 공유

다단계 폼에서 스텝 이동 시 이전 입력값을 유지하기 위해 루트에서 `useForm`을 선언하고 `FormProvider`로 각 스텝 컴포넌트에 공유합니다. `useState`로 전체 폼 상태를 직접 관리하는 방식은 리렌더링 비용과 상태 초기화 위험이 있어 배제했습니다.

### Zod 스키마 스텝별 분리

각 스텝에서 필요한 필드만 검증하도록 `stepOneSchema`, `stepTwoSchema`, `stepThreeSchema`를 분리합니다. 스텝 이동 시 해당 스텝의 스키마만 `resolver`로 주입하여 불필요한 검증을 방지합니다.

### QueryClient 싱글턴 전략

Next.js App Router에서 서버/클라이언트 컴포넌트가 혼재합니다. `lib/query-client.ts`에서 서버사이드는 요청마다 새 인스턴스를 생성하고, 클라이언트사이드는 모듈 스코프 변수로 싱글턴을 유지합니다.

### MSW 지연 초기화 (Lazy Init)

`MSWProvider`는 클라이언트 컴포넌트로, `useEffect`에서 MSW를 동적 import하여 초기화합니다. Service Worker 등록 완료 전까지 자식 컴포넌트를 렌더링하지 않아 MSW 준비 전 API 요청이 나가는 경합 조건(race condition)을 방지합니다.

---

## 미구현 / 제약사항

<!-- 시간 또는 범위 제약으로 구현하지 못한 항목, 알려진 제약사항 기술 -->

---

## AI 활용 범위

<!-- Claude Code를 활용한 작업 범위와 직접 작성한 코드의 범위를 구분하여 기술 -->
