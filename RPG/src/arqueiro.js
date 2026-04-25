import { Personagem } from './Personagem.js';

export class Arqueiro extends Personagem {
    #flechas;
    #chanceCritico;

    constructor(nome, vidaMaxima, forca, flechas = 20) {
        super(nome, vidaMaxima, forca);
        this.#flechas = flechas;
        this.#chanceCritico = 0.25;
    }

    get flechas() { return this.#flechas; }
    get chanceCritico() { return this.#chanceCritico; }

    recarregarFlechas(quantidade) {
        this.#flechas += quantidade;
        console.log(`${this.nome} recarregou ${quantidade} flechas. Total: ${this.#flechas}.`);
    }

    atacar(alvo) {
        if (this.#flechas <= 0) {
            throw new Error("Sem flechas para atacar.");
        }
        this.#flechas -= 1;
        
        let dano = this.forca;
        let foiCritico = false;

        if (Math.random() < this.#chanceCritico) {
            dano = this.forca * 2;
            foiCritico = true;
        }

        console.log(`${this.nome} dispara contra ${alvo.nome} causando ${dano} de dano! ${foiCritico ? '(CRÍTICO!)' : ''}`);
        alvo.receberDano(dano);
    }
}