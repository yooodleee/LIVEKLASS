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
