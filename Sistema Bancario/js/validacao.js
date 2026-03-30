((global) => {
    function limparCPF(cpf = "") {
        return String(cpf).replace(/\D/g, "");
    }

    function validarCPF(cpf = "") {
        const cpfLimpo = limparCPF(cpf);

        if (cpfLimpo.length !== 11 || /^(\d)\1{10}$/.test(cpfLimpo)) {
            return false;
        }

        let soma = 0;
        for (let i = 0; i < 9; i += 1) {
            soma += Number(cpfLimpo[i]) * (10 - i);
        }

        let resto = (soma * 10) % 11;
        if (resto === 10) {
            resto = 0;
        }

        if (resto !== Number(cpfLimpo[9])) {
            return false;
        }

        soma = 0;
        for (let i = 0; i < 10; i += 1) {
            soma += Number(cpfLimpo[i]) * (11 - i);
        }

        resto = (soma * 10) % 11;
        if (resto === 10) {
            resto = 0;
        }

        return resto === Number(cpfLimpo[10]);
    }

    function validarEmail(email = "") {
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(String(email).trim());
    }

    function validarValorMonetario(valor) {
        return Number.isFinite(Number(valor)) && Number(valor) > 0;
    }

    function validarCliente(cliente, clientesExistentes = [], idAtual = null) {
        const erros = [];
        const dadosNormalizados = {
            nome: String(cliente.nome || "").trim(),
            cpf: limparCPF(cliente.cpf),
            email: String(cliente.email || "").trim().toLowerCase()
        };

        if (dadosNormalizados.nome.length < 3) {
            erros.push("Informe um nome válido com pelo menos 3 caracteres.");
        }

        if (!validarCPF(dadosNormalizados.cpf)) {
            erros.push("CPF inválido. Verifique os números informados.");
        }

        if (!validarEmail(dadosNormalizados.email)) {
            erros.push("E-mail inválido. Informe um endereço válido.");
        }

        const cpfDuplicado = clientesExistentes.some(
            (item) => limparCPF(item.cpf) === dadosNormalizados.cpf && Number(item.id) !== Number(idAtual)
        );

        if (cpfDuplicado) {
            erros.push("Já existe um cliente cadastrado com este CPF.");
        }

        return {
            valido: erros.length === 0,
            erros,
            dadosNormalizados
        };
    }

    function validarConta(conta) {
        const erros = [];

        if (!Number(conta.clienteId)) {
            erros.push("Selecione um cliente para abrir a conta.");
        }

        if (!["Corrente", "Poupança"].includes(conta.tipo)) {
            erros.push("Selecione um tipo de conta válido.");
        }

        return {
            valido: erros.length === 0,
            erros
        };
    }

    function validarTransacao(transacao, conta) {
        const erros = [];
        const valor = Number(transacao.valor);

        if (!conta) {
            erros.push("Selecione uma conta válida.");
        }

        if (!["Depósito", "Saque"].includes(transacao.tipo)) {
            erros.push("Tipo de operação inválido.");
        }

        if (!validarValorMonetario(valor)) {
            erros.push("Informe um valor maior que zero.");
        }

        if (conta && conta.status !== "Ativa") {
            erros.push("A conta selecionada não está ativa.");
        }

        if (conta && transacao.tipo === "Saque" && valor > Number(conta.saldo)) {
            erros.push("Saldo insuficiente para realizar o saque.");
        }

        return {
            valido: erros.length === 0,
            erros,
            valorNormalizado: Number(valor.toFixed(2))
        };
    }

    global.AppValidacao = {
        limparCPF,
        validarCPF,
        validarEmail,
        validarValorMonetario,
        validarCliente,
        validarConta,
        validarTransacao
    };
})(typeof window !== "undefined" ? window : globalThis);
