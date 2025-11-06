/**
 * Lista de Tickets - Design Moderno
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Clock, AlertCircle, CheckCircle2, Filter } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

async function getTickets(userId: string, userRole: UserRole, organizationId?: string) {
  let where: any = {};

  if (userRole === UserRole.CLIENTE_USER) {
    where.createdById = userId;
  } else if (userRole === UserRole.CLIENTE_RESPONSAVEL && organizationId) {
    where.organizationId = organizationId;
  } else if (userRole === UserRole.TECNICO) {
    where.OR = [{ assignedToId: userId }, { assignedToId: null }];
  }

  return prisma.ticket.findMany({
    where,
    include: {
      organization: { select: { name: true } },
      createdBy: { select: { name: true } },
      assignedTo: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}

const statusConfig = {
  OPEN: { label: 'Aberto', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  IN_PROGRESS: { label: 'Em Andamento', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  WAITING_CLIENT: { label: 'Aguardando Cliente', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  RESOLVED: { label: 'Resolvido', color: 'bg-green-100 text-green-700 border-green-200' },
  CLOSED: { label: 'Fechado', color: 'bg-gray-100 text-gray-700 border-gray-200' },
};

const priorityConfig = {
  LOW: { label: 'Baixa', color: 'bg-gray-100 text-gray-600' },
  MEDIUM: { label: 'Média', color: 'bg-blue-100 text-blue-600' },
  HIGH: { label: 'Alta', color: 'bg-orange-100 text-orange-600' },
  URGENT: { label: 'Urgente', color: 'bg-red-100 text-red-600' },
};

export default async function TicketsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return null;
  }

  const tickets = await getTickets(
    session.user.id,
    session.user.role,
    session.user.organizationId
  );

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'OPEN').length,
    inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    resolved: tickets.filter(t => t.status === 'RESOLVED').length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chamados</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie e acompanhe todos os chamados de suporte
          </p>
        </div>
        <Link href="/tickets/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Chamado
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Abertos
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.open}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Em Andamento
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Resolvidos
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Tickets */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Todos os Chamados</CardTitle>
              <CardDescription>Lista de chamados recentes</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtrar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tickets.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Nenhum chamado encontrado</p>
                <p className="text-sm">Crie seu primeiro chamado para começar</p>
              </div>
            ) : (
              tickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/tickets/${ticket.id}`}
                  className="block"
                >
                  <div className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer group">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs text-muted-foreground">
                              {ticket.ticketNumber}
                            </span>
                            <Badge className={priorityConfig[ticket.priority].color} variant="outline">
                              {priorityConfig[ticket.priority].label}
                            </Badge>
                          </div>
                          <h3 className="font-semibold group-hover:text-primary transition-colors">
                            {ticket.title}
                          </h3>
                        </div>
                        <Badge className={statusConfig[ticket.status].color} variant="outline">
                          {statusConfig[ticket.status].label}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {ticket.description}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{ticket.organization.name}</span>
                        <span>•</span>
                        <span>Criado por {ticket.createdBy.name}</span>
                        {ticket.assignedTo && (
                          <>
                            <span>•</span>
                            <span>Atribuído a {ticket.assignedTo.name}</span>
                          </>
                        )}
                        <span>•</span>
                        <span>{formatDateTime(ticket.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
