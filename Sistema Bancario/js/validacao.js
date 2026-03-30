// ==================================================
// VALIDAÇÕES DO FORMULÁRIO
// Regras simples para conferir os dados digitados.
// ==================================================

const AppValidacao = {
    // Remove pontos, traços e outros caracteres do CPF.
    limparCPF(cpf) {
        return String(cpf).replace(/\D/g, "");
    },

    // Validação simples do cliente.
    validarCliente(cliente, listaClientes, idEdicao) {
        const nome = cliente.nome.trim();
        const cpf = this.limparCPF(cliente.cpf);
        const email = cliente.email.trim().toLowerCase();

        if (nome.length < 3) {
            return { ok: false, mensagem: "Digite um nome válido." };
        }

        if (cpf.length !== 11) {
            return { ok: false, mensagem: "O CPF deve ter 11 números." };
        }

        if (!email.includes("@") || !email.includes(".")) {
            return { ok: false, mensagem: "Digite um e-mail válido." };
        }

        const cpfRepetido = listaClientes.some(clienteSalvo => {
            return clienteSalvo.cpf === cpf && clienteSalvo.id !== idEdicao;
        });

        if (cpfRepetido) {
            return { ok: false, mensagem: "Este CPF já está cadastrado." };
        }

        return {
            ok: true,
            dados: { nome, cpf, email }
        };
    },

    // Validação da nova conta.
    validarConta(conta) {
        if (!conta.clienteId) {
            return { ok: false, mensagem: "Selecione um cliente." };
        }

        if (!conta.tipo) {
            return { ok: false, mensagem: "Selecione o tipo da conta." };
        }

        return { ok: true };
    },

    // Validação de depósito e saque.
    validarTransacao(tipo, valor, conta) {
        if (!conta) {
            return { ok: false, mensagem: "Selecione uma conta válida." };
        }

        if (conta.status !== "Ativa") {
            return { ok: false, mensagem: "A conta precisa estar ativa." };
        }

        if (valor <= 0 || isNaN(valor)) {
            return { ok: false, mensagem: "Digite um valor maior que zero." };
        }

        if (tipo === "Saque" && valor > conta.saldo) {
            return { ok: false, mensagem: "Saldo insuficiente para saque." };
        }

        return { ok: true };
    }
};
