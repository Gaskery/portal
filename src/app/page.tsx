/**
 * Home Page - Portal Microsoft 365
 */

import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            Portal Microsoft 365
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Sistema completo de gestão de licenças, vendas e suporte técnico
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Card Cliente */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">👥</div>
            <h2 className="text-xl font-semibold mb-2">Clientes</h2>
            <p className="text-gray-600 mb-4 text-sm">
              Gerenciamento de chamados e contratos
            </p>
            <Link
              href="/auth/login?role=cliente"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Acessar
            </Link>
          </div>

          {/* Card Técnico */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">🛠️</div>
            <h2 className="text-xl font-semibold mb-2">Técnicos</h2>
            <p className="text-gray-600 mb-4 text-sm">
              Fila de atendimentos e projetos
            </p>
            <Link
              href="/auth/login?role=tecnico"
              className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Acessar
            </Link>
          </div>

          {/* Card Vendedor */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">💼</div>
            <h2 className="text-xl font-semibold mb-2">Vendedores</h2>
            <p className="text-gray-600 mb-4 text-sm">
              Dashboard de vendas e propostas
            </p>
            <Link
              href="/auth/login?role=vendedor"
              className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Acessar
            </Link>
          </div>

          {/* Card Admin */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">⚙️</div>
            <h2 className="text-xl font-semibold mb-2">Administrativo</h2>
            <p className="text-gray-600 mb-4 text-sm">
              Gestão completa do sistema
            </p>
            <Link
              href="/auth/login?role=admin"
              className="inline-block bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Acessar
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h3 className="text-2xl font-semibold mb-4">🔐 Segurança em Primeiro Lugar</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-green-600">✓ HTTPS/TLS</div>
              <div className="text-gray-600">Criptografia</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-green-600">✓ RBAC</div>
              <div className="text-gray-600">Controle de Acesso</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-green-600">✓ MFA</div>
              <div className="text-gray-600">Autenticação 2FA</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-green-600">✓ LGPD</div>
              <div className="text-gray-600">Compliance</div>
            </div>
          </div>
        </div>

        <div className="text-gray-500 text-sm">
          <p>Desenvolvido com ❤️ por Sua Empresa</p>
          <p className="mt-2">
            Precisa de ajuda? <a href="mailto:suporte@suaempresa.com.br" className="text-blue-600 hover:underline">Entre em contato</a>
          </p>
        </div>
      </div>
    </main>
  );
}
