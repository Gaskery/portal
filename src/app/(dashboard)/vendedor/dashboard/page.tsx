/**
 * Dashboard do Vendedor - Com Gráficos e Métricas
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, DollarSign, Target, Users, CheckCircle2, Clock } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { SalesChart } from '@/components/charts/sales-chart';
import { ProposalsList } from '@/components/vendedor/proposals-list';

async function getDashboardData(vendedorId: string) {
  const [sales, proposals, organizations] = await Promise.all([
    prisma.sale.findMany({
      where: { vendedorId },
      include: {
        organization: { select: { name: true } },
      },
      orderBy: { saleDate: 'desc' },
      take: 10,
    }),
    prisma.proposal.findMany({
      where: { vendedorId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.organization.findMany({
      where: { salesRepId: vendedorId },
      select: { id: true, name: true },
    }),
  ]);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const salesThisMonth = sales.filter((s) => {
    const date = new Date(s.saleDate);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const totalRevenueThisMonth = salesThisMonth.reduce(
    (sum, sale) => sum + Number(sale.totalValue),
    0
  );

  const invoicedSales = sales.filter((s) => s.status === 'INVOICED');
  const totalInvoiced = invoicedSales.reduce(
    (sum, sale) => sum + Number(sale.totalValue),
    0
  );

  return {
    sales,
    proposals,
    organizations,
    stats: {
      totalRevenue: totalRevenueThisMonth,
      invoicedRevenue: totalInvoiced,
      totalProposals: proposals.length,
      pendingProposals: proposals.filter((p) => p.status === 'SENT').length,
      totalClients: organizations.length,
    },
  };
}

export default async function VendedorDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return null;
  }

  const data = await getDashboardData(session.user.id);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard de Vendas</h1>
        <p className="text-muted-foreground mt-1">
          Bem-vindo de volta, {session.user.name}! Aqui está seu desempenho.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Receita do Mês"
          value={formatCurrency(data.stats.totalRevenue)}
          icon={DollarSign}
          description="vendas realizadas este mês"
          trend={{ value: 12.5, isPositive: true }}
        />

        <StatCard
          title="Faturado"
          value={formatCurrency(data.stats.invoicedRevenue)}
          icon={CheckCircle2}
          description="total faturado"
          trend={{ value: 8.2, isPositive: true }}
        />

        <StatCard
          title="Propostas"
          value={data.stats.totalProposals}
          icon={Target}
          description={`${data.stats.pendingProposals} aguardando resposta`}
        />

        <StatCard
          title="Clientes Ativos"
          value={data.stats.totalClients}
          icon={Users}
          description="organizações gerenciadas"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Gráfico de Vendas */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Vendas nos Últimos 6 Meses</CardTitle>
            <CardDescription>
              Acompanhe o crescimento das suas vendas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SalesChart data={data.sales} />
          </CardContent>
        </Card>

        {/* Vendas Recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Vendas Recentes</CardTitle>
            <CardDescription>Últimas 10 vendas realizadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.sales.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma venda registrada ainda
                </p>
              ) : (
                data.sales.slice(0, 5).map((sale) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">
                          {sale.saleNumber}
                        </span>
                        {sale.status === 'INVOICED' ? (
                          <Badge variant="success" className="text-xs">
                            Faturado
                          </Badge>
                        ) : sale.status === 'APPROVED' ? (
                          <Badge className="bg-green-100 text-green-700 text-xs">
                            Aprovado
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Pendente
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium mt-1">
                        {sale.organization.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(sale.saleDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatCurrency(Number(sale.totalValue))}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Propostas Pendentes */}
        <Card>
          <CardHeader>
            <CardTitle>Propostas Pendentes</CardTitle>
            <CardDescription>Aguardando resposta do cliente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.proposals.filter((p) => p.status === 'SENT').length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma proposta pendente
                </p>
              ) : (
                data.proposals
                  .filter((p) => p.status === 'SENT')
                  .map((proposal) => (
                    <div
                      key={proposal.id}
                      className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-muted-foreground">
                            {proposal.proposalNumber}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            Enviada
                          </Badge>
                        </div>
                        <p className="text-sm font-medium mt-1">{proposal.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Válida até {formatDate(proposal.validUntil)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">
                          {formatCurrency(Number(proposal.totalValue))}
                        </p>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metas */}
      <Card>
        <CardHeader>
          <CardTitle>Metas do Mês</CardTitle>
          <CardDescription>Progresso das suas metas mensais</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Receita</span>
                <span className="text-sm text-muted-foreground">
                  {formatCurrency(data.stats.totalRevenue)} / {formatCurrency(50000)}
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{
                    width: `${Math.min((data.stats.totalRevenue / 50000) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Novos Clientes</span>
                <span className="text-sm text-muted-foreground">
                  {data.stats.totalClients} / 10
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-600 rounded-full transition-all"
                  style={{
                    width: `${Math.min((data.stats.totalClients / 10) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
