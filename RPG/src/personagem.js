export class Personagem {
    #nome;
    #vida;
    #vidaMaxima;
    #nivel;
    #forca;

    constructor(nome, vidaMaxima, forca) {
        this.nome = nome; // Chama o setter para validação
        this.#vidaMaxima = vidaMaxima;
        this.#vida = vidaMaxima;
        this.#forca = forca;
        this.#nivel = 1;
    }

    get nome() { return this.#nome; }
    
    set nome(novoNome) {
        if (!novoNome || novoNome.trim() === "") {
            throw new Error("O nome não pode ser vazio.");
        }
        this.#nome = novoNome.trim();
    }

    get vida() { return this.#vida; }
    get vidaMaxima() { return this.#vidaMaxima; }
    get nivel() { return this.#nivel; }
    get forca() { return this.#forca; }
    get estaVivo() { return this.#vida > 0; }

    atacar(alvo) {
        const dano = this.#forca;
        alvo.receberDano(dano);
    }

    receberDano(dano) {
        this.#vida -= dano;
        if (this.#vida < 0) {
            this.#vida = 0;
        }
    }

    curar(quantidade) {
        this.#vida += quantidade;
        if (this.#vida > this.#vidaMaxima) {
            this.#vida = this.#vidaMaxima;
        }
    }

    subirNivel() {
        this.#nivel += 1;
        this.#vidaMaxima += 10; // Exemplo de incremento proporcional
        this.#forca += 2;
        this.#vida = this.#vidaMaxima;
    }

    exibirStatus() {
        console.log(`[${this.constructor.name}] ${this.#nome} - Nível: ${this.#nivel} | Vida: ${this.#vida}/${this.#vidaMaxima} | Força: ${this.#forca}`);
    }
}