# 🔐 PROTOCOLOS DE SEGURANÇA - Portal Microsoft 365

> **DOCUMENTO CRÍTICO**: Este documento define todos os protocolos de segurança implementados no sistema.
> **CONFIDENCIALIDADE**: Não compartilhar detalhes de implementação publicamente.

---

## 📋 ÍNDICE

1. [Autenticação e Autorização](#1-autenticação-e-autorização)
2. [Proteção de Dados](#2-proteção-de-dados)
3. [Segurança de API](#3-segurança-de-api)
4. [Proteção contra Ataques](#4-proteção-contra-ataques)
5. [Auditoria e Logs](#5-auditoria-e-logs)
6. [Segurança de Infraestrutura](#6-segurança-de-infraestrutura)
7. [Compliance e LGPD](#7-compliance-e-lgpd)
8. [Backup e Recuperação](#8-backup-e-recuperação)
9. [Monitoramento e Alertas](#9-monitoramento-e-alertas)
10. [Políticas de Segurança](#10-políticas-de-segurança)

---

## 1. AUTENTICAÇÃO E AUTORIZAÇÃO

### 1.1 Sistema de Autenticação (NextAuth.js)

**✅ IMPLEMENTADO:**
- **Autenticação multi-fator (MFA/2FA)** obrigatória para:
  - Administradores
  - Vendedores
  - Técnicos
  - Cliente Responsável (opcional mas recomendado)

- **Senhas Fortes:**
  - Mínimo 12 caracteres
  - Letras maiúsculas, minúsculas, números e caracteres especiais
  - Verificação contra senhas comuns (pwned passwords API)
  - Hash usando **bcrypt** (salt rounds: 12)

- **Tokens:**
  - **JWT (JSON Web Tokens)** com expiração curta (15 minutos)
  - **Refresh Tokens** (7 dias, rotação automática)
  - Tokens armazenados em **httpOnly cookies** (não acessíveis via JavaScript)
  - **Secure flag** ativado (apenas HTTPS)
  - **SameSite=Strict** para proteção CSRF

### 1.2 Controle de Acesso Baseado em Funções (RBAC)

**Roles Implementadas:**

| Role | Nível de Acesso | Permissões |
|------|----------------|------------|
| **ADMIN** | Total | Gerenciar usuários, configurações, todos os dados |
| **VENDEDOR** | Vendas | Dashboard vendas, propostas, leads, atividades |
| **TECNICO** | Suporte | Chamados, projetos, dados de clientes (limitado) |
| **CLIENTE_RESPONSAVEL** | Organização | Todos os dados da própria organização, gerenciar users |
| **CLIENTE_USER** | Individual | Apenas próprios chamados |

**Matriz de Permissões:**
```typescript
// Cada ação possui verificação de role + organização
- READ (leitura)
- CREATE (criação)
- UPDATE (atualização)
- DELETE (exclusão)
- MANAGE_USERS (gerenciar usuários)
- VIEW_METRICS (ver métricas)
- APPROVE (aprovar vendas/licenças)
```

**Isolamento de Dados:**
- Clientes **NUNCA** veem dados de outras organizações
- Middleware verifica `organizationId` em TODAS as queries
- Técnicos e Vendedores veem apenas organizações associadas a eles

### 1.3 Sessões

- **Timeout de inatividade**: 30 minutos
- **Logout automático** após inatividade
- **Sessões concorrentes**: Máximo 3 dispositivos por usuário
- **Invalidação remota** de sessões (admin pode forçar logout)

---

## 2. PROTEÇÃO DE DADOS

### 2.1 Criptografia

**Em Trânsito:**
- **TLS 1.3** obrigatório (mínimo TLS 1.2)
- **HTTPS** em todas as comunicações
- **HSTS** (HTTP Strict Transport Security) habilitado
- Certificado SSL **válido e renovado automaticamente**

**Em Repouso:**
- Senhas: **bcrypt** com salt
- Dados sensíveis: **AES-256-GCM**
- Chaves de criptografia armazenadas em **variáveis de ambiente** (nunca no código)
- Banco de dados: **Encryption at Rest** habilitado

**Dados Criptografados:**
- ✅ Senhas
- ✅ Tokens de API
- ✅ Informações de contratos (valores)
- ✅ Dados de pagamento (se houver)
- ✅ Informações pessoais sensíveis (CPF, CNPJ)

### 2.2 Sanitização de Dados

**Input Validation:**
- **Zod** para validação de schema em TODOS os endpoints
- Sanitização de HTML (prevenir XSS)
- Validação de tipos (TypeScript + runtime)
- Whitelist de caracteres permitidos
- Tamanho máximo de uploads: **10MB**

**Output Encoding:**
- Escape automático no React (proteção XSS)
- Content-Type correto em todas as respostas
- CSP (Content Security Policy) implementado

### 2.3 Privacidade (LGPD)

- **Consentimento explícito** para coleta de dados
- **Direito ao esquecimento** (remoção de dados)
- **Portabilidade** (exportação de dados em JSON)
- **Minimização** (coletar apenas dados necessários)
- **Anonimização** de logs após 90 dias
- **DPO** (Data Protection Officer) definido

---

## 3. SEGURANÇA DE API

### 3.1 Rate Limiting

**Limites Implementados:**

| Endpoint | Limite | Janela |
|----------|--------|--------|
| Login | 5 tentativas | 15 minutos |
| Registro | 3 tentativas | 1 hora |
| APIs gerais | 100 requisições | 1 minuto |
| Upload de arquivos | 10 uploads | 5 minutos |
| Resetar senha | 3 tentativas | 1 hora |

**Tecnologia:** `express-rate-limit` ou `upstash-ratelimit`

### 3.2 CORS (Cross-Origin Resource Sharing)

```typescript
// Apenas domínios autorizados
allowedOrigins: [
  'https://portal.suaempresa.com.br',
  'https://admin.suaempresa.com.br'
]
credentials: true
methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
```

### 3.3 Validação de Requisições

- **CSRF Tokens** em todas as requisições de mutação (POST, PUT, DELETE)
- **Nonce** em formulários
- **Referer/Origin** check
- **API Keys** para integrações externas (rotação a cada 90 dias)

---

## 4. PROTEÇÃO CONTRA ATAQUES

### 4.1 SQL Injection

**✅ PROTEÇÃO:**
- **Prisma ORM** (queries parametrizadas automaticamente)
- **NUNCA** concatenar strings em queries
- Validação de entrada com Zod
- Prepared statements

### 4.2 XSS (Cross-Site Scripting)

**✅ PROTEÇÃO:**
- React escapa automaticamente conteúdo
- **DOMPurify** para HTML rico (se necessário)
- **CSP Headers:**
```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://trusted-cdn.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self';
  connect-src 'self' https://api.suaempresa.com.br;
  frame-ancestors 'none';
```

### 4.3 CSRF (Cross-Site Request Forgery)

**✅ PROTEÇÃO:**
- **CSRF Tokens** em todos os formulários
- **SameSite=Strict** cookies
- **Referer validation**
- Double Submit Cookie pattern

### 4.4 Clickjacking

**✅ PROTEÇÃO:**
- **X-Frame-Options: DENY**
- **CSP frame-ancestors 'none'**

### 4.5 Man-in-the-Middle (MITM)

**✅ PROTEÇÃO:**
- **HTTPS obrigatório**
- **HSTS** habilitado
- **Certificate Pinning** (mobile apps futuras)

### 4.6 Brute Force

**✅ PROTEÇÃO:**
- **Rate limiting** agressivo no login
- **Captcha** após 3 tentativas falhas
- **Account lockout** temporário (15 minutos)
- **Notificação** de tentativas suspeitas

### 4.7 Session Hijacking

**✅ PROTEÇÃO:**
- **httpOnly + Secure cookies**
- **Session fingerprinting** (User-Agent, IP)
- **Regeneração de session ID** após login
- **Detecção de mudança de IP** (alerta ao usuário)

### 4.8 Directory Traversal

**✅ PROTEÇÃO:**
- Validação de caminhos de arquivo
- **Whitelist** de diretórios permitidos
- Normalização de paths (`path.normalize`)

### 4.9 Prototype Pollution

**✅ PROTEÇÃO:**
- Validação rigorosa de JSON
- Não usar `Object.assign` com dados não confiáveis
- Bibliotecas atualizadas

---

## 5. AUDITORIA E LOGS

### 5.1 Log de Atividades

**Eventos Registrados:**
- ✅ Login/Logout (sucesso e falha)
- ✅ Criação/Edição/Exclusão de dados críticos
- ✅ Mudanças de permissões
- ✅ Acesso a dados sensíveis
- ✅ Tentativas de acesso não autorizado
- ✅ Mudanças em contratos/vendas
- ✅ Aprovações administrativas

**Dados Armazenados:**
```typescript
{
  userId: string,
  action: string,
  resource: string,
  timestamp: Date,
  ipAddress: string,
  userAgent: string,
  organizationId?: string,
  metadata: object
}
```

**Retenção:** 1 ano (ou conforme compliance)

### 5.2 Alertas de Segurança

**Notificações Automáticas:**
- 🚨 Múltiplas tentativas de login falhadas
- 🚨 Acesso de IP/país não reconhecido
- 🚨 Mudanças em configurações críticas
- 🚨 Exclusão em massa de dados
- 🚨 Tentativas de escalação de privilégios

---

## 6. SEGURANÇA DE INFRAESTRUTURA

### 6.1 Servidor

**Configuração:**
- **Firewall** ativo (apenas portas 80, 443)
- **Fail2ban** para bloquear IPs maliciosos
- **Atualizações automáticas** de segurança
- **Mínimo privilégio** para processos
- **Containers isolados** (Docker)

### 6.2 Banco de Dados

**PostgreSQL Hardening:**
- ✅ Acesso apenas via rede privada
- ✅ Usuário com **mínimo privilégio** (não usar root)
- ✅ **Firewall** restringindo IPs
- ✅ **SSL/TLS** obrigatório para conexões
- ✅ **Encryption at Rest**
- ✅ **Backups criptografados**

### 6.3 Variáveis de Ambiente

**NUNCA** commitar:
- ❌ `.env` no Git
- ❌ API Keys
- ❌ Senhas
- ❌ Secrets

**Usar:**
- ✅ `.env.example` (template vazio)
- ✅ **Secrets Manager** (AWS Secrets Manager, Vercel Env)
- ✅ Rotação periódica de secrets

### 6.4 Dependências

**Segurança de Pacotes:**
- ✅ `npm audit` / `yarn audit` em CI/CD
- ✅ **Dependabot** para atualizações automáticas
- ✅ **Snyk** para escanear vulnerabilidades
- ✅ Atualizar dependências regularmente
- ✅ Usar versões **fixas** (não usar `^` ou `~`)

---

## 7. COMPLIANCE E LGPD

### 7.1 Conformidade LGPD

**Obrigações:**
- [x] **Base legal** para tratamento de dados
- [x] **Consentimento** explícito
- [x] **Finalidade** específica
- [x] **Transparência** (política de privacidade)
- [x] **Segurança** adequada
- [x] **Direitos dos titulares:**
  - Acesso aos dados
  - Correção de dados
  - Exclusão de dados
  - Portabilidade
  - Revogação de consentimento

### 7.2 Termos e Políticas

**Documentos Obrigatórios:**
- ✅ Política de Privacidade
- ✅ Termos de Uso
- ✅ Política de Cookies
- ✅ Acordo de Processamento de Dados (DPA)

---

## 8. BACKUP E RECUPERAÇÃO

### 8.1 Estratégia de Backup

**Frequência:**
- **Banco de dados**: Backup a cada 6 horas
- **Arquivos**: Backup diário
- **Retenção**: 30 dias (daily) + 12 meses (monthly)

**Testes:**
- ✅ Teste de recuperação **mensal**
- ✅ RTO (Recovery Time Objective): 4 horas
- ✅ RPO (Recovery Point Objective): 6 horas

**Armazenamento:**
- ✅ **Offsite** (AWS S3 Glacier, Backblaze)
- ✅ **Criptografado** (AES-256)
- ✅ **Versionamento** habilitado

### 8.2 Disaster Recovery

**Plano de Contingência:**
1. Detecção do incidente
2. Isolamento do sistema afetado
3. Notificação à equipe
4. Restauração do backup
5. Validação da integridade
6. Retorno à operação
7. Post-mortem

---

## 9. MONITORAMENTO E ALERTAS

### 9.1 Monitoramento

**Ferramentas:**
- **Sentry** - erros de aplicação
- **LogRocket** - sessões de usuários
- **Uptime Robot** - disponibilidade
- **Grafana + Prometheus** - métricas de sistema

**Métricas Monitoradas:**
- ✅ Tempo de resposta de API
- ✅ Taxa de erro (> 1% = alerta)
- ✅ Uso de CPU/Memória
- ✅ Conexões ao banco de dados
- ✅ Latência de queries
- ✅ Tráfego de rede

### 9.2 Alertas

**Canais:**
- Email (crítico)
- Slack/Discord (crítico)
- SMS (emergências)

**Triggers:**
- 🚨 Sistema offline > 2 minutos
- 🚨 Taxa de erro > 5%
- 🚨 Disco > 85% cheio
- 🚨 Tentativas de ataque detectadas

---

## 10. POLÍTICAS DE SEGURANÇA

### 10.1 Política de Senhas

**Usuários:**
- Mínimo 12 caracteres
- Complexidade obrigatória
- Não reutilizar últimas 5 senhas
- Expiração a cada 90 dias (opcional, mas recomendado)
- MFA obrigatório para admin

### 10.2 Política de Acesso

**Princípio do Menor Privilégio:**
- Usuários recebem apenas permissões necessárias
- Revisão de acessos trimestral
- Remoção imediata de ex-funcionários
- Acesso temporário para terceiros (com expiração)

### 10.3 Política de Desenvolvimento Seguro

**Code Review:**
- ✅ Toda alteração precisa de aprovação
- ✅ Verificação de segurança em PRs
- ✅ Testes automatizados obrigatórios
- ✅ SAST (Static Application Security Testing)

**CI/CD:**
- ✅ Scan de vulnerabilidades
- ✅ Testes de segurança automatizados
- ✅ Deploy apenas de branches aprovados

### 10.4 Resposta a Incidentes

**Processo:**
1. **Detecção** - Identificar incidente
2. **Contenção** - Isolar sistemas afetados
3. **Erradicação** - Remover ameaça
4. **Recuperação** - Restaurar operação normal
5. **Lições aprendidas** - Documentar e melhorar

**Equipe de Resposta:**
- Coordenador de Segurança
- Desenvolvedor Senior
- DBA (Database Administrator)
- Suporte de Infraestrutura

---

## 📞 CONTATOS DE EMERGÊNCIA

**Segurança:**
- Email: security@suaempresa.com.br
- Telefone: (XX) XXXX-XXXX (24/7)

**DPO (Data Protection Officer):**
- Email: dpo@suaempresa.com.br

---

## 🔄 ATUALIZAÇÕES DESTE DOCUMENTO

**Versão:** 1.0.0
**Última Atualização:** 2025-11-06
**Responsável:** Equipe de Desenvolvimento
**Próxima Revisão:** 2025-12-06 (mensal)

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Fase 1 - Fundação (Crítico)
- [ ] NextAuth.js configurado com JWT
- [ ] RBAC implementado
- [ ] Middleware de autenticação
- [ ] Bcrypt para senhas
- [ ] HTTPS configurado
- [ ] CORS configurado

### Fase 2 - Proteções
- [ ] Rate limiting em todas as rotas
- [ ] CSRF protection
- [ ] CSP headers
- [ ] Input validation (Zod)
- [ ] SQL injection protection (Prisma)

### Fase 3 - Auditoria
- [ ] Sistema de logs
- [ ] Alertas configurados
- [ ] Monitoramento ativo

### Fase 4 - Compliance
- [ ] Política de Privacidade
- [ ] Termos de Uso
- [ ] Consentimento LGPD
- [ ] Direito ao esquecimento

### Fase 5 - Infraestrutura
- [ ] Backups automatizados
- [ ] Teste de recuperação
- [ ] Firewall configurado
- [ ] Dependências atualizadas

---

## 📚 REFERÊNCIAS

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [LGPD - Lei 13.709/2018](http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- [NextAuth.js Best Practices](https://next-auth.js.org/configuration/options)
- [Prisma Security Guidelines](https://www.prisma.io/docs/guides/database/advanced-database-tasks/data-validation)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

---

**⚠️ IMPORTANTE:** Este documento deve ser tratado como **CONFIDENCIAL** e revisado mensalmente.
