# Formação Continuada - CaixaVerso 🚀

Repositório destinado à consolidação dos projetos e atividades desenvolvidos durante o programa de **Formação Continuada da Ada Tech em parceria com o CaixaVerso**.

---

## 👥 Grupo
* **Daniel André Knuth**
* **Eduardo Constantino de Oliveira**
* **Wesley de Sousa Pereira**

---

## 📂 Projetos no Repositório

O repositório está organizado em três projetos principais, cada um focado em um módulo e tecnologia do programa de formação:

### 1. 🏦 Sistema Bancário (FutureBank)
*Localizado na pasta: `[Sistema Bancario](./Sistema%20Bancario)`*

* **Objetivo:** Primeira entrega do projeto focada no módulo de **JavaScript com manipulação de DOM**.
* **Descrição:** Consiste em um painel administrativo interno completo para o banco fictício *FutureBank*. A aplicação simula o fluxo real de gerenciamento de um banco digital e se conecta a uma API local simulada.
* **Tecnologias:** HTML5, CSS3 (com Bootstrap 5 para agilidade e responsividade), Vanilla JavaScript (ES6+) e um banco de dados mockado via `db.json`.
* **Funcionalidades:**
  * **Gestão de Clientes:** Cadastro e listagem de usuários com validação estruturada de e-mail e CPF.
  * **Gestão de Contas:** Abertura de contas bancárias (Corrente ou Poupança) vinculadas a um cliente cadastrado, com controle de status da conta (Ativa/Inativa).
  * **Transações:** Módulo de depósito e saque com atualização em tempo real do saldo do cliente e registro histórico das transações.

---

### 2. ⚔️ RPG (Simulador de Combate POO)
*Localizado na pasta: `[RPG](./RPG)`*

* **Objetivo:** Segunda entrega de projeto, voltada ao módulo de **Programação Orientada a Objetos (POO)**.
* **Descrição:** Uma simulação robusta de um ecossistema de personagens e mecânicas de combate de RPG em ambiente Node.js. O projeto foi projetado para exemplificar e consolidar os pilares fundamentais de POO em JavaScript moderno.
* **Tecnologias:** Node.js, JavaScript (ES Modules).
* **Conceitos de POO Aplicados:**
  * **Encapsulamento:** Proteção do estado interno dos personagens através de atributos privados (como `#nome`, `#vida`, `#forca`) e controle seguro de leitura e escrita via *getters* e *setters* validados.
  * **Herança:** Criação de uma classe abstrata/base `Personagem` que é estendida de forma polimórfica pelas subclasses de heróis: `Guerreiro`, `Mago` e `Arqueiro`.
  * **Polimorfismo:** Sobrescrita do método `atacar()` em cada subclasse para implementar mecânicas exclusivas (como gastos de mana para magias do Mago ou flechas limitadas para o Arqueiro).
  * **Tratamento de Erros:** Robustez contra entradas inválidas e controle fino de exceções (`try/catch`) nas mecânicas de jogo.

---

### 3. 📊 Dashboard Financeiro
*Localizado na pasta: `[dashboard-financeiro](./dashboard-financeiro)`*

* **Objetivo:** Terceiro projeto desenvolvido, focado no ecossistema **Angular**.
* **Descrição:** Um painel de controle de finanças pessoais completo e moderno, projetado para permitir que o usuário tenha controle total do seu fluxo de caixa, investimentos e progressos em relação às suas metas financeiras.
* **Tecnologias:** Angular (v21.1.1), TypeScript, Vitest (para testes de unidade automatizados), HTML5 e CSS/SCSS com design responsivo.
* **Módulos & Páginas Principais:**
  * **Dashboard:** Tela inicial central com visão analítica e consolidação geral de saldos, lançamentos, rentabilidade e progresso de metas.
  * **Lançamentos:** Gestão completa de entradas (receitas) e saídas (despesas) de dinheiro.
  * **Investimentos:** Gerenciador de portfólio para acompanhar a evolução patrimonial e rendimento dos ativos.
  * **Metas:** Planejamento e monitoramento de metas financeiras pessoais a curto, médio ou longo prazo.

---

## 🛠️ Como Executar os Projetos

### Para o Sistema Bancário (FutureBank):
1. Navegue até a pasta `Sistema Bancario`.
2. Caso utilize uma API simulada (JSON Server), certifique-se de subir o banco mockado no arquivo `db.json`.
3. Abra o arquivo `index.html` diretamente em seu navegador ou utilize extensões como o *Live Server* no VS Code.

### Para o RPG:
1. Certifique-se de possuir o [Node.js](https://nodejs.org/) instalado.
2. Navegue até a pasta `RPG` no terminal.
3. Instale as dependências com `npm install` (se necessário) e execute o simulador com:
   ```bash
   node index.js
   ```

### Para o Dashboard Financeiro:
1. Certifique-se de possuir o [Node.js](https://nodejs.org/) e o Angular CLI instalados.
2. Navegue até a pasta `dashboard-financeiro` no terminal.
3. Instale as dependências:
   ```bash
   npm install
   ```
4. Suba o servidor de desenvolvimento:
   ```bash
   npm run dev  # ou ng serve
   ```
5. Acesse `http://localhost:4200/` em seu navegador.

