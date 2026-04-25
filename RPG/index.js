import { Guerreiro } from './src/Guerreiro.js';
import { Mago } from './src/Mago.js';
import { Arqueiro } from './src/Arqueiro.js';

console.log("--- 1. Criação dos personagens ---");
const thor = new Guerreiro("Thor", 100, 20, 15);
const gandalf = new Mago("Gandalf", 80, 15, 100);
const legolas = new Arqueiro("Legolas", 90, 18, 30);

thor.exibirStatus();
gandalf.exibirStatus();
legolas.exibirStatus();

console.log("\n--- 2. Polimorfismo em ação ---");
const personagens = [thor, gandalf, legolas];
const inimigo = new Guerreiro("Inimigo", 200, 10, 5);

personagens.forEach(p => p.atacar(inimigo));
inimigo.exibirStatus();

console.log("\n--- 3. Métodos herdados sem sobrescrita ---");
thor.curar(30);
gandalf.subirNivel();
legolas.curar(15);
gandalf.exibirStatus();

console.log("\n--- 4. Métodos exclusivos de cada classe ---");
thor.defesa();
gandalf.meditar();
gandalf.lancarCura(thor);
legolas.recarregarFlechas(10);

console.log("\n--- 5. Validações e erros ---");
try {
    while (gandalf.mana >= 10) {
        gandalf.atacar(inimigo);
    }
    gandalf.atacar(inimigo); // Deve lançar o erro aqui
} catch (e) {
    console.log(`[Erro Capturado]: ${e.message}`);
}

try {
    while (legolas.flechas > 0) {
        legolas.atacar(inimigo);
    }
    legolas.atacar(inimigo); // Deve lançar o erro aqui
} catch (e) {
    console.log(`[Erro Capturado]: ${e.message}`);
}

console.log("\n--- 6. Encapsulamento ---");
console.log(`Vida do Thor antes da alteração indevida: ${thor.vida}`);

try {
    thor.vida = 9999; 
} catch (e) {
    console.log(`[Erro Capturado]: Tentativa de alterar propriedade protegida falhou. (${e.message})`);
}

console.log(`Vida do Thor após tentativa de alteração indevida: ${thor.vida}`);