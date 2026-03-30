// ==================================================
// ARQUIVO PRINCIPAL
// Controla eventos, dados e atualização da tela.
// ==================================================

let clientes = [];
let contas = [];
let transacoes = [];
let clienteEmEdicao = null;

document.addEventListener("DOMContentLoaded", iniciarSistema);

function iniciarSistema() {
    // 1. Busca os elementos do HTML.
    const formCliente = document.getElementById("form-cliente");
    const formConta = document.getElementById("form-conta");
    const formTransacao = document.getElementById("form-transacao");
    const tabelaClientes = document.getElementById("tabela-clientes");
    const tabelaContas = document.getElementById("tabela-contas");

    // 2. Carrega os dados salvos.
    carregarDados();
    atualizarTela();

    // 3. Eventos dos formulários.
    formCliente.addEventListener("submit", salvarCliente);
    formConta.addEventListener("submit", criarConta);
    formTransacao.addEventListener("submit", fazerTransacao);

    // 4. Eventos dos botões das tabelas.
    tabelaClientes.addEventListener("click", clicarTabelaClientes);
    tabelaContas.addEventListener("click", clicarTabelaContas);
}

// Busca os dados do localStorage.
function carregarDados() {
    clientes = AppAPI.listarClientes();
    contas = AppAPI.listarContas();
    transacoes = AppAPI.listarTransacoes();
}

// Atualiza tudo o que aparece na tela.
function atualizarTela() {
    AppUI.renderClientes(clientes);
    AppUI.renderContas(contas, clientes);
    AppUI.renderHistorico(transacoes, contas, clientes);
    AppUI.preencherSelectClientes(clientes);
    AppUI.preencherSelectContas(contas, clientes);
}

// Salva um novo cliente ou atualiza um já existente.
function salvarCliente(evento) {
    evento.preventDefault();

    const nome = document.getElementById("cli-nome").value;
    const cpf = document.getElementById("cli-cpf").value;
    const email = document.getElementById("cli-email").value;
    const botao = document.querySelector("#form-cliente button");

    const resultado = AppValidacao.validarCliente({ nome, cpf, email }, clientes, clienteEmEdicao);

    if (!resultado.ok) {
        AppUI.mostrarMensagem(resultado.mensagem, "warning");
        return;
    }

    const cliente = resultado.dados;

    if (clienteEmEdicao) {
        cliente.id = clienteEmEdicao;
        AppAPI.salvarCliente(cliente);
        AppUI.mostrarMensagem("Cliente atualizado com sucesso.");
    } else {
        AppAPI.salvarCliente(cliente);
        AppUI.mostrarMensagem("Cliente cadastrado com sucesso.");
    }

    document.getElementById("form-cliente").reset();
    clienteEmEdicao = null;
    botao.textContent = "Cadastrar";

    carregarDados();
    atualizarTela();
}

// Cria uma nova conta bancária.
function criarConta(evento) {
    evento.preventDefault();

    const novaConta = {
        numero: gerarNumeroConta(),
        clienteId: Number(document.getElementById("sel-cliente").value),
        tipo: document.getElementById("sel-tipo-conta").value,
        saldo: 0,
        status: "Ativa"
    };

    const resultado = AppValidacao.validarConta(novaConta);

    if (!resultado.ok) {
        AppUI.mostrarMensagem(resultado.mensagem, "warning");
        return;
    }

    AppAPI.salvarConta(novaConta);
    document.getElementById("form-conta").reset();

    carregarDados();
    atualizarTela();
    AppUI.mostrarMensagem("Conta criada com sucesso.");
}

// Faz um depósito ou saque.
function fazerTransacao(evento) {
    evento.preventDefault();

    const contaId = Number(document.getElementById("sel-conta-transacao").value);
    const tipo = document.getElementById("tipo-operacao").value;
    const valor = Number(document.getElementById("valor-transacao").value);

    const conta = contas.find(item => item.id === contaId);
    const resultado = AppValidacao.validarTransacao(tipo, valor, conta);

    if (!resultado.ok) {
        AppUI.mostrarMensagem(resultado.mensagem, "warning");
        return;
    }

    if (tipo === "Depósito") {
        conta.saldo += valor;
    } else {
        conta.saldo -= valor;
    }

    conta.saldo = Number(conta.saldo.toFixed(2));
    AppAPI.salvarConta(conta);

    AppAPI.salvarTransacao({
        contaId: conta.id,
        tipo: tipo,
        valor: valor,
        novoSaldo: conta.saldo,
        data: new Date().toISOString()
    });

    document.getElementById("form-transacao").reset();

    carregarDados();
    atualizarTela();
    AppUI.mostrarMensagem("Transação realizada com sucesso.");
}

// Trata os botões da tabela de clientes.
function clicarTabelaClientes(evento) {
    const acao = evento.target.dataset.action;
    const id = Number(evento.target.dataset.id);

    if (!acao) {
        return;
    }

    const cliente = clientes.find(item => item.id === id);

    if (acao === "editar") {
        document.getElementById("cli-nome").value = cliente.nome;
        document.getElementById("cli-cpf").value = cliente.cpf;
        document.getElementById("cli-email").value = cliente.email;
        document.querySelector("#form-cliente button").textContent = "Salvar";

        clienteEmEdicao = id;
        return;
    }

    if (acao === "excluir") {
        const possuiConta = contas.some(conta => conta.clienteId === id);

        if (possuiConta) {
            AppUI.mostrarMensagem("Não é possível excluir cliente com conta cadastrada.", "warning");
            return;
        }

        AppAPI.excluirCliente(id);
        carregarDados();
        atualizarTela();
        AppUI.mostrarMensagem("Cliente excluído com sucesso.");
    }
}

// Trata o botão de alterar status da conta.
function clicarTabelaContas(evento) {
    const acao = evento.target.dataset.action;
    const id = Number(evento.target.dataset.id);

    if (acao !== "status-conta") {
        return;
    }

    const conta = contas.find(item => item.id === id);

    if (conta.status === "Ativa" && conta.saldo > 0) {
        AppUI.mostrarMensagem("Para encerrar a conta, o saldo deve ser zero.", "warning");
        return;
    }

    conta.status = conta.status === "Ativa" ? "Encerrada" : "Ativa";
    AppAPI.salvarConta(conta);

    carregarDados();
    atualizarTela();
    AppUI.mostrarMensagem("Status da conta atualizado.");
}

// Gera o próximo número da conta.
function gerarNumeroConta() {
    if (contas.length === 0) {
        return 1001;
    }

    const ultimoNumero = Math.max(...contas.map(conta => conta.numero));
    return ultimoNumero + 1;
}
