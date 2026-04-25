import { Personagem } from './Personagem.js';

export class Guerreiro extends Personagem {
    #armadura;

    constructor(nome, vidaMaxima, forca, armadura = 10) {
        super(nome, vidaMaxima, forca);
        this.#armadura = armadura;
    }

    get armadura() { return this.#armadura; }

    defesa() {
        this.#armadura *= 2;
        console.log(`${this.nome} aumentou sua armadura para ${this.#armadura}!`);
    }

    atacar(alvo) {
        const dano = this.forca * 1.2;
        console.log(`${this.nome} ataca ${alvo.nome} causando ${dano} de dano físico bruto!`);
        alvo.receberDano(dano);
    }

    receberDano(dano) {
        const danoFinal = Math.max(0, dano - this.#armadura);
        super.receberDano(danoFinal);
        console.log(`${this.nome} recebeu ${danoFinal} de dano (mitigado pela armadura).`);
    }
}