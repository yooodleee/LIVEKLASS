import { z } from 'zod'

export const stepThreeSchema = z.object({
  agreedToTerms: z.literal(true, {
    error: '이용 약관에 동의해 주세요.',
  }),
})

export type StepThreeValues = z.infer<typeof stepThreeSchema>
