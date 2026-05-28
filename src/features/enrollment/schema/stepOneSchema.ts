import { z } from 'zod'

export const stepOneSchema = z.object({
  courseId: z.string().min(1, '강의를 선택해주세요.'),
  enrollmentType: z.enum(['INDIVIDUAL', 'GROUP'], {
    error: '신청 유형을 선택해주세요.',
  }),
})

export type StepOneValues = z.infer<typeof stepOneSchema>
