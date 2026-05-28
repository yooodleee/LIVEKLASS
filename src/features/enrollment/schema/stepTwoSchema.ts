import { z } from 'zod'

export const PHONE_REGEX = /^(01[016789]{1})[0-9]{3,4}[0-9]{4}$/

export const commonSchema = z.object({
  name: z
    .string()
    .min(2, '이름은 최소 2자 이상 입력해 주세요.')
    .max(20, '이름은 최대 20자까지 입력 가능합니다.'),
  email: z
    .string()
    .min(1, '이메일을 입력해 주세요.')
    .email('올바른 이메일 형식이 아닙니다.'),
  phone: z
    .string()
    .min(1, '전화번호를 입력해 주세요.')
    .regex(PHONE_REGEX, '올바른 한국 전화번호 형식이 아닙니다. (예: 01012345678)'),
  motivation: z.string().max(300, '수강 동기는 최대 300자까지 입력 가능합니다.').optional(),
})

const individualSchema = commonSchema.extend({
  enrollmentType: z.literal('INDIVIDUAL'),
})

const groupSchema = commonSchema.extend({
  enrollmentType: z.literal('GROUP'),
  organizationName: z.string().min(1, '단체명을 입력해 주세요.'),
  headCount: z
    .number({ error: '신청 인원수를 입력해 주세요.' })
    .int()
    .min(2, '단체 신청은 최소 2명 이상이어야 합니다.')
    .max(10, '단체 신청은 최대 10명까지 가능합니다.'),
  participants: z
    .array(
      z.object({
        name: z.string().min(1, '참가자 이름을 입력해 주세요.'),
        email: z
          .string()
          .min(1, '참가자 이메일을 입력해 주세요.')
          .email('올바른 이메일 형식이 아닙니다.'),
      }),
    )
    .superRefine((participants, ctx) => {
      const emails = participants.map((p) => p.email)
      emails.forEach((email, index) => {
        if (emails.indexOf(email) !== index) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: '이미 입력된 이메일 주소입니다.',
            path: [index, 'email'],
          })
        }
      })
    }),
  managerPhone: z
    .string()
    .min(1, '담당자 연락처를 입력해 주세요.')
    .regex(PHONE_REGEX, '올바른 한국 전화번호 형식이 아닙니다. (예: 01012345678)'),
})

export const stepTwoSchema = z.discriminatedUnion('enrollmentType', [
  individualSchema,
  groupSchema,
])

export type StepTwoValues = z.infer<typeof stepTwoSchema>
