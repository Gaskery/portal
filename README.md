# 🚀 Portal Microsoft 365 - Sistema de Gestão de Licenças

Sistema completo para gestão de vendas, contratos, suporte técnico e atendimento ao cliente para empresa de licenças Microsoft 365.

## 📋 Funcionalidades Principais

### 👥 Áreas do Sistema

#### 🔐 **4 Níveis de Acesso (RBAC)**

1. **Cliente Responsável**
   - Histórico completo de chamados da organização
   - Gerenciamento de usuários da organização
   - Acesso aos quadros de Gantt de projetos
   - Visualização de contratos e produtos adquiridos

2. **Cliente User**
   - Visualização apenas dos próprios chamados
   - Abertura de novos tickets

3. **Técnicos**
   - Fila de chamados por contrato
   - Acesso a informações das organizações
   - Visualização de projetos em Gantt
   - Métricas de desempenho de atendimento

4. **Vendedores**
   - Dashboard com vendas faturadas
   - Acompanhamento de metas
   - Histórico de propostas
   - Registro de atividades (leads, prospecção, avaliações)

5. **Administrativo**
   - Aprovação de vendas faturadas
   - Cadastro de clientes
   - Dashboards completos por vendedor
   - Gestão de solicitações de licenças extras

## 🛡️ Segurança Implementada

### Autenticação & Autorização
- ✅ **NextAuth.js** com JWT
- ✅ **RBAC** (Role-Based Access Control)
- ✅ **Bcrypt** para hash de senhas (12 salt rounds)
- ✅ **MFA/2FA** disponível
- ✅ **Session Management** (30 min timeout)

### Proteções de Segurança
- ✅ **HTTPS** obrigatório (TLS 1.3)
- ✅ **CSRF Protection**
- ✅ **Rate Limiting** (proteção brute force)
- ✅ **XSS Protection** (CSP headers)
- ✅ **SQL Injection** (Prisma ORM)
- ✅ **Clickjacking Protection** (X-Frame-Options)
- ✅ **Input Validation** (Zod schemas)
- ✅ **Audit Logging** completo

### Criptografia
- ✅ **AES-256-GCM** para dados sensíveis
- ✅ **Bcrypt** para senhas
- ✅ **HTTPS/TLS** para dados em trânsito
- ✅ **Database encryption at rest**

### Compliance
- ✅ **LGPD** compliant
- ✅ Direito ao esquecimento
- ✅ Portabilidade de dados
- ✅ Consentimento explícito
- ✅ Auditoria de 1 ano

## 🏗️ Stack Tecnológico

### Frontend + Backend
- **Next.js 14** (App Router)
- **TypeScript**
- **React 18**
- **Tailwind CSS** + **shadcn/ui**

### Banco de Dados
- **PostgreSQL 16**
- **Prisma ORM**

### Autenticação
- **NextAuth.js**
- **JWT Tokens**

### Validação
- **Zod**
- **React Hook Form**

### DevOps
- **Docker** + **Docker Compose**
- **Redis** (cache e rate limiting)

## 🚀 Instalação

### Pré-requisitos

- **Node.js 20+**
- **PostgreSQL 14+** (ou Docker)
- **npm 10+**

### 1. Clone o repositório

