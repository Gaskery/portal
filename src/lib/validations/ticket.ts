/**
 * Schemas de Validação - Tickets (Chamados)
 */

import { z } from 'zod';
import { TicketStatus, TicketPriority, TicketCategory } from '@prisma/client';

export const createTicketSchema = z.object({
  title: z.string().min(5, 'Título deve ter no mínimo 5 caracteres').max(200),
  description: z.string().min(10, 'Descrição deve ter no mínimo 10 caracteres'),
  priority: z.nativeEnum(TicketPriority).default(TicketPriority.MEDIUM),
  category: z.nativeEnum(TicketCategory),
  contractId: z.string().optional(),
  organizationId: z.string(),
});

export const updateTicketSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  description: z.string().min(10).optional(),
  status: z.nativeEnum(TicketStatus).optional(),
  priority: z.nativeEnum(TicketPriority).optional(),
  category: z.nativeEnum(TicketCategory).optional(),
  assignedToId: z.string().nullable().optional(),
});

export const assignTicketSchema = z.object({
  ticketId: z.string(),
  userId: z.string(),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
export type AssignTicketInput = z.infer<typeof assignTicketSchema>;
