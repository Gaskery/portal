/**
 * Rate Limiting
 * Proteção contra força bruta e abuso de API
 */

import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  interval: number; // em milissegundos
  uniqueTokenPerInterval: number; // número de tokens únicos por intervalo
}

// Store em memória (usar Redis em produção)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

/**
 * Implementação simples de rate limiting
 * RECOMENDAÇÃO: Usar Redis (Upstash) em produção
 */
export async function rateLimit(
  identifier: string,
  config: RateLimitConfig = {
    interval: 60 * 1000, // 1 minuto
    uniqueTokenPerInterval: 10, // 10 requisições por minuto
  }
): Promise<{ success: boolean; remaining: number }> {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    // Novo período ou expirado
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + config.interval,
    });

    return {
      success: true,
      remaining: config.uniqueTokenPerInterval - 1,
    };
  }

  if (record.count >= config.uniqueTokenPerInterval) {
    // Limite excedido
    return {
      success: false,
      remaining: 0,
    };
  }

  // Incrementar contador
  record.count++;
  rateLimitMap.set(identifier, record);

  return {
    success: true,
    remaining: config.uniqueTokenPerInterval - record.count,
  };
}

/**
 * Middleware para rate limiting em rotas de API
 */
export async function withRateLimit(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>,
  config?: RateLimitConfig
): Promise<NextResponse> {
  const identifier = req.ip || req.headers.get('x-forwarded-for') || 'anonymous';

  const result = await rateLimit(identifier, config);

  if (!result.success) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        message: 'Muitas requisições. Tente novamente mais tarde.',
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': config?.uniqueTokenPerInterval.toString() || '10',
          'X-RateLimit-Remaining': '0',
          'Retry-After': '60',
        },
      }
    );
  }

  const response = await handler(req);

  // Adicionar headers de rate limit
  response.headers.set('X-RateLimit-Limit', config?.uniqueTokenPerInterval.toString() || '10');
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString());

  return response;
}

/**
 * Rate limit específico para login
 * Mais restritivo para prevenir brute force
 */
export async function loginRateLimit(identifier: string): Promise<boolean> {
  const result = await rateLimit(identifier, {
    interval: 15 * 60 * 1000, // 15 minutos
    uniqueTokenPerInterval: 5, // 5 tentativas
  });

  return result.success;
}

/**
 * Limpar cache de rate limiting (executar periodicamente)
 */
export function clearExpiredRateLimits(): void {
  const now = Date.now();

  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}

// Executar limpeza a cada 5 minutos
if (typeof window === 'undefined') {
  setInterval(clearExpiredRateLimits, 5 * 60 * 1000);
}
