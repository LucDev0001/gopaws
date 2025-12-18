export default {
  getHtml() {
    return `
      <div class="min-h-screen bg-gray-50 p-6 font-sans">
        <div class="max-w-3xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <header class="mb-8 border-b border-gray-100 pb-6">
                <button onclick="window.history.back()" class="text-sm font-bold text-gray-500 hover:text-black mb-4">← Voltar</button>
                <h1 class="text-3xl font-bold text-gray-900">Termos de Uso</h1>
                <p class="text-gray-500 text-sm mt-2">Última atualização: 23 de Maio de 2024</p>
            </header>

            <div class="prose prose-sm max-w-none text-gray-600 space-y-6">
                <section>
                    <h3 class="text-lg font-bold text-gray-900 mb-2">1. Aceitação dos Termos</h3>
                    <p>Ao acessar e usar o GoPaws, você concorda com estes termos. A plataforma conecta Tutores a Passeadores (Walkers) e Agências (Managers).</p>
                </section>

                <section>
                    <h3 class="text-lg font-bold text-gray-900 mb-2">2. Carteira Digital e Saldo (GoPaws Wallet)</h3>
                    <p><strong>2.1. Natureza do Saldo:</strong> Os créditos inseridos na plataforma ("Saldo GoPaws") são pré-pagamentos destinados exclusivamente à contratação de serviços de passeio dentro do aplicativo. O saldo não rende juros e não constitui conta bancária.</p>
                    <p><strong>2.2. Recargas:</strong> As recargas são realizadas via PIX diretamente para a conta da Agência/Pet Shop parceira. A liberação do saldo ocorre mediante aprovação manual do Manager após conferência.</p>
                    <p><strong>2.3. Reembolsos:</strong> O saldo não utilizado pode ser reembolsado mediante solicitação direta à Agência, sujeito a taxas administrativas de até 10% para cobrir custos operacionais. Saldos promocionais ou bônus não são reembolsáveis.</p>
                </section>

                <section>
                    <h3 class="text-lg font-bold text-gray-900 mb-2">3. Responsabilidades</h3>
                    <p><strong>3.1. Do Tutor:</strong> Informar corretamente as condições de saúde e comportamento do animal (alergias, reatividade). Danos causados por omissão dessas informações são de responsabilidade do Tutor.</p>
                    <p><strong>3.2. Do Walker:</strong> Zelar pela segurança do animal, cumprir o trajeto acordado e recolher dejetos. O uso do GPS é obrigatório durante o serviço.</p>
                    <p><strong>3.3. Da Plataforma:</strong> O GoPaws atua como intermediário tecnológico e não se responsabiliza por atos diretos dos usuários, embora ofereça ferramentas de segurança (Rastreamento, SOS).</p>
                </section>

                <section>
                    <h3 class="text-lg font-bold text-gray-900 mb-2">4. Cancelamento e No-Show</h3>
                    <p>Cancelamentos feitos com menos de 1 hora de antecedência podem estar sujeitos a cobrança de taxa de deslocamento se o Walker já estiver a caminho.</p>
                </section>

                <section>
                    <h3 class="text-lg font-bold text-gray-900 mb-2">5. Uso de Imagem e Dados</h3>
                    <p>Ao utilizar o serviço, você autoriza o envio de fotos do seu pet para relatórios de passeio. Dados de localização são coletados apenas durante a execução do serviço.</p>
                </section>
            </div>

            <div class="mt-10 pt-6 border-t border-gray-100 text-center">
                <p class="text-xs text-gray-400">GoPaws Inc. © 2024</p>
            </div>
        </div>
      </div>
    `;
  },
};
