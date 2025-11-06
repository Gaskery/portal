/**
 * Schemas de Validação - Autenticação
 */

import { z } from 'zod';
import { UserRole } from '@prisma/client';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export const registerSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(12, 'Senha deve ter no mínimo 12 caracteres')
    .regex(/[a-z]/, 'Senha deve conter letras minúsculas')
    .regex(/[A-Z]/, 'Senha deve conter letras maiúsculas')
    .regex(/[0-9]/, 'Senha deve conter números')
    .regex(/[^a-zA-Z0-9]/, 'Senha deve conter caracteres especiais'),
  confirmPassword: z.string(),
  phone: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
  organizationId: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z
    .string()
    .min(12, 'Nova senha deve ter no mínimo 12 caracteres')
    .regex(/[a-z]/, 'Senha deve conter letras minúsculas')
    .regex(/[A-Z]/, 'Senha deve conter letras maiúsculas')
    .regex(/[0-9]/, 'Senha deve conter números')
    .regex(/[^a-zA-Z0-9]/, 'Senha deve conter caracteres especiais'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z
    .string()
    .min(12, 'Senha deve ter no mínimo 12 caracteres')
    .regex(/[a-z]/, 'Senha deve conter letras minúsculas')
    .regex(/[A-Z]/, 'Senha deve conter letras maiúsculas')
    .regex(/[0-9]/, 'Senha deve conter números')
    .regex(/[^a-zA-Z0-9]/, 'Senha deve conter caracteres especiais'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
