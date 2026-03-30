// ==================================================
// API SIMPLES DO PROJETO
// Aqui usamos o localStorage para guardar os dados.
// ==================================================

const CHAVE_BANCO = "futurebank-dados";

const dadosIniciais = {
    clientes: [
        { id: 1, nome: "João Silva", cpf: "12345678900", email: "joao@email.com" }
    ],
    contas: [
        { id: 1, numero: 1001, clienteId: 1, tipo: "Corrente", saldo: 5000, status: "Ativa" }
    ],
    transacoes: [
        { id: 1, contaId: 1, tipo: "Depósito", valor: 1000, novoSaldo: 5000, data: "2026-03-16" }
    ]
};

// Lê os dados salvos no navegador.
function lerBanco() {
    const dados = localStorage.getItem(CHAVE_BANCO);

    if (!dados) {
        localStorage.setItem(CHAVE_BANCO, JSON.stringify(dadosIniciais));
        return JSON.parse(JSON.stringify(dadosIniciais));
    }

    return JSON.parse(dados);
}

// Salva novamente os dados no navegador.
function salvarBanco(banco) {
    localStorage.setItem(CHAVE_BANCO, JSON.stringify(banco));
}

// Gera o próximo id de uma lista.
function proximoId(lista) {
    if (lista.length === 0) {
        return 1;
    }

    return Math.max(...lista.map(item => item.id)) + 1;
}

const AppAPI = {
    // CLIENTES
    listarClientes() {
        return lerBanco().clientes;
    },

    salvarCliente(cliente) {
        const banco = lerBanco();

        if (cliente.id) {
            const index = banco.clientes.findIndex(item => item.id === cliente.id);
            banco.clientes[index] = cliente;
        } else {
            cliente.id = proximoId(banco.clientes);
            banco.clientes.push(cliente);
        }

        salvarBanco(banco);
        return cliente;
    },

    excluirCliente(id) {
        const banco = lerBanco();
        banco.clientes = banco.clientes.filter(cliente => cliente.id !== id);
        salvarBanco(banco);
    },

    // CONTAS
    listarContas() {
        return lerBanco().contas;
    },

    salvarConta(conta) {
        const banco = lerBanco();

        if (conta.id) {
            const index = banco.contas.findIndex(item => item.id === conta.id);
            banco.contas[index] = conta;
        } else {
            conta.id = proximoId(banco.contas);
            banco.contas.push(conta);
        }

        salvarBanco(banco);
        return conta;
    },

    // TRANSAÇÕES
    listarTransacoes() {
        return lerBanco().transacoes;
    },

    salvarTransacao(transacao) {
        const banco = lerBanco();
        transacao.id = proximoId(banco.transacoes);
        banco.transacoes.push(transacao);
        salvarBanco(banco);
        return transacao;
    }
};
