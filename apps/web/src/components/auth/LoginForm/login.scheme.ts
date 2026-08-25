import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email('Invalid email'),
  password: z.string().min(6, 'Min 6 chars'),
});

export type TLoginForm = z.infer<typeof loginSchema>;
