/**
 * Schemas de Validação - Vendas
 */

import { z } from 'zod';
import { ProposalStatus, SaleStatus } from '@prisma/client';

export const createProposalSchema = z.object({
  organizationId: z.string(),
  title: z.string().min(5, 'Título deve ter no mínimo 5 caracteres'),
  description: z.string().optional(),
  totalValue: z.number().positive('Valor deve ser positivo'),
  validUntil: z.string().or(z.date()),
});

export const updateProposalSchema = z.object({
  title: z.string().min(5).optional(),
  description: z.string().optional(),
  status: z.nativeEnum(ProposalStatus).optional(),
  totalValue: z.number().positive().optional(),
  validUntil: z.string().or(z.date()).optional(),
});

export const createSaleSchema = z.object({
  organizationId: z.string(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().positive(),
  })).min(1, 'Deve ter pelo menos 1 item'),
  totalValue: z.number().positive(),
});

export const updateSaleStatusSchema = z.object({
  status: z.nativeEnum(SaleStatus),
});

export type CreateProposalInput = z.infer<typeof createProposalSchema>;
export type UpdateProposalInput = z.infer<typeof updateProposalSchema>;
export type CreateSaleInput = z.infer<typeof createSaleSchema>;
export type UpdateSaleStatusInput = z.infer<typeof updateSaleStatusSchema>;
