import { z } from 'zod';

export const enrollmentSchema = z.object({
  courseId: z.string().min(1, '강좌를 선택해주세요.'),
  studentName: z.string().min(2, '이름은 2자 이상이어야 합니다.'),
  email: z.string().email('올바른 이메일 형식을 입력해주세요.'),
  phone: z.string().regex(/^010-\d{4}-\d{4}$/, '전화번호 형식: 010-0000-0000'),
  paymentMethod: z.enum(['card', 'transfer', 'virtual'], {
    error: '결제 수단을 선택해주세요.',
  }),
  agreeToTerms: z.literal(true, {
    error: '이용 약관에 동의해주세요.',
  }),
});

export type EnrollmentFormValues = z.infer<typeof enrollmentSchema>;