\`\`\`bash
git clone <seu-repositorio>
cd portal
\`\`\`

### 2. Instale as dependências

\`\`\`bash
npm install
\`\`\`

### 3. Configure as variáveis de ambiente

\`\`\`bash
cp .env.example .env
\`\`\`

Edite o arquivo \`.env\` com suas configurações:

\`\`\`env
# Banco de dados
DATABASE_URL="postgresql://usuario:senha@localhost:5432/portal_m365"

# NextAuth
NEXTAUTH_SECRET="gere-com-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Criptografia
ENCRYPTION_KEY="gere-com-openssl-rand-hex-32"
\`\`\`

### 4. Execute as migrações do banco

\`\`\`bash
npx prisma migrate dev
npx prisma generate
\`\`\`

### 5. (Opcional) Popular banco com dados de teste

\`\`\`bash
npm run prisma:seed
\`\`\`

### 6. Inicie o servidor de desenvolvimento

\`\`\`bash
npm run dev
\`\`\`

Acesse: **http://localhost:3000**

## 🐳 Docker (Produção)

### Inicie com Docker Compose

\`\`\`bash
# Criar arquivo .env.production
cp .env.example .env.production

# Editar variáveis de produção
nano .env.production

# Iniciar containers
docker-compose up -d

# Executar migrações
docker-compose exec app npx prisma migrate deploy
\`\`\`

### Comandos úteis

\`\`\`bash
# Ver logs
docker-compose logs -f app

# Parar containers
docker-compose down

# Rebuild
docker-compose up -d --build
\`\`\`

## 📊 Estrutura do Banco de Dados

### Principais Entidades

- **Users** - Usuários do sistema (4 roles)
- **Organizations** - Organizações/Clientes
- **Contracts** - Contratos de licenças
- **Products** - Produtos Microsoft 365
- **Tickets** - Chamados de suporte
- **Projects** - Projetos (Gantt)
- **Sales** - Vendas e propostas
- **Activities** - Atividades de vendedores
- **LicenseRequests** - Solicitações de licenças extras
- **AuditLog** - Logs de auditoria

Veja o schema completo em: `prisma/schema.prisma`

## 🔐 Segurança - Checklist

Antes de ir para produção, verifique:

- [ ] Alterar todas as senhas/secrets padrão
- [ ] Configurar HTTPS com certificado válido
- [ ] Ativar Firewall (portas 80, 443 apenas)
- [ ] Configurar backup automático
- [ ] Testar recuperação de backup
- [ ] Habilitar rate limiting no Nginx/Cloudflare
- [ ] Configurar monitoramento (Sentry)
- [ ] Configurar alertas de segurança
- [ ] Revisar logs de auditoria regularmente
- [ ] Atualizar dependências (npm audit)

Consulte: **[SECURITY.md](./SECURITY.md)** para protocolo completo.

## 📁 Estrutura de Diretórios

\`\`\`
portal/
├── prisma/
│   └── schema.prisma          # Schema do banco de dados
├── src/
│   ├── app/                   # App Router (Next.js 14)
│   │   ├── api/              # Rotas de API
│   │   ├── admin/            # Área administrativa
│   │   ├── cliente/          # Área do cliente
│   │   ├── tecnico/          # Área dos técnicos
│   │   └── vendedor/         # Área de vendedores
│   ├── components/            # Componentes React
│   ├── lib/                   # Bibliotecas e configs
│   │   ├── auth.ts           # NextAuth config
│   │   ├── prisma.ts         # Prisma client
│   │   └── validations/      # Schemas Zod
│   ├── types/                 # Tipos TypeScript
│   ├── utils/                 # Utilitários
│   │   ├── encryption.ts     # Criptografia
│   │   └── rate-limit.ts     # Rate limiting
│   └── middleware.ts          # Middleware global
├── public/                    # Arquivos estáticos
├── .env.example               # Exemplo de variáveis
├── SECURITY.md                # Protocolos de segurança
├── docker-compose.yml         # Docker Compose
└── package.json
\`\`\`

## 🧪 Testes

\`\`\`bash
# Executar testes
npm test

# Testes com watch
npm run test:watch

# Cobertura
npm run test:coverage
\`\`\`

## 📝 Scripts Disponíveis

\`\`\`bash
npm run dev              # Desenvolvimento
npm run build            # Build produção
npm run start            # Iniciar produção
npm run lint             # Linter
npm run type-check       # Verificar tipos
npm run prisma:generate  # Gerar Prisma Client
npm run prisma:migrate   # Executar migrações
npm run prisma:studio    # Abrir Prisma Studio
npm run security:audit   # Auditoria de segurança
\`\`\`

## 🔧 Configuração de Ambientes

### Desenvolvimento
\`\`\`bash
npm run dev
\`\`\`

### Produção (Vercel)
\`\`\`bash
# Configurar variáveis de ambiente no Vercel
# Deploy automático via Git push
\`\`\`

### Produção (VPS/AWS)
\`\`\`bash
# Usar Docker Compose
docker-compose -f docker-compose.prod.yml up -d
\`\`\`

## 📞 Suporte e Contato

**Equipe de Desenvolvimento**
- Email: dev@suaempresa.com.br
- Slack: #portal-suporte

**Segurança**
- Email: security@suaempresa.com.br
- Telefone: (XX) XXXX-XXXX (24/7)

## 📄 Licença

Propriedade de **[Sua Empresa]**. Todos os direitos reservados.

---

## 🗺️ Roadmap

### Fase 1 - MVP (Atual) ✅
- [x] Autenticação e RBAC
- [x] Gestão de tickets
- [x] Área do cliente
- [x] Área dos técnicos
- [x] Área de vendas
- [x] Área administrativa

### Fase 2 - Melhorias
- [ ] Notificações em tempo real (WebSockets)
- [ ] Chat interno
- [ ] Relatórios avançados (PDF export)
- [ ] Integração com Microsoft Graph API
- [ ] App mobile (React Native)

### Fase 3 - IA e Automação
- [ ] Chatbot de suporte (GPT)
- [ ] Análise preditiva de vendas
- [ ] Sugestões automáticas de upsell
- [ ] Detecção de anomalias

---

**Desenvolvido com ❤️ por [Sua Empresa]**
