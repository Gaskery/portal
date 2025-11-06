/**
 * Dashboard do Cliente
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Ticket, FileText, TrendingUp, Clock } from 'lucide-react';

export default async function ClienteDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user.organizationId) {
    return <div>Sem acesso</div>;
  }

  // Buscar dados
  const [tickets, contracts, organization] = await Promise.all([
    prisma.ticket.count({
      where: {
        organizationId: session.user.organizationId,
        status: { not: 'CLOSED' },
      },
    }),
    prisma.contract.count({
      where: {
        organizationId: session.user.organizationId,
        status: 'ACTIVE',
      },
    }),
    prisma.organization.findUnique({
      where: { id: session.user.organizationId },
      include: {
        contracts: {
          where: { status: 'ACTIVE' },
          take: 1,
        },
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo de volta, {session.user.name}
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chamados Abertos</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets}</div>
            <p className="text-xs text-muted-foreground">
              tickets aguardando atendimento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contratos Ativos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contracts}</div>
            <p className="text-xs text-muted-foreground">
              contratos vigentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant="success">Ativo</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              sua organização está ativa
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.5h</div>
            <p className="text-xs text-muted-foreground">
              tempo de resposta
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Informações da Organização */}
      <Card>
        <CardHeader>
          <CardTitle>Minha Organização</CardTitle>
          <CardDescription>{organization?.name}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">CNPJ:</span>
            <span className="text-sm font-medium">{organization?.cnpj}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Email:</span>
            <span className="text-sm font-medium">{organization?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Telefone:</span>
            <span className="text-sm font-medium">{organization?.phone}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
