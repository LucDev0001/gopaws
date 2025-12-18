export default {
  getHtml() {
    return `
      <div class="min-h-screen bg-gray-50 p-6 font-sans">
        <div class="max-w-3xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <header class="mb-8 border-b border-gray-100 pb-6">
                <button onclick="window.history.back()" class="text-sm font-bold text-gray-500 hover:text-black mb-4">← Voltar</button>
                <h1 class="text-3xl font-bold text-gray-900">Política de Privacidade</h1>
                <p class="text-gray-500 text-sm mt-2">Seus dados estão seguros conosco.</p>
            </header>

            <div class="prose prose-sm max-w-none text-gray-600 space-y-6">
                <section>
                    <h3 class="text-lg font-bold text-gray-900 mb-2">1. Coleta de Dados</h3>
                    <p>Coletamos informações essenciais para a prestação do serviço: Nome, E-mail, Telefone, Endereço e Dados do Pet. Para Walkers e Managers, coletamos também CPF/CNPJ para verificação de identidade.</p>
                </section>

                <section>
                    <h3 class="text-lg font-bold text-gray-900 mb-2">2. Dados de Localização (GPS)</h3>
                    <p><strong>2.1. Walkers:</strong> O aplicativo coleta dados de localização em tempo real e em segundo plano APENAS quando um passeio está com status "Em Andamento" (Ongoing). Isso é necessário para gerar o mapa do trajeto para o Tutor e para segurança.</p>
                    <p><strong>2.2. Tutores:</strong> A localização é usada pontualmente para encontrar passeadores próximos no momento da solicitação.</p>
                </section>

                <section>
                    <h3 class="text-lg font-bold text-gray-900 mb-2">3. Dados Financeiros</h3>
                    <p>O GoPaws <strong>não armazena</strong> números de cartão de crédito. As transações de saldo são registros de créditos pré-pagos. Comprovantes de PIX enviados podem ser armazenados temporariamente para conferência pela Agência.</p>
                </section>

                <section>
                    <h3 class="text-lg font-bold text-gray-900 mb-2">4. Compartilhamento</h3>
                    <p>Seus dados (Nome, Endereço, Telefone) são compartilhados estritamente entre as partes envolvidas em um serviço ativo (Tutor e Walker/Agência) para viabilizar o atendimento.</p>
                </section>

                <section>
                    <h3 class="text-lg font-bold text-gray-900 mb-2">5. Segurança</h3>
                    <p>Utilizamos criptografia SSL em todas as comunicações e autenticação segura via Google Firebase. O acesso a dados sensíveis é restrito.</p>
                </section>

                <section>
                    <h3 class="text-lg font-bold text-gray-900 mb-2">6. Exclusão de Dados</h3>
                    <p>Você pode solicitar a exclusão completa da sua conta e dados a qualquer momento através do menu de perfil ou entrando em contato com o suporte.</p>
                </section>
            </div>

            <div class="mt-10 pt-6 border-t border-gray-100 text-center">
                <p class="text-xs text-gray-400">Dúvidas? contato@gopaws.com</p>
            </div>
        </div>
      </div>
    `;
  },
};
