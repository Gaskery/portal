# 🚀 Guia de Instalação - Portal Microsoft 365

## Pré-requisitos

- Node.js 20+
- PostgreSQL 14+
- npm 10+

## 📦 Instalação Passo a Passo

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

Edite o arquivo \`.env\` e configure:

\`\`\`env
# Banco de dados
DATABASE_URL="postgresql://usuario:senha@localhost:5432/portal_m365"

# NextAuth - Gere com: openssl rand -base64 32
NEXTAUTH_SECRET="seu-secret-aqui"
NEXTAUTH_URL="http://localhost:3000"

# Criptografia - Gere com: openssl rand -hex 32
ENCRYPTION_KEY="seu-encryption-key-aqui"
\`\`\`

### 4. Execute as migrações do banco

\`\`\`bash
npx prisma migrate dev --name init
npx prisma generate
\`\`\`

### 5. (OPCIONAL) Popule o banco com dados de teste

\`\`\`bash
npm run prisma:seed
\`\`\`

Isso criará usuários de teste para cada role.

### 6. Inicie o servidor de desenvolvimento

\`\`\`bash
npm run dev
\`\`\`

Acesse: **http://localhost:3000**

---

## 🐳 Instalação com Docker

### 1. Configure variáveis de ambiente

\`\`\`bash
cp .env.example .env.production
\`\`\`

Edite \`.env.production\` com suas credenciais.

### 2. Inicie os containers

\`\`\`bash
docker-compose up -d
\`\`\`

### 3. Execute as migrações

\`\`\`bash
docker-compose exec app npx prisma migrate deploy
\`\`\`

### 4. (OPCIONAL) Execute o seed

\`\`\`bash
docker-compose exec app npm run prisma:seed
\`\`\`

---

## 🔑 Usuários de Teste (após seed)

| Role | Email | Senha |
|------|-------|-------|
| Admin | admin@portal.com | Admin@123456 |
| Vendedor | vendedor@portal.com | Vendedor@123 |
| Técnico | tecnico@portal.com | Tecnico@123 |
| Cliente Responsável | responsavel@techsolutions.com.br | Cliente@123 |
| Cliente User | user@techsolutions.com.br | Cliente@123 |

---

## 🔧 Comandos Úteis

\`\`\`bash
# Desenvolvimento
npm run dev                 # Iniciar dev server
npm run build              # Build produção
npm run start              # Iniciar produção
npm run lint               # Executar linter

# Prisma
npm run prisma:generate    # Gerar Prisma Client
npm run prisma:migrate     # Executar migrações
npm run prisma:studio      # Abrir Prisma Studio
npm run prisma:seed        # Popular banco de dados

# Testes
npm test                   # Executar testes
npm run test:watch         # Testes em watch mode

# Segurança
npm run security:audit     # Auditoria de segurança
\`\`\`

---

## ⚠️ Problemas Comuns

### Erro de conexão com PostgreSQL

Certifique-se de que o PostgreSQL está rodando:

\`\`\`bash
# Linux/Mac
sudo service postgresql status

# Docker
docker ps | grep postgres
\`\`\`

### Erro "Invalid \`prisma.xxx.create()\`"

Execute:

\`\`\`bash
npx prisma generate
\`\`\`

### Porta 3000 já em uso

Mude a porta no \`.env\`:

\`\`\`env
PORT=3001
\`\`\`

Ou mate o processo:

\`\`\`bash
# Linux/Mac
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
\`\`\`

---

## 📞 Precisa de Ajuda?

- Documentação: [README.md](./README.md)
- Segurança: [SECURITY.md](./SECURITY.md)
- Issues: Abra uma issue no GitHub
