/**
 * API Routes - Ticket Individual
 * GET /api/tickets/[id] - Detalhes
 * PUT /api/tickets/[id] - Atualizar
 * DELETE /api/tickets/[id] - Deletar
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updateTicketSchema } from '@/lib/validations/ticket';
import { UserRole } from '@prisma/client';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: params.id },
      include: {
        organization: true,
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
        contract: {
          select: { id: true, contractNumber: true },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket não encontrado' }, { status: 404 });
    }

    // Verificar permissões
    if (
      session.user.role === UserRole.CLIENTE_USER &&
      ticket.createdById !== session.user.id
    ) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    if (
      (session.user.role === UserRole.CLIENTE_RESPONSAVEL ||
        session.user.role === UserRole.CLIENTE_USER) &&
      ticket.organizationId !== session.user.organizationId
    ) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Erro ao buscar ticket:', error);
    return NextResponse.json({ error: 'Erro ao buscar ticket' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const validation = updateTicketSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.errors },
        { status: 400 }
      );
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: params.id },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket não encontrado' }, { status: 404 });
    }

    // Apenas técnicos e admins podem atualizar tickets
    if (![UserRole.ADMIN, UserRole.TECNICO].includes(session.user.role)) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id: params.id },
      data: validation.data,
      include: {
        organization: true,
        createdBy: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE',
        resource: 'Ticket',
        resourceId: updatedTicket.id,
        ipAddress: req.ip || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
        metadata: validation.data,
      },
    });

    return NextResponse.json(updatedTicket);
  } catch (error) {
    console.error('Erro ao atualizar ticket:', error);
    return NextResponse.json({ error: 'Erro ao atualizar ticket' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Apenas admins podem deletar tickets
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    await prisma.ticket.delete({
      where: { id: params.id },
    });

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'DELETE',
        resource: 'Ticket',
        resourceId: params.id,
        ipAddress: req.ip || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar ticket:', error);
    return NextResponse.json({ error: 'Erro ao deletar ticket' }, { status: 500 });
  }
}
