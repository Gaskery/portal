/**
 * Dashboard Principal - Redireciona baseado no role
 */

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserRole } from '@prisma/client';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  // Redirecionar baseado no role
  switch (session.user.role) {
    case UserRole.ADMIN:
      redirect('/admin/dashboard');
    case UserRole.VENDEDOR:
      redirect('/vendedor/dashboard');
    case UserRole.TECNICO:
      redirect('/tecnico/dashboard');
    case UserRole.CLIENTE_RESPONSAVEL:
    case UserRole.CLIENTE_USER:
      redirect('/cliente/dashboard');
    default:
      redirect('/auth/login');
  }
}
