/**
 * Seed do Banco de Dados
 * Popula o banco com dados de teste
 */

import { PrismaClient, UserRole, UserStatus, TicketStatus, TicketPriority, TicketCategory, ContractStatus, ProductCategory, OrganizationType } from '@prisma/client';
import { hashPassword } from '../src/utils/encryption';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados existentes
  await prisma.auditLog.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.contractItem.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  // 1. Criar Produtos
  console.log('📦 Criando produtos...');
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Microsoft 365 Business Basic',
        category: ProductCategory.MICROSOFT_365_BUSINESS_BASIC,
        description: 'Email empresarial, 1TB OneDrive, Teams',
        sku: 'M365-BASIC-001',
        unitPrice: 25.90,
        active: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Microsoft 365 Business Standard',
        category: ProductCategory.MICROSOFT_365_BUSINESS_STANDARD,
        description: 'Aplicativos Office completos + Basic',
        sku: 'M365-STD-001',
        unitPrice: 49.90,
        active: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Microsoft 365 Business Premium',
        category: ProductCategory.MICROSOFT_365_BUSINESS_PREMIUM,
        description: 'Segurança avançada + Standard',
        sku: 'M365-PREM-001',
        unitPrice: 89.90,
        active: true,
      },
    }),
  ]);

  // 2. Criar Organizações
  console.log('🏢 Criando organizações...');
  const org1 = await prisma.organization.create({
    data: {
      name: 'Tech Solutions Ltda',
      cnpj: '12345678000190',
      email: 'contato@techsolutions.com.br',
      phone: '11987654321',
      type: OrganizationType.MEDIA_EMPRESA,
      address: 'Av. Paulista, 1000',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310100',
      active: true,
    },
  });

  const org2 = await prisma.organization.create({
    data: {
      name: 'Consultoria Empresarial S.A.',
      cnpj: '98765432000111',
      email: 'contato@consultoria.com.br',
      phone: '11876543210',
      type: OrganizationType.PEQUENA_EMPRESA,
      address: 'Rua Augusta, 500',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01305000',
      active: true,
    },
  });

  // 3. Criar Usuários
  console.log('👥 Criando usuários...');

  // Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@portal.com',
      name: 'Administrador Sistema',
      password: await hashPassword('Admin@123456'),
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
    },
  });

  // Vendedor
  const vendedor = await prisma.user.create({
    data: {
      email: 'vendedor@portal.com',
      name: 'João Vendedor',
      password: await hashPassword('Vendedor@123'),
      role: UserRole.VENDEDOR,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
    },
  });

  // Técnico
  const tecnico = await prisma.user.create({
    data: {
      email: 'tecnico@portal.com',
      name: 'Maria Técnica',
      password: await hashPassword('Tecnico@123'),
      role: UserRole.TECNICO,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
    },
  });

  // Cliente Responsável
  const clienteResp = await prisma.user.create({
    data: {
      email: 'responsavel@techsolutions.com.br',
      name: 'Pedro Responsável',
      password: await hashPassword('Cliente@123'),
      role: UserRole.CLIENTE_RESPONSAVEL,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
      organizationId: org1.id,
    },
  });

  // Cliente User
  const clienteUser = await prisma.user.create({
    data: {
      email: 'user@techsolutions.com.br',
      name: 'Ana Usuária',
      password: await hashPassword('Cliente@123'),
      role: UserRole.CLIENTE_USER,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
      organizationId: org1.id,
    },
  });

  // Atualizar org1 com vendedor responsável
  await prisma.organization.update({
    where: { id: org1.id },
    data: { salesRepId: vendedor.id },
  });

  // 4. Criar Contratos
  console.log('📄 Criando contratos...');
  const contract1 = await prisma.contract.create({
    data: {
      contractNumber: 'CTR-2024-001',
      organizationId: org1.id,
      status: ContractStatus.ACTIVE,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      totalValue: 12000.00,
      items: {
        create: [
          {
            productId: products[1].id,
            quantity: 20,
            unitPrice: products[1].unitPrice,
            totalPrice: products[1].unitPrice.toNumber() * 20,
          },
        ],
      },
    },
  });

  // 5. Criar Tickets
  console.log('🎫 Criando tickets...');
  await prisma.ticket.create({
    data: {
      ticketNumber: 'TKT-2024-0001',
      title: 'Problema com Email do Outlook',
      description: 'Não consigo enviar emails pelo Outlook. Aparece erro de conexão.',
      status: TicketStatus.OPEN,
      priority: TicketPriority.HIGH,
      category: TicketCategory.SUPORTE_TECNICO,
      organizationId: org1.id,
      contractId: contract1.id,
      createdById: clienteUser.id,
      assignedToId: tecnico.id,
      slaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
    },
  });

  await prisma.ticket.create({
    data: {
      ticketNumber: 'TKT-2024-0002',
      title: 'Configuração de SharePoint',
      description: 'Preciso de ajuda para configurar permissões no SharePoint.',
      status: TicketStatus.IN_PROGRESS,
      priority: TicketPriority.MEDIUM,
      category: TicketCategory.SHAREPOINT,
      organizationId: org1.id,
      contractId: contract1.id,
      createdById: clienteResp.id,
      assignedToId: tecnico.id,
      slaDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48h
    },
  });

  // 6. Criar Logs de Auditoria
  console.log('📝 Criando logs de auditoria...');
  await prisma.auditLog.createMany({
    data: [
      {
        userId: admin.id,
        action: 'LOGIN',
        resource: 'User',
        resourceId: admin.id,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      },
      {
        userId: clienteUser.id,
        action: 'CREATE',
        resource: 'Ticket',
        resourceId: 'TKT-2024-0001',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
      },
    ],
  });

  console.log('✅ Seed concluído com sucesso!');
  console.log('\n📊 Dados criados:');
  console.log(`- ${await prisma.product.count()} produtos`);
  console.log(`- ${await prisma.organization.count()} organizações`);
  console.log(`- ${await prisma.user.count()} usuários`);
  console.log(`- ${await prisma.contract.count()} contratos`);
  console.log(`- ${await prisma.ticket.count()} tickets`);

  console.log('\n🔑 Credenciais de Teste:');
  console.log('Admin: admin@portal.com / Admin@123456');
  console.log('Vendedor: vendedor@portal.com / Vendedor@123');
  console.log('Técnico: tecnico@portal.com / Tecnico@123');
  console.log('Cliente Responsável: responsavel@techsolutions.com.br / Cliente@123');
  console.log('Cliente User: user@techsolutions.com.br / Cliente@123');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
