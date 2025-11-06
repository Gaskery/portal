/**
 * Configuração do NextAuth.js
 * Sistema de autenticação com RBAC e segurança
 */

import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import { compare } from 'bcrypt';
import { UserRole, UserStatus } from '@prisma/client';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  session: {
    strategy: 'jwt',
    maxAge: 30 * 60, // 30 minutos de inatividade
  },

  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },

  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email e senha são obrigatórios');
        }

        // Buscar usuário
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { organization: true },
        });

        if (!user) {
          throw new Error('Credenciais inválidas');
        }

        // Verificar status
        if (user.status === UserStatus.SUSPENDED) {
          throw new Error('Usuário suspenso. Entre em contato com o administrador.');
        }

        if (user.status === UserStatus.INACTIVE) {
          throw new Error('Usuário inativo. Entre em contato com o administrador.');
        }

        // Verificar senha
        const isPasswordValid = await compare(credentials.password, user.password);

        if (!isPasswordValid) {
          // Log de tentativa falha (implementar auditoria)
          throw new Error('Credenciais inválidas');
        }

        // Atualizar último login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        // Log de login bem-sucedido
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: 'LOGIN',
            resource: 'User',
            resourceId: user.id,
            ipAddress: 'N/A', // Será preenchido pelo middleware
            userAgent: 'N/A',
          },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
          organizationId: user.organizationId || undefined,
          image: user.image || undefined,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.status = user.status;
        token.organizationId = user.organizationId;
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.status = token.status;
        session.user.organizationId = token.organizationId;
      }
      return session;
    },
  },

  events: {
    async signOut({ token }) {
      // Log de logout
      if (token?.id) {
        await prisma.auditLog.create({
          data: {
            userId: token.id as string,
            action: 'LOGOUT',
            resource: 'User',
            resourceId: token.id as string,
            ipAddress: 'N/A',
            userAgent: 'N/A',
          },
        });
      }
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

/**
 * Verificar se usuário tem permissão para acessar recurso
 */
export function hasPermission(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole);
}

/**
 * Verificar se usuário pode acessar dados de uma organização
 */
export function canAccessOrganization(
  userRole: UserRole,
  userOrgId: string | undefined,
  targetOrgId: string
): boolean {
  // Admin pode acessar qualquer organização
  if (userRole === UserRole.ADMIN) return true;

  // Vendedores e técnicos podem acessar organizações associadas (implementar lógica adicional)
  if (userRole === UserRole.VENDEDOR || userRole === UserRole.TECNICO) {
    // TODO: Verificar se o vendedor/técnico está associado à organização
    return true;
  }

  // Clientes só podem acessar sua própria organização
  if (userRole === UserRole.CLIENTE_RESPONSAVEL || userRole === UserRole.CLIENTE_USER) {
    return userOrgId === targetOrgId;
  }

  return false;
}
