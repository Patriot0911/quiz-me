import { z } from 'zod';

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Min 2 chars'),
  email: z.email('Invalid email'),
  password: z.string().min(6, 'Min 6 chars'),
});

export type TRegisterForm = z.infer<typeof registerSchema>;
