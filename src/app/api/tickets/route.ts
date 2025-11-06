/**
 * API Routes - Tickets (Chamados)
 * GET /api/tickets - Listar tickets
 * POST /api/tickets - Criar ticket
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createTicketSchema } from '@/lib/validations/ticket';
import { UserRole } from '@prisma/client';
import { nanoid } from 'nanoid';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get('organizationId');
    const status = searchParams.get('status');

    // Construir filtros baseado no role
    let where: any = {};

    if (session.user.role === UserRole.CLIENTE_USER) {
      // Cliente User só vê seus próprios tickets
      where.createdById = session.user.id;
    } else if (session.user.role === UserRole.CLIENTE_RESPONSAVEL) {
      // Cliente Responsável vê todos os tickets da organização
      where.organizationId = session.user.organizationId;
    } else if (session.user.role === UserRole.TECNICO) {
      // Técnico vê tickets atribuídos a ele ou não atribuídos
      where.OR = [
        { assignedToId: session.user.id },
        { assignedToId: null },
      ];
    }
    // Admin e Vendedor veem todos

    if (organizationId) {
      where.organizationId = organizationId;
    }

    if (status) {
      where.status = status;
    }

    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        contract: {
          select: {
            id: true,
            contractNumber: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Erro ao buscar tickets:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar tickets' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const validation = createTicketSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.errors },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Verificar se usuário pode criar ticket para esta organização
    if (session.user.role === UserRole.CLIENTE_USER || session.user.role === UserRole.CLIENTE_RESPONSAVEL) {
      if (data.organizationId !== session.user.organizationId) {
        return NextResponse.json(
          { error: 'Você não pode criar tickets para esta organização' },
          { status: 403 }
        );
      }
    }

    // Criar ticket
    const ticket = await prisma.ticket.create({
      data: {
        ...data,
        ticketNumber: `TKT-${nanoid(10).toUpperCase()}`,
        createdById: session.user.id,
      },
      include: {
        organization: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE',
        resource: 'Ticket',
        resourceId: ticket.id,
        ipAddress: req.ip || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
      },
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar ticket:', error);
    return NextResponse.json(
      { error: 'Erro ao criar ticket' },
      { status: 500 }
    );
  }
}
