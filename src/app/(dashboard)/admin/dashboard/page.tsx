/**
 * Dashboard Administrativo - Visão Geral Completa
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Building2,
  Users,
  FileText,
  DollarSign,
  Ticket,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';

async function getAdminDashboardData() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalOrganizations,
    totalUsers,
    activeContracts,
    openTickets,
    pendingSales,
    pendingLicenseRequests,
    revenueThisMonth,
    organizations,
  ] = await Promise.all([
    prisma.organization.count({ where: { active: true } }),
    prisma.user.count({ where: { status: 'ACTIVE' } }),
    prisma.contract.count({ where: { status: 'ACTIVE' } }),
    prisma.ticket.count({
      where: { status: { notIn: ['CLOSED', 'RESOLVED'] } },
    }),
    prisma.sale.findMany({
      where: { status: 'PENDING_APPROVAL' },
      include: {
        organization: { select: { name: true } },
        vendedor: { select: { name: true } },
      },
      orderBy: { saleDate: 'desc' },
    }),
    prisma.licenseRequest.findMany({
      where: { status: 'PENDING' },
      include: {
        organization: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.sale.aggregate({
      where: {
        status: 'INVOICED',
        invoicedAt: { gte: startOfMonth },
      },
      _sum: { totalValue: true },
    }),
    prisma.organization.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        salesRep: { select: { name: true } },
        _count: {
          select: { contracts: true, tickets: true },
        },
      },
    }),
  ]);

  return {
    stats: {
      organizations: totalOrganizations,
      users: totalUsers,
      contracts: activeContracts,
      tickets: openTickets,
      revenue: Number(revenueThisMonth._sum.totalValue || 0),
    },
    pendingSales,
    pendingLicenseRequests,
    organizations,
  };
}

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return null;
  }

  const data = await getAdminDashboardData();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Painel Administrativo</h1>
        <p className="text-muted-foreground mt-1">
          Visão geral completa do negócio e operações
        </p>
      </div>

      {/* Stats Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Receita do Mês"
          value={formatCurrency(data.stats.revenue)}
          icon={DollarSign}
          description="total faturado"
          trend={{ value: 18.5, isPositive: true }}
        />

        <StatCard
          title="Organizações"
          value={data.stats.organizations}
          icon={Building2}
          description="clientes ativos"
        />

        <StatCard
          title="Usuários"
          value={data.stats.users}
          icon={Users}
          description="usuários ativos"
        />

        <StatCard
          title="Contratos"
          value={data.stats.contracts}
          icon={FileText}
          description="contratos vigentes"
        />

        <StatCard
          title="Chamados"
          value={data.stats.tickets}
          icon={Ticket}
          description="tickets em aberto"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Vendas Pendentes de Aprovação */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Vendas Pendentes</CardTitle>
                <CardDescription>Aguardando aprovação administrativa</CardDescription>
              </div>
              <Badge variant="destructive" className="font-mono">
                {data.pendingSales.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.pendingSales.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium">Nenhuma venda pendente</p>
                  <p className="text-xs">Todas as vendas foram processadas</p>
                </div>
              ) : (
                data.pendingSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-muted-foreground">
                          {sale.saleNumber}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          Pendente
                        </Badge>
                      </div>
                      <p className="font-semibold text-sm">{sale.organization.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Vendedor: {sale.vendedor.name} • {formatDate(sale.saleDate)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right mr-3">
                        <p className="font-bold">{formatCurrency(Number(sale.totalValue))}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="h-8">
                          Rejeitar
                        </Button>
                        <Button size="sm" className="h-8">
                          Aprovar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Solicitações de Licenças */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Licenças Extras</CardTitle>
                <CardDescription>Solicitações de licenciamento adicional</CardDescription>
              </div>
              <Badge variant="outline" className="font-mono">
                {data.pendingLicenseRequests.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.pendingLicenseRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium">Nenhuma solicitação</p>
                  <p className="text-xs">Todas foram processadas</p>
                </div>
              ) : (
                data.pendingLicenseRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-muted-foreground">
                          {request.requestNumber}
                        </span>
                      </div>
                      <p className="font-semibold text-sm">{request.organization.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {request.quantity}x {request.productSku}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="h-8">
                        Rejeitar
                      </Button>
                      <Button size="sm" className="h-8">
                        Aprovar
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Organizações Recentes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Organizações Recentes</CardTitle>
              <CardDescription>Últimos clientes cadastrados</CardDescription>
            </div>
            <Link href="/organizations">
              <Button variant="outline" size="sm">
                Ver Todas
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.organizations.map((org) => (
              <div
                key={org.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-muted p-3">
                    <Building2 className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold">{org.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {org.salesRep ? `Vendedor: ${org.salesRep.name}` : 'Sem vendedor'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {org._count.contracts} {org._count.contracts === 1 ? 'contrato' : 'contratos'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {org._count.tickets} {org._count.tickets === 1 ? 'ticket' : 'tickets'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alertas */}
      <Card className="border-yellow-200 bg-yellow-50/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <CardTitle>Atenção Necessária</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.pendingSales.length > 0 && (
              <p className="text-sm">
                • <strong>{data.pendingSales.length}</strong> venda(s) aguardando aprovação
              </p>
            )}
            {data.pendingLicenseRequests.length > 0 && (
              <p className="text-sm">
                • <strong>{data.pendingLicenseRequests.length}</strong> solicitação(ões) de licença pendente(s)
              </p>
            )}
            {data.stats.tickets > 10 && (
              <p className="text-sm">
                • <strong>{data.stats.tickets}</strong> chamados em aberto (acima do normal)
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
