/**
 * Middleware Global do Next.js
 * Proteções de segurança e controle de acesso
 */

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { UserRole } from '@prisma/client';

// Rotas públicas (não requerem autenticação)
const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/error',
  '/api/auth',
];

// Mapeamento de rotas por role
const ROLE_ROUTES: Record<string, UserRole[]> = {
  '/admin': [UserRole.ADMIN],
  '/vendedor': [UserRole.ADMIN, UserRole.VENDEDOR],
  '/tecnico': [UserRole.ADMIN, UserRole.TECNICO],
  '/cliente': [UserRole.ADMIN, UserRole.CLIENTE_RESPONSAVEL, UserRole.CLIENTE_USER],
  '/api/admin': [UserRole.ADMIN],
  '/api/vendedor': [UserRole.ADMIN, UserRole.VENDEDOR],
  '/api/tecnico': [UserRole.ADMIN, UserRole.TECNICO],
  '/api/cliente': [UserRole.ADMIN, UserRole.CLIENTE_RESPONSAVEL, UserRole.CLIENTE_USER],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. CSRF Protection (verificar em rotas de mutação)
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');

    // Verificar se origem é válida
    if (origin && !origin.includes(host || '')) {
      return NextResponse.json(
        { error: 'CSRF validation failed' },
        { status: 403 }
      );
    }
  }

  // 2. Permitir rotas públicas
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // 3. Verificar autenticação
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    // Redirecionar para login
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // 4. Verificar autorização (RBAC)
  for (const [route, allowedRoles] of Object.entries(ROLE_ROUTES)) {
    if (pathname.startsWith(route)) {
      if (!allowedRoles.includes(token.role as UserRole)) {
        // Acesso negado
        return NextResponse.json(
          {
            error: 'Forbidden',
            message: 'Você não tem permissão para acessar este recurso',
          },
          { status: 403 }
        );
      }
    }
  }

  // 5. Adicionar headers de segurança adicionais
  const response = NextResponse.next();

  // Prevenir MIME sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Prevenir XSS
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Prevenir Clickjacking
  response.headers.set('X-Frame-Options', 'DENY');

  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Adicionar informações de sessão nos headers (para auditoria)
  response.headers.set('X-User-Id', token.id as string);
  response.headers.set('X-User-Role', token.role as string);

  return response;
}

// Configurar quais rotas o middleware deve processar
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
