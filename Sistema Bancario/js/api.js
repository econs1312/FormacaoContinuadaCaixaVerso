((global) => {
    const BASE_URL = "http://localhost:3000";
    const STORAGE_KEY = "futurebank-db";
    const INITIAL_DB = {
        clientes: [
            {
                id: 1,
                nome: "João Silva",
                cpf: "12345678900",
                email: "joao@email.com"
            }
        ],
        contas: [
            {
                id: 1,
                numero: 1001,
                clienteId: 1,
                tipo: "Corrente",
                saldo: 5000,
                status: "Ativa"
            }
        ],
        transacoes: [
            {
                id: 1,
                contaId: 1,
                tipo: "Depósito",
                valor: 1000,
                novoSaldo: 5000,
                data: "2026-03-16"
            }
        ]
    };

    let modoLocal = false;

    const clone = (valor) => JSON.parse(JSON.stringify(valor));

    function obterBancoLocal() {
        const conteudo = global.localStorage.getItem(STORAGE_KEY);

        if (!conteudo) {
            global.localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DB));
            return clone(INITIAL_DB);
        }

        try {
            const banco = JSON.parse(conteudo);
            return {
                clientes: Array.isArray(banco.clientes) ? banco.clientes : clone(INITIAL_DB.clientes),
                contas: Array.isArray(banco.contas) ? banco.contas : clone(INITIAL_DB.contas),
                transacoes: Array.isArray(banco.transacoes) ? banco.transacoes : clone(INITIAL_DB.transacoes)
            };
        } catch (error) {
            global.localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DB));
            return clone(INITIAL_DB);
        }
    }

    function salvarBancoLocal(banco) {
        global.localStorage.setItem(STORAGE_KEY, JSON.stringify(banco));
        return clone(banco);
    }

    function gerarProximoId(lista) {
        return lista.length ? Math.max(...lista.map((item) => Number(item.id) || 0)) + 1 : 1;
    }

    function atualizarRegistroLocal(banco, chave, id, dados) {
        const indice = banco[chave].findIndex((item) => Number(item.id) === Number(id));

        if (indice === -1) {
            throw new Error(`Registro não encontrado em ${chave}: ${id}`);
        }

        banco[chave][indice] = {
            ...banco[chave][indice],
            ...clone(dados),
            id: Number(id)
        };

        salvarBancoLocal(banco);
        return clone(banco[chave][indice]);
    }

    function removerRegistroLocal(banco, chave, id) {
        banco[chave] = banco[chave].filter((item) => Number(item.id) !== Number(id));
        salvarBancoLocal(banco);
        return true;
    }

    async function requisicao(caminho, opcoes = {}) {
        const resposta = await fetch(`${BASE_URL}${caminho}`, {
            headers: {
                "Content-Type": "application/json",
                ...(opcoes.headers || {})
            },
            ...opcoes
        });

        if (!resposta.ok) {
            throw new Error(`Falha HTTP ${resposta.status}`);
        }

        if (resposta.status === 204) {
            return null;
        }

        return resposta.json();
    }

    async function executarComFallback(acaoRemota, acaoLocal) {
        try {
            return await acaoRemota();
        } catch (error) {
            modoLocal = true;
            console.warn("FutureBank: usando persistência local no navegador.", error.message);
            return acaoLocal(error);
        }
    }

    const AppAPI = {
        estaEmModoLocal() {
            return modoLocal;
        },

        async listarClientes() {
            return executarComFallback(
                () => requisicao("/clientes?_sort=nome&_order=asc"),
                () => obterBancoLocal().clientes
            );
        },

        async criarCliente(cliente) {
            return executarComFallback(
                () => requisicao("/clientes", {
                    method: "POST",
                    body: JSON.stringify(cliente)
                }),
                () => {
                    const banco = obterBancoLocal();
                    const novoCliente = { id: gerarProximoId(banco.clientes), ...cliente };
                    banco.clientes.push(novoCliente);
                    salvarBancoLocal(banco);
                    return clone(novoCliente);
                }
            );
        },

        async atualizarCliente(id, dados) {
            return executarComFallback(
                () => requisicao(`/clientes/${id}`, {
                    method: "PUT",
                    body: JSON.stringify({ ...dados, id: Number(id) })
                }),
                () => {
                    const banco = obterBancoLocal();
                    return atualizarRegistroLocal(banco, "clientes", id, dados);
                }
            );
        },

        async removerCliente(id) {
            return executarComFallback(
                () => requisicao(`/clientes/${id}`, { method: "DELETE" }),
                () => {
                    const banco = obterBancoLocal();
                    return removerRegistroLocal(banco, "clientes", id);
                }
            );
        },

        async listarContas() {
            return executarComFallback(
                () => requisicao("/contas?_sort=numero&_order=asc"),
                () => obterBancoLocal().contas
            );
        },

        async criarConta(conta) {
            return executarComFallback(
                () => requisicao("/contas", {
                    method: "POST",
                    body: JSON.stringify(conta)
                }),
                () => {
                    const banco = obterBancoLocal();
                    const novaConta = { id: gerarProximoId(banco.contas), ...conta };
                    banco.contas.push(novaConta);
                    salvarBancoLocal(banco);
                    return clone(novaConta);
                }
            );
        },

        async atualizarConta(id, dados) {
            return executarComFallback(
                () => requisicao(`/contas/${id}`, {
                    method: "PUT",
                    body: JSON.stringify({ ...dados, id: Number(id) })
                }),
                () => {
                    const banco = obterBancoLocal();
                    return atualizarRegistroLocal(banco, "contas", id, dados);
                }
            );
        },

        async removerConta(id) {
            return executarComFallback(
                () => requisicao(`/contas/${id}`, { method: "DELETE" }),
                () => {
                    const banco = obterBancoLocal();
                    return removerRegistroLocal(banco, "contas", id);
                }
            );
        },

        async listarTransacoes() {
            return executarComFallback(
                () => requisicao("/transacoes?_sort=data&_order=desc"),
                () => obterBancoLocal().transacoes
            );
        },

        async criarTransacao(transacao) {
            return executarComFallback(
                () => requisicao("/transacoes", {
                    method: "POST",
                    body: JSON.stringify(transacao)
                }),
                () => {
                    const banco = obterBancoLocal();
                    const novaTransacao = { id: gerarProximoId(banco.transacoes), ...transacao };
                    banco.transacoes.push(novaTransacao);
                    salvarBancoLocal(banco);
                    return clone(novaTransacao);
                }
            );
        }
    };

    global.AppAPI = AppAPI;
})(typeof window !== "undefined" ? window : globalThis);
