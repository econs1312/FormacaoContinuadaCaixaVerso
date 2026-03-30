// ==================================================
// FUNÇÕES DE INTERFACE
// Este arquivo monta os dados na tela.
// ==================================================

const AppUI = {
    // Formata números como moeda brasileira.
    formatarMoeda(valor) {
        return Number(valor).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    },

    // Formata o CPF no padrão 000.000.000-00.
    formatarCPF(cpf) {
        const numeros = String(cpf).replace(/\D/g, "");

        if (numeros.length !== 11) {
            return cpf;
        }

        return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6, 9)}-${numeros.slice(9, 11)}`;
    },

    // Formata a data para o padrão brasileiro.
    formatarData(data) {
        return new Date(data).toLocaleDateString("pt-BR");
    },

    // Exibe uma mensagem simples acima do conteúdo.
    mostrarMensagem(texto, tipo = "success") {
        const caixa = document.getElementById("mensagem-sistema");

        if (!caixa) {
            return;
        }

        caixa.innerHTML = `<div class="alert alert-${tipo}">${texto}</div>`;

        setTimeout(() => {
            caixa.innerHTML = "";
        }, 3000);
    },

    // Preenche a tabela de clientes.
    renderClientes(clientes) {
        const tabela = document.getElementById("tabela-clientes");

        if (clientes.length === 0) {
            tabela.innerHTML = '<tr><td colspan="4" class="text-center">Nenhum cliente cadastrado.</td></tr>';
            return;
        }

        let html = "";

        clientes.forEach(cliente => {
            html += `
                <tr>
                    <td>${cliente.nome}</td>
                    <td>${this.formatarCPF(cliente.cpf)}</td>
                    <td>${cliente.email}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" data-action="editar" data-id="${cliente.id}">Editar</button>
                        <button class="btn btn-sm btn-outline-danger" data-action="excluir" data-id="${cliente.id}">Excluir</button>
                    </td>
                </tr>
            `;
        });

        tabela.innerHTML = html;
    },

    // Preenche a tabela de contas.
    renderContas(contas, clientes) {
        const tabela = document.getElementById("tabela-contas");

        if (contas.length === 0) {
            tabela.innerHTML = '<tr><td colspan="6" class="text-center">Nenhuma conta cadastrada.</td></tr>';
            return;
        }

        let html = "";

        contas.forEach(conta => {
            const cliente = clientes.find(item => item.id === conta.clienteId);
            const textoBotao = conta.status === "Ativa" ? "Encerrar" : "Reativar";
            const classeStatus = conta.status === "Ativa" ? "status-ativa" : "status-encerrada";

            html += `
                <tr>
                    <td>${conta.numero}</td>
                    <td>${cliente ? cliente.nome : "Não encontrado"}</td>
                    <td>${conta.tipo}</td>
                    <td>${this.formatarMoeda(conta.saldo)}</td>
                    <td><span class="${classeStatus}">${conta.status}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-secondary" data-action="status-conta" data-id="${conta.id}">${textoBotao}</button>
                    </td>
                </tr>
            `;
        });

        tabela.innerHTML = html;
    },

    // Preenche a tabela do histórico de transações.
    renderHistorico(transacoes, contas, clientes) {
        const tabela = document.getElementById("tabela-historico");

        if (transacoes.length === 0) {
            tabela.innerHTML = '<tr><td colspan="5" class="text-center">Nenhuma transação registrada.</td></tr>';
            return;
        }

        let html = "";
        const listaInvertida = [...transacoes].reverse();

        listaInvertida.forEach(transacao => {
            const conta = contas.find(item => item.id === transacao.contaId);
            const cliente = conta ? clientes.find(item => item.id === conta.clienteId) : null;
            const classeValor = transacao.tipo === "Depósito" ? "valor-entrada" : "valor-saida";

            html += `
                <tr>
                    <td>${this.formatarData(transacao.data)}</td>
                    <td>${conta ? conta.numero : "-"} - ${cliente ? cliente.nome : "Cliente"}</td>
                    <td>${transacao.tipo}</td>
                    <td class="${classeValor}">${this.formatarMoeda(transacao.valor)}</td>
                    <td>${this.formatarMoeda(transacao.novoSaldo)}</td>
                </tr>
            `;
        });

        tabela.innerHTML = html;
    },

    // Atualiza o select de clientes na aba de contas.
    preencherSelectClientes(clientes) {
        const select = document.getElementById("sel-cliente");
        let html = '<option value="">Selecione o cliente...</option>';

        clientes.forEach(cliente => {
            html += `<option value="${cliente.id}">${cliente.nome}</option>`;
        });

        select.innerHTML = html;
    },

    // Atualiza o select de contas na aba de transações.
    preencherSelectContas(contas, clientes) {
        const select = document.getElementById("sel-conta-transacao");
        let html = '<option value="">Selecione a conta...</option>';

        contas.forEach(conta => {
            if (conta.status === "Ativa") {
                const cliente = clientes.find(item => item.id === conta.clienteId);
                html += `<option value="${conta.id}">Conta ${conta.numero} - ${cliente ? cliente.nome : "Cliente"}</option>`;
            }
        });

        select.innerHTML = html;
    }
};
