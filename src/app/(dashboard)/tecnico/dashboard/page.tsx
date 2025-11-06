/**
 * Dashboard do Técnico - Com Fila de Atendimento
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Ticket as TicketIcon,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  User,
} from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import Link from 'next/link';

const priorityIcons = {
  LOW: Clock,
  MEDIUM: TicketIcon,
  HIGH: AlertTriangle,
  URGENT: AlertTriangle,
};

const priorityColors = {
  LOW: 'bg-gray-100 text-gray-600 border-gray-200',
  MEDIUM: 'bg-blue-100 text-blue-600 border-blue-200',
  HIGH: 'bg-orange-100 text-orange-600 border-orange-200',
  URGENT: 'bg-red-100 text-red-600 border-red-200',
};

async function getTechnicianData(userId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [myTickets, unassignedTickets, resolvedThisMonth, allTickets] = await Promise.all([
    prisma.ticket.findMany({
      where: {
        assignedToId: userId,
        status: { notIn: ['CLOSED', 'RESOLVED'] },
      },
      include: {
        organization: { select: { name: true } },
        createdBy: { select: { name: true } },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
    }),
    prisma.ticket.findMany({
      where: {
        assignedToId: null,
        status: 'OPEN',
      },
      include: {
        organization: { select: { name: true } },
        createdBy: { select: { name: true } },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
      take: 10,
    }),
    prisma.ticket.count({
      where: {
        assignedToId: userId,
        status: 'RESOLVED',
        resolvedAt: { gte: startOfMonth },
      },
    }),
    prisma.ticket.findMany({
      where: { assignedToId: userId },
      select: { id: true, createdAt: true, resolvedAt: true },
    }),
  ]);

  // Calcular tempo médio de resolução
  const resolvedTickets = allTickets.filter((t) => t.resolvedAt);
  const avgResolutionTime =
    resolvedTickets.length > 0
      ? resolvedTickets.reduce((sum, t) => {
          const diff =
            new Date(t.resolvedAt!).getTime() - new Date(t.createdAt).getTime();
          return sum + diff;
        }, 0) /
        resolvedTickets.length /
        (1000 * 60 * 60) // converter para horas
      : 0;

  return {
    myTickets,
    unassignedTickets,
    stats: {
      myOpen: myTickets.length,
      unassigned: unassignedTickets.length,
      resolvedThisMonth,
      avgResolutionTime: avgResolutionTime.toFixed(1),
    },
  };
}

export default async function TecnicoDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return null;
  }

  const data = await getTechnicianData(session.user.id);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Central de Atendimento</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie seus chamados e acompanhe o desempenho
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Meus Chamados"
          value={data.stats.myOpen}
          icon={User}
          description="atribuídos a você"
        />

        <StatCard
          title="Não Atribuídos"
          value={data.stats.unassigned}
          icon={TicketIcon}
          description="aguardando atribuição"
        />

        <StatCard
          title="Resolvidos no Mês"
          value={data.stats.resolvedThisMonth}
          icon={CheckCircle2}
          description="tickets finalizados"
          trend={{ value: 15, isPositive: true }}
        />

        <StatCard
          title="Tempo Médio"
          value={`${data.stats.avgResolutionTime}h`}
          icon={Clock}
          description="tempo de resolução"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Meus Chamados */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Meus Chamados</CardTitle>
                <CardDescription>Chamados atribuídos a você</CardDescription>
              </div>
              <Badge variant="outline" className="font-mono">
                {data.myTickets.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.myTickets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium">Nenhum chamado pendente</p>
                  <p className="text-xs">Você está em dia! 🎉</p>
                </div>
              ) : (
                data.myTickets.map((ticket) => {
                  const PriorityIcon = priorityIcons[ticket.priority];
                  return (
                    <Link
                      key={ticket.id}
                      href={`/tickets/${ticket.id}`}
                      className="block"
                    >
                      <div className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors group">
                        <div className="rounded-lg bg-muted p-2 group-hover:bg-accent transition-colors">
                          <PriorityIcon className="h-4 w-4 text-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs text-muted-foreground">
                              {ticket.ticketNumber}
                            </span>
                            <Badge
                              variant="outline"
                              className={priorityColors[ticket.priority]}
                            >
                              {ticket.priority}
                            </Badge>
                          </div>
                          <h4 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-1">
                            {ticket.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {ticket.organization.name} • {formatDateTime(ticket.createdAt)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Fila de Não Atribuídos */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Fila de Atendimento</CardTitle>
                <CardDescription>Chamados aguardando atribuição</CardDescription>
              </div>
              <Badge variant="destructive" className="font-mono">
                {data.stats.unassigned}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.unassignedTickets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium">Fila vazia</p>
                  <p className="text-xs">Todos os chamados foram atribuídos</p>
                </div>
              ) : (
                data.unassignedTickets.map((ticket) => {
                  const PriorityIcon = priorityIcons[ticket.priority];
                  return (
                    <div
                      key={ticket.id}
                      className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="rounded-lg bg-muted p-2">
                        <PriorityIcon className="h-4 w-4 text-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs text-muted-foreground">
                            {ticket.ticketNumber}
                          </span>
                          <Badge
                            variant="outline"
                            className={priorityColors[ticket.priority]}
                          >
                            {ticket.priority}
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-sm line-clamp-1">
                          {ticket.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {ticket.organization.name} • {formatDateTime(ticket.createdAt)}
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        Assumir
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Seu Desempenho</CardTitle>
          <CardDescription>Métricas do último mês</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-4 p-4 rounded-lg border bg-card">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.stats.resolvedThisMonth}</p>
                <p className="text-sm text-muted-foreground">Tickets Resolvidos</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-lg border bg-card">
              <div className="rounded-full bg-blue-100 p-3">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.stats.avgResolutionTime}h</p>
                <p className="text-sm text-muted-foreground">Tempo Médio</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-lg border bg-card">
              <div className="rounded-full bg-purple-100 p-3">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">95%</p>
                <p className="text-sm text-muted-foreground">Taxa de Resolução</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
