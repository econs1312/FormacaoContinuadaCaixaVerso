((global) => {
    const formatadorMoeda = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

    function escaparHtml(texto = "") {
        const mapa = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return String(texto).replace(/[&<>"']/g, (caractere) => mapa[caractere]);
    }

    function formatarMoeda(valor) {
        return formatadorMoeda.format(Number(valor) || 0);
    }

    function formatarCPF(cpf = "") {
        const cpfLimpo = String(cpf).replace(/\D/g, "").slice(0, 11);
        return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }

    function formatarData(data) {
        if (!data) {
            return "-";
        }

        const dataConvertida = new Date(data);
        if (Number.isNaN(dataConvertida.getTime())) {
            return escaparHtml(data);
        }

        return dataConvertida.toLocaleDateString("pt-BR");
    }

    function obterContainerAlertas() {
        let container = document.getElementById("app-alertas");

        if (!container) {
            container = document.createElement("div");
            container.id = "app-alertas";
            container.className = "mb-3";
            const containerPrincipal = document.querySelector(".container");
            if (containerPrincipal) {
                containerPrincipal.prepend(container);
            }
        }

        return container;
    }

    function mostrarMensagem(mensagem, tipo = "success", tempoMs = 4000) {
        const container = obterContainerAlertas();
        if (!container) {
            return;
        }

        const alerta = document.createElement("div");
        alerta.className = `alert alert-${tipo} alert-dismissible fade show`;
        alerta.role = "alert";
        alerta.innerHTML = `
            <span>${escaparHtml(mensagem)}</span>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
        `;

        container.appendChild(alerta);

        global.setTimeout(() => {
            alerta.remove();
        }, tempoMs);
    }

    function renderClientes(clientes = []) {
        const tbody = document.getElementById("tabela-clientes");
        if (!tbody) {
            return;
        }

        if (!clientes.length) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-4">Nenhum cliente cadastrado.</td></tr>';
            return;
        }

        tbody.innerHTML = clientes.map((cliente) => `
            <tr>
                <td>${escaparHtml(cliente.nome)}</td>
                <td>${formatarCPF(cliente.cpf)}</td>
                <td>${escaparHtml(cliente.email)}</td>
                <td>
                    <button type="button" class="btn btn-sm btn-outline-primary" data-action="editar-cliente" data-id="${cliente.id}">Editar</button>
                    <button type="button" class="btn btn-sm btn-outline-danger" data-action="excluir-cliente" data-id="${cliente.id}">Excluir</button>
                </td>
            </tr>
        `).join("");
    }

    function renderContas(contas = [], clientes = []) {
        const tbody = document.getElementById("tabela-contas");
        if (!tbody) {
            return;
        }

        if (!contas.length) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">Nenhuma conta cadastrada.</td></tr>';
            return;
        }

        const mapaClientes = new Map(clientes.map((cliente) => [Number(cliente.id), cliente]));

        tbody.innerHTML = contas.map((conta) => {
            const cliente = mapaClientes.get(Number(conta.clienteId));
            const statusClass = conta.status === "Ativa" ? "status-ativa" : "status-encerrada";
            const textoBotao = conta.status === "Ativa" ? "Encerrar" : "Reativar";
            const classeBotao = conta.status === "Ativa" ? "btn-outline-danger" : "btn-outline-success";

            return `
                <tr>
                    <td>${escaparHtml(conta.numero)}</td>
                    <td>${escaparHtml(cliente ? cliente.nome : "Cliente não encontrado")}</td>
                    <td>${escaparHtml(conta.tipo)}</td>
                    <td>${formatarMoeda(conta.saldo)}</td>
                    <td><span class="${statusClass}">${escaparHtml(conta.status)}</span></td>
                    <td>
                        <button type="button" class="btn btn-sm ${classeBotao}" data-action="alternar-status-conta" data-id="${conta.id}">${textoBotao}</button>
                    </td>
                </tr>
            `;
        }).join("");
    }

    function renderHistorico(transacoes = [], contas = [], clientes = []) {
        const tbody = document.getElementById("tabela-historico");
        if (!tbody) {
            return;
        }

        if (!transacoes.length) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">Nenhuma transação registrada.</td></tr>';
            return;
        }

        const mapaContas = new Map(contas.map((conta) => [Number(conta.id), conta]));
        const mapaClientes = new Map(clientes.map((cliente) => [Number(cliente.id), cliente]));

        tbody.innerHTML = transacoes.map((transacao) => {
            const conta = mapaContas.get(Number(transacao.contaId));
            const cliente = conta ? mapaClientes.get(Number(conta.clienteId)) : null;
            const classeValor = transacao.tipo === "Saque" ? "valor-negativo" : "valor-positivo";
            const prefixo = transacao.tipo === "Saque" ? "-" : "+";
            const descricaoConta = conta
                ? `#${escaparHtml(conta.numero)} - ${escaparHtml(cliente ? cliente.nome : "Cliente")}`
                : `Conta #${escaparHtml(transacao.contaId)}`;

            return `
                <tr>
                    <td>${formatarData(transacao.data)}</td>
                    <td>${descricaoConta}</td>
                    <td>${escaparHtml(transacao.tipo)}</td>
                    <td class="${classeValor}">${prefixo} ${formatarMoeda(transacao.valor)}</td>
                    <td>${formatarMoeda(transacao.novoSaldo)}</td>
                </tr>
            `;
        }).join("");
    }

    function preencherSelectClientes(clientes = []) {
        const select = document.getElementById("sel-cliente");
        if (!select) {
            return;
        }

        const valorAtual = select.value;
        select.innerHTML = `
            <option value="">Selecione o Cliente...</option>
            ${clientes.map((cliente) => `<option value="${cliente.id}">${escaparHtml(cliente.nome)} - CPF ${formatarCPF(cliente.cpf)}</option>`).join("")}
        `;

        if ([...select.options].some((opcao) => opcao.value === valorAtual)) {
            select.value = valorAtual;
        }
    }

    function preencherSelectContas(contas = [], clientes = []) {
        const select = document.getElementById("sel-conta-transacao");
        if (!select) {
            return;
        }

        const valorAtual = select.value;
        const mapaClientes = new Map(clientes.map((cliente) => [Number(cliente.id), cliente]));
        const contasAtivas = contas.filter((conta) => conta.status === "Ativa");

        if (!contasAtivas.length) {
            select.innerHTML = '<option value="">Nenhuma conta ativa disponível</option>';
            return;
        }

        select.innerHTML = `
            <option value="">Selecione a conta...</option>
            ${contasAtivas.map((conta) => {
                const cliente = mapaClientes.get(Number(conta.clienteId));
                const nomeCliente = cliente ? cliente.nome : "Cliente";
                return `<option value="${conta.id}">Conta ${conta.numero} - ${escaparHtml(nomeCliente)} (${escaparHtml(conta.tipo)})</option>`;
            }).join("")}
        `;

        if ([...select.options].some((opcao) => opcao.value === valorAtual)) {
            select.value = valorAtual;
        }
    }

    global.AppUI = {
        formatarMoeda,
        formatarCPF,
        formatarData,
        mostrarMensagem,
        renderClientes,
        renderContas,
        renderHistorico,
        preencherSelectClientes,
        preencherSelectContas
    };
})(typeof window !== "undefined" ? window : globalThis);
