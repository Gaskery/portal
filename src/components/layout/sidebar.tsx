/**
 * Sidebar Component - Navegação Lateral
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Ticket,
  FileText,
  Users,
  Settings,
  LogOut,
  Building2,
  TrendingUp,
  CheckSquare,
  FolderKanban,
} from 'lucide-react';
import { UserRole } from '@prisma/client';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: [UserRole.ADMIN, UserRole.VENDEDOR, UserRole.TECNICO, UserRole.CLIENTE_RESPONSAVEL, UserRole.CLIENTE_USER],
  },
  {
    title: 'Chamados',
    href: '/tickets',
    icon: Ticket,
    roles: [UserRole.ADMIN, UserRole.TECNICO, UserRole.CLIENTE_RESPONSAVEL, UserRole.CLIENTE_USER],
  },
  {
    title: 'Projetos',
    href: '/projects',
    icon: FolderKanban,
    roles: [UserRole.ADMIN, UserRole.TECNICO, UserRole.CLIENTE_RESPONSAVEL],
  },
  {
    title: 'Contratos',
    href: '/contracts',
    icon: FileText,
    roles: [UserRole.ADMIN, UserRole.CLIENTE_RESPONSAVEL],
  },
  {
    title: 'Organizações',
    href: '/organizations',
    icon: Building2,
    roles: [UserRole.ADMIN, UserRole.VENDEDOR, UserRole.TECNICO],
  },
  {
    title: 'Vendas',
    href: '/sales',
    icon: TrendingUp,
    roles: [UserRole.ADMIN, UserRole.VENDEDOR],
  },
  {
    title: 'Propostas',
    href: '/proposals',
    icon: CheckSquare,
    roles: [UserRole.ADMIN, UserRole.VENDEDOR],
  },
  {
    title: 'Usuários',
    href: '/users',
    icon: Users,
    roles: [UserRole.ADMIN, UserRole.CLIENTE_RESPONSAVEL],
  },
  {
    title: 'Configurações',
    href: '/settings',
    icon: Settings,
    roles: [UserRole.ADMIN, UserRole.VENDEDOR, UserRole.TECNICO, UserRole.CLIENTE_RESPONSAVEL, UserRole.CLIENTE_USER],
  },
];

interface SidebarProps {
  userRole: UserRole;
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();

  const filteredItems = navItems.filter(item => item.roles.includes(userRole));

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
            M365
          </div>
          <span className="text-lg font-semibold">Portal M365</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <button
          onClick={() => {/* Handle logout */}}
          className="flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <LogOut className="h-5 w-5" />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
}
