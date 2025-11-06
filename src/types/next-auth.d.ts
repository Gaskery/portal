/**
 * Extensão de tipos do NextAuth
 * Define tipos customizados para sessão e usuário
 */

import { UserRole, UserStatus } from '@prisma/client';
import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
      status: UserStatus;
      organizationId?: string;
      image?: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    status: UserStatus;
    organizationId?: string;
    image?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
    status: UserStatus;
    organizationId?: string;
  }
}
