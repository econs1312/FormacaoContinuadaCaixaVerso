import { Personagem } from './Personagem.js';

export class Mago extends Personagem {
    #mana;
    #manaMaxima;

    constructor(nome, vidaMaxima, forca, manaMaxima = 50) {
        super(nome, vidaMaxima, forca);
        this.#manaMaxima = manaMaxima;
        this.#mana = manaMaxima;
    }

    get mana() { return this.#mana; }
    get manaMaxima() { return this.#manaMaxima; }

    lancarCura(alvo) {
        if (this.#mana < 15) {
            throw new Error("Mana insuficiente para curar.");
        }
        this.#mana -= 15;
        alvo.curar(20);
        console.log(`${this.nome} curou ${alvo.nome} em 20 pontos de vida.`);
    }

    meditar() {
        this.#mana += 20;
        if (this.#mana > this.#manaMaxima) {
            this.#mana = this.#manaMaxima;
        }
        console.log(`${this.nome} meditou e recuperou mana. Mana atual: ${this.#mana}/${this.#manaMaxima}.`);
    }

    atacar(alvo) {
        if (this.#mana < 10) {
            throw new Error("Mana insuficiente para atacar.");
        }
        this.#mana -= 10;
        const dano = this.forca * 1.5;
        console.log(`${this.nome} lança magia em ${alvo.nome} causando ${dano} de dano mágico!`);
        alvo.receberDano(dano);
    }
}