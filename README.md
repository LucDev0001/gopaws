# GoPaws 🐾 - Uber for Dog Walking (PWA)

> Uma plataforma completa de solicitação de passeios para cães, conectando Tutores e Walkers em tempo real.

O **GoPaws** é uma Progressive Web App (PWA) desenvolvida com foco em **Alta Performance** e **Arquitetura Limpa**. O diferencial deste projeto é a utilização de **JavaScript Moderno (Vanilla ES6+)** puro, sem a dependência de frameworks de UI como React, Vue ou Angular, provando que é possível criar SPAs complexas e reativas dominando os fundamentos da Web.

## 🚀 Tecnologias & Stack

- **Frontend:** HTML5, JavaScript (ES6 Modules).
- **Estilização:** Tailwind CSS (Mobile-First).
- **Mapas & Geolocalização:** Leaflet.js + OpenStreetMap (Alternativa Open Source ao Google Maps).
- **Backend as a Service (BaaS):** Firebase (Authentication & Firestore).
- **Arquitetura:** SPA com Roteamento via Hash (`#`) e Injeção de Dependência manual.

## ✨ Funcionalidades Principais

- **📱 Multi-Perfil:**
  - **Tutor:** Cadastra pets, solicita passeios e acompanha o trajeto.
  - **Walker:** Recebe pedidos próximos, aceita corridas e registra eventos (Xixi/Cocô).
  - **Parceiro (Manager):** Perfil para Pet Shops e Agências gerenciarem seus walkers.
- **🗺️ Rastreamento em Tempo Real:** Monitoramento GPS ao vivo durante o passeio usando a Geolocation API e Firestore.
- **💬 Chat Integrado:** Comunicação em tempo real entre Tutor e Walker durante o serviço.
- **⚡ PWA:** Instalável em dispositivos móveis, leve e otimizado para redes 3G/4G.
- **🔒 Segurança:** Regras de validação robustas via `firestore.rules` (No-Backend logic).

## 📂 Arquitetura do Projeto

O projeto segue uma estrutura modular para garantir manutenibilidade:

```text
/src
  ├── /components  # Componentes de UI reutilizáveis (Navbar, Cards, Modais)
  ├── /router      # Roteador artesanal para SPA (History/Hash management)
  ├── /services    # Camada de dados e lógica de negócio (Firebase, Geo, Auth)
  ├── /utils       # Helpers, Formatadores e Toast Notifications
  ├── /views       # Telas (Padrão de ciclo de vida: getHtml + init + unmount)
  └── app.js       # Ponto de entrada e inicialização
```

## 🛠️ Como Rodar Localmente

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/seu-usuario/gopaws.git
    ```
2.  **Configuração do Firebase:**
    - Crie um projeto no Firebase Console.
    - Habilite **Authentication** (Email/Password) e **Firestore Database**.
    - Copie as credenciais para `src/services/firebase.js`.
3.  **Executar:**
    - Como é um projeto Vanilla, você precisa apenas de um servidor estático.
    - Se usar VSCode, instale a extensão **Live Server** e clique em "Go Live" no `index.html`.
    - Ou via terminal: `npx serve .`

---

**Status do Projeto:** 🚧 Em desenvolvimento ativo (MVP Concluído).
Desenvolvido com 🖤 e JavaScript Puro.
