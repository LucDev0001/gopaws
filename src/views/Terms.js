export default {
  async getHtml() {
    return `
            <div class="flex flex-col h-full bg-gray-50">
                <header class="p-4 border-b flex items-center gap-4 sticky top-0 bg-white z-10 shadow-sm">
                    <button onclick="window.history.back()" class="text-gray-600 p-2 hover:bg-gray-100 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 class="text-xl font-bold text-gray-800">Termos de Uso</h1>
                </header>
                <div class="flex-1 overflow-y-auto p-8 prose max-w-none text-gray-700">
                    <p>Última atualização: 16 de Dezembro de 2025</p>

                    <h2 class="text-lg font-bold text-gray-900 mt-4 mb-2">1. O Serviço GoPaws</h2>
                    <p>O GoPaws ("Plataforma") é um software que conecta (i) donos de animais de estimação ("Tutores") e (ii) empresas de passeio de cães ("Gerentes" ou "Pet Shops") que empregam ou gerenciam passeadores profissionais ("Walkers"). O GoPaws atua como um intermediário tecnológico, fornecendo ferramentas de agendamento, rastreamento por GPS e comunicação.</p>

                    <h2 class="text-lg font-bold text-gray-900 mt-4 mb-2">2. Papéis e Responsabilidades</h2>
                    <ul class="list-disc pl-5 space-y-2">
                        <li><strong>Tutor:</strong> Você é responsável por fornecer informações precisas sobre seu pet, incluindo comportamento, saúde e necessidades especiais. Você concorda em realizar o pagamento diretamente ao Pet Shop ao final de cada serviço.</li>
                        <li><strong>Gerente (Pet Shop):</strong> Você é responsável pela seleção, treinamento e verificação de seus Walkers. Você concorda em fornecer dados de pagamento (Chave PIX, WhatsApp) válidos para receber dos Tutores. Você também concorda com o pagamento de uma taxa de assinatura mensal para uso da plataforma, conforme descrito na aba "Assinatura".</li>
                        <li><strong>Walker:</strong> Você é um agente do Gerente/Pet Shop. Você concorda em seguir as melhores práticas de segurança e bem-estar animal durante os passeios.</li>
                    </ul>

                    <h2 class="text-lg font-bold text-gray-900 mt-4 mb-2">3. Pagamentos e Assinaturas</h2>
                    <p><strong>Pagamento do Passeio:</strong> O pagamento pelo serviço de passeio é uma transação direta entre o Tutor e o Pet Shop. O GoPaws exibe os dados de pagamento fornecidos pelo Pet Shop para facilitar a transação, mas não processa, armazena ou se responsabiliza por esses pagamentos.</p>
                    <p><strong>Assinatura da Plataforma:</strong> Os Gerentes/Pet Shops concordam em pagar uma taxa de assinatura mensal para manter o acesso às ferramentas administrativas da plataforma. O não pagamento resultará na suspensão do acesso até a regularização. Os dados para pagamento da assinatura estão disponíveis no painel do Gerente.</p>

                    <h2 class="text-lg font-bold text-gray-900 mt-4 mb-2">4. Limitação de Responsabilidade</h2>
                    <p>O GoPaws é uma plataforma de software (SaaS) e não se responsabiliza por incidentes que ocorram durante os passeios, incluindo, mas não se limitando a, acidentes, fugas, danos a propriedades ou interações entre animais. A responsabilidade civil e criminal por tais eventos recai sobre o Pet Shop contratado e seu Walker.</p>

                    <h2 class="text-lg font-bold text-gray-900 mt-4 mb-2">5. Coleta e Uso de Dados</h2>
                    <p>Ao usar a plataforma, você concorda com a coleta e uso de suas informações conforme descrito em nossa <strong>Política de Privacidade</strong>. Isso inclui o rastreamento por GPS durante os passeios, que é uma funcionalidade essencial do serviço.</p>

                    <h2 class="text-lg font-bold text-gray-900 mt-4 mb-2">6. Suspensão e Encerramento de Conta</h2>
                    <p>Reservamo-nos o direito de suspender ou banir qualquer usuário (Tutor, Walker ou Gerente) que viole estes termos, pratique atividades fraudulentas ou coloque em risco a segurança e a integridade da comunidade GoPaws.</p>
                </div>
            </div>
        `;
  },
  async init() {
    // Sem lógica complexa necessária aqui
  },
};
