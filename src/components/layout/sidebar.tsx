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
    <div className="flex h-full w-64 flex-col border-r bg-card/50 backdrop-blur-sm">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b">
        <Link href="/" className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <div>
            <p className="text-sm font-semibold leading-none">Portal M365</p>
            <p className="text-xs text-muted-foreground">Gestão de Licenças</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <Icon className={cn('h-4 w-4', isActive && 'text-white')} />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-3 bg-gray-50/50">
        <button
          onClick={() => {/* Handle logout */}}
          className="flex w-full items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-all hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
}
