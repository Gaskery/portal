/**
 * Schemas de Validação - Organizações
 */

import { z } from 'zod';
import { OrganizationType } from '@prisma/client';

export const createOrganizationSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  cnpj: z.string().regex(/^\d{14}$/, 'CNPJ inválido (apenas números, 14 dígitos)'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  type: z.nativeEnum(OrganizationType).default(OrganizationType.PEQUENA_EMPRESA),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().length(2, 'Estado deve ter 2 caracteres').optional(),
  zipCode: z.string().regex(/^\d{8}$/, 'CEP inválido (apenas números, 8 dígitos)').optional(),
  salesRepId: z.string().optional(),
});

export const updateOrganizationSchema = z.object({
  name: z.string().min(3).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(10).optional(),
  type: z.nativeEnum(OrganizationType).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().length(2).optional(),
  zipCode: z.string().regex(/^\d{8}$/).optional(),
  salesRepId: z.string().nullable().optional(),
  active: z.boolean().optional(),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
