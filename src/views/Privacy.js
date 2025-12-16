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
                    <h1 class="text-xl font-bold text-gray-800">Política de Privacidade</h1>
                </header>
                <div class="flex-1 overflow-y-auto p-8 prose max-w-none text-gray-700">
                    <p>Última atualização: 16 de Dezembro de 2025</p>

                    <h2 class="text-lg font-bold text-gray-900 mt-4 mb-2">1. Dados que Coletamos</h2>
                    <p>Para operar a plataforma GoPaws, coletamos os seguintes tipos de informações:</p>
                    <ul class="list-disc pl-5 space-y-2">
                        <li><strong>Dados de Identificação:</strong> Nome, e-mail, CPF (Tutores), CNPJ (Gerentes).</li>
                        <li><strong>Dados de Contato:</strong> Telefone, endereço, número de WhatsApp (Gerentes).</li>
                        <li><strong>Dados de Pagamento (Apenas para Gerentes):</strong> Chave PIX para recebimento dos pagamentos dos Tutores.</li>
                        <li><strong>Dados do Pet:</strong> Nome, raça, idade e foto do animal de estimação.</li>
                        <li><strong>Dados de Localização:</strong> Coordenadas de GPS em tempo real durante um passeio ativo.</li>
                        <li><strong>Dados de Comunicação:</strong> Mensagens trocadas através do chat da plataforma.</li>
                    </ul>

                    <h2 class="text-lg font-bold text-gray-900 mt-4 mb-2">2. Como Usamos Seus Dados</h2>
                    <p>Utilizamos suas informações para:</p>
                    <ul class="list-disc pl-5 space-y-2">
                        <li>Operar e manter a plataforma.</li>
                        <li>Conectar Tutores com os serviços dos Pet Shops.</li>
                        <li>Permitir o rastreamento em tempo real dos passeios para segurança e transparência.</li>
                        <li>Facilitar a comunicação entre as partes durante um serviço.</li>
                        <li>Exibir os dados de pagamento do Pet Shop para o Tutor ao final do passeio.</li>
                        <li>Processar a assinatura mensal dos Gerentes/Pet Shops.</li>
                    </ul>

                    <h2 class="text-lg font-bold text-gray-900 mt-4 mb-2">3. Compartilhamento de Informações</h2>
                    <p>O compartilhamento de dados é limitado e essencial para o funcionamento do serviço:</p>
                    <ul class="list-disc pl-5 space-y-2">
                        <li>O <strong>Tutor</strong> terá acesso ao nome e foto do Walker designado para o passeio.</li>
                        <li>O <strong>Walker</strong> terá acesso ao nome do Tutor, nome do pet e endereço de coleta/entrega apenas durante um passeio ativo.</li>
                        <li>O <strong>Gerente (Pet Shop)</strong> tem acesso aos dados dos seus Walkers e ao histórico de passeios de sua equipe.</li>
                        <li>A <strong>Chave PIX</strong> e o <strong>WhatsApp</strong> do Pet Shop são exibidos ao Tutor no momento do pagamento.</li>
                    </ul>
                    <p>Não vendemos ou compartilhamos seus dados pessoais com terceiros para fins de marketing.</p>

                    <h2 class="text-lg font-bold text-gray-900 mt-4 mb-2">4. Segurança dos Dados</h2>
                    <p>Empregamos medidas de segurança para proteger suas informações, incluindo o uso de criptografia e regras de acesso restritas no banco de dados (Firestore Security Rules). O acesso aos dados é limitado ao que é estritamente necessário para cada tipo de usuário.</p>

                    <h2 class="text-lg font-bold text-gray-900 mt-4 mb-2">5. Seus Direitos</h2>
                    <p>Você pode acessar e editar suas informações pessoais a qualquer momento através da tela de "Perfil" no aplicativo. Para solicitar a exclusão de sua conta e dados associados, entre em contato conosco.</p>
                </div>
            </div>
        `;
  },
  async init() {
    // Sem lógica complexa necessária aqui
  },
};
