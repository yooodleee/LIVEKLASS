# LIVEKLASS — 다단계 수강 신청 서비스

## 기술 스택 선택 이유

### TanStack Query v5

서버 상태(강좌 목록, 수강 신청 결과)와 클라이언트 UI 상태를 명확히 분리하기 위해 선택했습니다. 캐싱·자동 재검증·로딩/에러 상태 처리가 내장되어 있어 비동기 데이터 흐름을 선언적으로 관리할 수 있습니다.

### React Hook Form + Zod

다단계 폼에서 단계별 유효성 검증이 필요하므로, 비제어 컴포넌트 기반으로 리렌더링을 최소화하는 React Hook Form을 선택했습니다. Zod는 스키마 기반으로 런타임 타입 안전성을 제공하며, `@hookform/resolvers`로 두 라이브러리를 자연스럽게 연결합니다.

### MSW v2 (Mock Service Worker)

브라우저 Service Worker 레벨에서 네트워크 요청을 인터셉트하므로, 실제 HTTP 요청 흐름을 그대로 유지하면서 백엔드 없이 개발할 수 있습니다. `fetch`/`axios` 등 HTTP 클라이언트에 무관하게 동작합니다.

### Tailwind CSS v4

유틸리티 퍼스트 방식으로 빠른 스타일링이 가능하며, 별도 UI 라이브러리 없이 접근성(a11y)을 고려한 커스텀 컴포넌트를 직접 구성합니다. 추후 shadcn/ui 연동을 고려한 구조입니다.

---

## 로컬 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

---

## Mock API 구성 방식 및 엔드포인트 목록

MSW v2 Service Worker(`public/mockServiceWorker.js`)가 브라우저에서 네트워크 요청을 인터셉트합니다.
개발 서버 시작 시 콘솔에 `[MSW] Mocking enabled.` 메시지가 표시됩니다.

| 메서드 | 엔드포인트                       | 설명                |
| ------ | -------------------------------- | ------------------- |
| `GET`  | `/api/courses`                   | 전체 강좌 목록 조회 |
| `GET`  | `/api/courses/:courseId`         | 단일 강좌 상세 조회 |
| `POST` | `/api/enrollments`               | 수강 신청 제출      |
| `GET`  | `/api/enrollments/:enrollmentId` | 수강 신청 내역 조회 |

핸들러 파일: `src/mocks/handlers/course.ts`, `src/mocks/handlers/enrollment.ts`

---

## 폴더 구조

```
src/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # 루트 레이아웃 (QueryClientProvider, MSWProvider)
│   └── page.tsx                # 홈 페이지
├── components/                 # 공통 UI 컴포넌트
│   ├── Providers.tsx           # TanStack Query Provider
│   └── MSWProvider.tsx         # MSW 초기화 Provider
├── features/
│   └── enrollment/             # 수강 신청 도메인
│       ├── components/         # 수강 신청 폼 컴포넌트
│       ├── hooks/              # useCourses, useEnrollment 훅
│       ├── schema/             # Zod 스키마 (enrollmentSchema)
│       └── types/              # 도메인 타입 정의
├── lib/
│   └── query-client.ts         # QueryClient 싱글턴 팩토리
├── mocks/                      # MSW 핸들러
│   ├── browser.ts              # setupWorker 초기화
│   ├── index.ts                # initMocks 진입점
│   └── handlers/
│       ├── course.ts           # 강좌 관련 핸들러
│       ├── enrollment.ts       # 수강 신청 핸들러
│       └── index.ts            # 핸들러 통합
└── types/                      # 공통 타입 정의
```

---

## 주요 구현 결정 사항 (Architecture Decision)

### 1. QueryClient 싱글턴 전략

Next.js App Router에서 서버/클라이언트 컴포넌트가 혼재합니다. `lib/query-client.ts`에서 서버사이드는 요청마다 새 인스턴스를 생성하고, 클라이언트사이드는 모듈 스코프 변수로 싱글턴을 유지합니다.

### 2. MSW 지연 초기화 (Lazy Init)

`MSWProvider`는 클라이언트 컴포넌트로, `useEffect`에서 MSW를 동적 import하여 초기화합니다. Service Worker 등록 완료 전까지 자식 컴포넌트를 렌더링하지 않아 MSW가 준비되기 전 API 요청이 나가는 경합 조건(race condition)을 방지합니다.

### 3. 도메인 중심 폴더 구조 (Feature Slice)

`features/enrollment/` 하위에 컴포넌트·훅·스키마·타입을 함께 배치하여 관심사를 도메인 단위로 응집합니다. 기능이 추가될 때 `features/` 하위에 새 슬라이스를 추가하는 방식으로 확장합니다.

### 4. Zod 스키마 단일 소스

폼 유효성 검증과 TypeScript 타입(`z.infer<>`)을 동일한 Zod 스키마에서 파생시켜 런타임 검증과 컴파일 타임 타입이 항상 일치하도록 합니다.
