import { z } from 'zod';

export const createJobSchema = z.object({
  type: z.string().min(1, 'Job type is required'),
  priority: z.enum(['low', 'normal', 'high', 'critical']),
  payload: z.string().refine(
    (val) => {
      try {
        JSON.parse(val);
        return true;
      } catch {
        return false;
      }
    },
    { message: 'Payload must be valid JSON' },
  ),
  maxRetries: z.number().min(0).max(10),
});

export type CreateJobFormValues = z.infer<typeof createJobSchema>;
