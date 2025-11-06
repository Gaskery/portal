/**
 * API Routes - Organizations
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createOrganizationSchema } from '@/lib/validations/organization';
import { UserRole } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');

    let where: any = {};

    // Clientes só veem sua própria organização
    if (session.user.role === UserRole.CLIENTE_RESPONSAVEL || session.user.role === UserRole.CLIENTE_USER) {
      where.id = session.user.organizationId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { cnpj: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const organizations = await prisma.organization.findMany({
      where,
      include: {
        salesRep: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            users: true,
            contracts: true,
            tickets: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(organizations);
  } catch (error) {
    console.error('Erro ao buscar organizações:', error);
    return NextResponse.json({ error: 'Erro ao buscar organizações' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Apenas admin e vendedores podem criar organizações
    if (![UserRole.ADMIN, UserRole.VENDEDOR].includes(session.user.role)) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    const body = await req.json();
    const validation = createOrganizationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.errors },
        { status: 400 }
      );
    }

    // Verificar se CNPJ já existe
    const existingOrg = await prisma.organization.findUnique({
      where: { cnpj: validation.data.cnpj },
    });

    if (existingOrg) {
      return NextResponse.json(
        { error: 'CNPJ já cadastrado' },
        { status: 400 }
      );
    }

    const organization = await prisma.organization.create({
      data: validation.data,
      include: {
        salesRep: {
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
        resource: 'Organization',
        resourceId: organization.id,
        ipAddress: req.ip || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
      },
    });

    return NextResponse.json(organization, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar organização:', error);
    return NextResponse.json({ error: 'Erro ao criar organização' }, { status: 500 });
  }
}
