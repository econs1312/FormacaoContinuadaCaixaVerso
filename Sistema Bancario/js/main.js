((global) => {
    if (typeof document === "undefined") {
        return;
    }

    const state = {
        clientes: [],
        contas: [],
        transacoes: [],
        clienteEmEdicaoId: null
    };

    const refs = {};

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", inicializar);
    } else {
        inicializar();
    }

    async function inicializar() {
        if (!global.AppAPI || !global.AppUI || !global.AppValidacao) {
            console.error("Dependências da aplicação não foram carregadas corretamente.");
            return;
        }

        mapearElementos();
        registrarEventos();
        await carregarDados();

        if (global.AppAPI.estaEmModoLocal()) {
            global.AppUI.mostrarMensagem(
                "Servidor de API indisponível. O sistema está funcionando com armazenamento local do navegador.",
                "warning",
                6000
            );
        }
    }

    function mapearElementos() {
        refs.formCliente = document.getElementById("form-cliente");
        refs.cliNome = document.getElementById("cli-nome");
        refs.cliCpf = document.getElementById("cli-cpf");
        refs.cliEmail = document.getElementById("cli-email");
        refs.btnSubmitCliente = refs.formCliente?.querySelector('button[type="submit"]');

        refs.formConta = document.getElementById("form-conta");
        refs.selCliente = document.getElementById("sel-cliente");
        refs.selTipoConta = document.getElementById("sel-tipo-conta");

        refs.formTransacao = document.getElementById("form-transacao");
        refs.selContaTransacao = document.getElementById("sel-conta-transacao");
        refs.tipoOperacao = document.getElementById("tipo-operacao");
        refs.valorTransacao = document.getElementById("valor-transacao");

        refs.tabelaClientes = document.getElementById("tabela-clientes");
        refs.tabelaContas = document.getElementById("tabela-contas");
    }

    function registrarEventos() {
        refs.formCliente?.addEventListener("submit", aoEnviarCliente);
        refs.formConta?.addEventListener("submit", aoEnviarConta);
        refs.formTransacao?.addEventListener("submit", aoEnviarTransacao);
        refs.tabelaClientes?.addEventListener("click", aoClicarTabelaClientes);
        refs.tabelaContas?.addEventListener("click", aoClicarTabelaContas);
    }

    async function carregarDados() {
        try {
            const [clientes, contas, transacoes] = await Promise.all([
                global.AppAPI.listarClientes(),
                global.AppAPI.listarContas(),
                global.AppAPI.listarTransacoes()
            ]);

            state.clientes = Array.isArray(clientes) ? clientes : [];
            state.contas = Array.isArray(contas) ? contas : [];
            state.transacoes = Array.isArray(transacoes) ? transacoes : [];

            renderizarTudo();
        } catch (error) {
            console.error(error);
            global.AppUI.mostrarMensagem("Não foi possível carregar os dados do sistema.", "danger");
        }
    }

    function renderizarTudo() {
        const clientesOrdenados = [...state.clientes].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
        const contasOrdenadas = [...state.contas].sort((a, b) => Number(a.numero) - Number(b.numero));
        const transacoesOrdenadas = [...state.transacoes].sort((a, b) => {
            const dataA = new Date(a.data).getTime() || 0;
            const dataB = new Date(b.data).getTime() || 0;
            return dataB - dataA || Number(b.id) - Number(a.id);
        });

        global.AppUI.renderClientes(clientesOrdenados);
        global.AppUI.renderContas(contasOrdenadas, clientesOrdenados);
        global.AppUI.renderHistorico(transacoesOrdenadas, contasOrdenadas, clientesOrdenados);
        global.AppUI.preencherSelectClientes(clientesOrdenados);
        global.AppUI.preencherSelectContas(contasOrdenadas, clientesOrdenados);
    }

    async function aoEnviarCliente(evento) {
        evento.preventDefault();

        const validacao = global.AppValidacao.validarCliente(
            {
                nome: refs.cliNome?.value,
                cpf: refs.cliCpf?.value,
                email: refs.cliEmail?.value
            },
            state.clientes,
            state.clienteEmEdicaoId
        );

        if (!validacao.valido) {
            global.AppUI.mostrarMensagem(validacao.erros[0], "warning");
            return;
        }

        try {
            if (state.clienteEmEdicaoId) {
                const clienteAtualizado = await global.AppAPI.atualizarCliente(
                    state.clienteEmEdicaoId,
                    validacao.dadosNormalizados
                );

                state.clientes = state.clientes.map((cliente) =>
                    Number(cliente.id) === Number(state.clienteEmEdicaoId) ? clienteAtualizado : cliente
                );

                global.AppUI.mostrarMensagem("Cliente atualizado com sucesso.");
            } else {
                const novoCliente = await global.AppAPI.criarCliente(validacao.dadosNormalizados);
                state.clientes.push(novoCliente);
                global.AppUI.mostrarMensagem("Cliente cadastrado com sucesso.");
            }

            resetarFormularioCliente();
            renderizarTudo();
        } catch (error) {
            console.error(error);
            global.AppUI.mostrarMensagem("Não foi possível salvar o cliente.", "danger");
        }
    }

    async function aoEnviarConta(evento) {
        evento.preventDefault();

        const dadosConta = {
            clienteId: Number(refs.selCliente?.value),
            tipo: refs.selTipoConta?.value,
            numero: gerarNumeroConta(),
            saldo: 0,
            status: "Ativa"
        };

        const validacao = global.AppValidacao.validarConta(dadosConta);
        if (!validacao.valido) {
            global.AppUI.mostrarMensagem(validacao.erros[0], "warning");
            return;
        }

        try {
            const novaConta = await global.AppAPI.criarConta(dadosConta);
            state.contas.push(novaConta);
            refs.formConta?.reset();
            renderizarTudo();
            global.AppUI.mostrarMensagem("Conta criada com sucesso.");
        } catch (error) {
            console.error(error);
            global.AppUI.mostrarMensagem("Não foi possível criar a conta.", "danger");
        }
    }

    async function aoEnviarTransacao(evento) {
        evento.preventDefault();

        const contaId = Number(refs.selContaTransacao?.value);
        const tipo = refs.tipoOperacao?.value;
        const valor = Number(refs.valorTransacao?.value);
        const conta = state.contas.find((item) => Number(item.id) === contaId);

        const validacao = global.AppValidacao.validarTransacao({ contaId, tipo, valor }, conta);
        if (!validacao.valido) {
            global.AppUI.mostrarMensagem(validacao.erros[0], "warning");
            return;
        }

        const novoSaldo = tipo === "Saque"
            ? Number((Number(conta.saldo) - validacao.valorNormalizado).toFixed(2))
            : Number((Number(conta.saldo) + validacao.valorNormalizado).toFixed(2));

        try {
            const contaAtualizada = await global.AppAPI.atualizarConta(conta.id, {
                ...conta,
                saldo: novoSaldo
            });

            const novaTransacao = await global.AppAPI.criarTransacao({
                contaId,
                tipo,
                valor: validacao.valorNormalizado,
                novoSaldo,
                data: new Date().toISOString()
            });

            state.contas = state.contas.map((item) => (Number(item.id) === Number(conta.id) ? contaAtualizada : item));
            state.transacoes.unshift(novaTransacao);

            refs.formTransacao?.reset();
            renderizarTudo();
            global.AppUI.mostrarMensagem(`Operação de ${tipo.toLowerCase()} realizada com sucesso.`);
        } catch (error) {
            console.error(error);
            global.AppUI.mostrarMensagem("Não foi possível concluir a transação.", "danger");
        }
    }

    async function aoClicarTabelaClientes(evento) {
        const botao = evento.target.closest("button[data-action]");
        if (!botao) {
            return;
        }

        const clienteId = Number(botao.dataset.id);
        const cliente = state.clientes.find((item) => Number(item.id) === clienteId);
        if (!cliente) {
            return;
        }

        if (botao.dataset.action === "editar-cliente") {
            state.clienteEmEdicaoId = cliente.id;
            refs.cliNome.value = cliente.nome;
            refs.cliCpf.value = cliente.cpf;
            refs.cliEmail.value = cliente.email;

            if (refs.btnSubmitCliente) {
                refs.btnSubmitCliente.textContent = "Salvar alteração";
            }

            refs.cliNome?.focus();
            global.AppUI.mostrarMensagem("Cliente carregado para edição.", "info");
            return;
        }

        if (botao.dataset.action === "excluir-cliente") {
            const possuiContaVinculada = state.contas.some((conta) => Number(conta.clienteId) === clienteId);

            if (possuiContaVinculada) {
                global.AppUI.mostrarMensagem("Não é possível excluir um cliente com contas vinculadas.", "warning");
                return;
            }

            const confirmado = global.confirm(`Deseja realmente excluir o cliente ${cliente.nome}?`);
            if (!confirmado) {
                return;
            }

            try {
                await global.AppAPI.removerCliente(clienteId);
                state.clientes = state.clientes.filter((item) => Number(item.id) !== clienteId);

                if (Number(state.clienteEmEdicaoId) === clienteId) {
                    resetarFormularioCliente();
                }

                renderizarTudo();
                global.AppUI.mostrarMensagem("Cliente removido com sucesso.");
            } catch (error) {
                console.error(error);
                global.AppUI.mostrarMensagem("Não foi possível excluir o cliente.", "danger");
            }
        }
    }

    async function aoClicarTabelaContas(evento) {
        const botao = evento.target.closest("button[data-action='alternar-status-conta']");
        if (!botao) {
            return;
        }

        const contaId = Number(botao.dataset.id);
        const conta = state.contas.find((item) => Number(item.id) === contaId);
        if (!conta) {
            return;
        }

        if (conta.status === "Ativa" && Number(conta.saldo) !== 0) {
            global.AppUI.mostrarMensagem("Para encerrar a conta, o saldo precisa estar zerado.", "warning");
            return;
        }

        const novoStatus = conta.status === "Ativa" ? "Encerrada" : "Ativa";

        try {
            const contaAtualizada = await global.AppAPI.atualizarConta(conta.id, {
                ...conta,
                status: novoStatus
            });

            state.contas = state.contas.map((item) => (Number(item.id) === contaId ? contaAtualizada : item));
            renderizarTudo();
            global.AppUI.mostrarMensagem(`Conta ${novoStatus.toLowerCase()} com sucesso.`);
        } catch (error) {
            console.error(error);
            global.AppUI.mostrarMensagem("Não foi possível atualizar o status da conta.", "danger");
        }
    }

    function resetarFormularioCliente() {
        refs.formCliente?.reset();
        state.clienteEmEdicaoId = null;

        if (refs.btnSubmitCliente) {
            refs.btnSubmitCliente.textContent = "Cadastrar";
        }
    }

    function gerarNumeroConta() {
        const numeros = state.contas.map((conta) => Number(conta.numero) || 1000);
        return (numeros.length ? Math.max(...numeros) : 1000) + 1;
    }
})(typeof window !== "undefined" ? window : globalThis);
