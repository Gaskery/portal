/**
 * Gráfico de Vendas - Recharts
 */

'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Sale {
  saleDate: Date;
  totalValue: any;
}

interface SalesChartProps {
  data: Sale[];
}

export function SalesChart({ data }: SalesChartProps) {
  // Agrupar vendas por mês
  const chartData = data.reduce((acc: any[], sale) => {
    const date = new Date(sale.saleDate);
    const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;

    const existing = acc.find((item) => item.month === monthYear);

    if (existing) {
      existing.value += Number(sale.totalValue);
    } else {
      acc.push({
        month: monthYear,
        value: Number(sale.totalValue),
      });
    }

    return acc;
  }, []);

  // Ordenar por data
  chartData.sort((a, b) => {
    const [monthA, yearA] = a.month.split('/').map(Number);
    const [monthB, yearB] = b.month.split('/').map(Number);

    if (yearA !== yearB) return yearA - yearB;
    return monthA - monthB;
  });

  // Pegar últimos 6 meses
  const last6Months = chartData.slice(-6);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={last6Months}>
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(240 5.9% 10%)" stopOpacity={0.2} />
            <stop offset="95%" stopColor="hsl(240 5.9% 10%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 5.9% 90%)" />
        <XAxis
          dataKey="month"
          stroke="hsl(240 3.8% 46.1%)"
          fontSize={12}
          tickLine={false}
        />
        <YAxis
          stroke="hsl(240 3.8% 46.1%)"
          fontSize={12}
          tickLine={false}
          tickFormatter={(value) =>
            new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
              minimumFractionDigits: 0,
            }).format(value)
          }
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-3 shadow-md">
                  <div className="text-sm font-medium mb-1">
                    {payload[0].payload.month}
                  </div>
                  <div className="text-lg font-bold">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(payload[0].value as number)}
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="hsl(240 5.9% 10%)"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorValue)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
