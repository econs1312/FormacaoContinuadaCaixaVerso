# Resumo de `RPG/src/personagem.js`

Este arquivo define a classe base **`Personagem`** para um sistema de RPG, implementando princípios fundamentais de programação orientada a objetos:

## Campos Privados (Encapsulamento)

Utiliza campos privados do JavaScript para proteger o estado interno:

```javascript
#nome;
#vida;
#vidaMaxima;
#nivel;
#forca;
```

Expõe getters de somente leitura para acesso seguro aos atributos:

```javascript
get nome() { return this.#nome; }
get vida() { return this.#vida; }
get vidaMaxima() { return this.#vidaMaxima; }
get nivel() { return this.#nivel; }
get forca() { return this.#forca; }
get estaVivo() { return this.#vida > 0; }
```

## Validação

O setter `nome` valida se os nomes não estão vazios antes de atribuir:

```javascript
set nome(novoNome) {
    if (!novoNome || novoNome.trim() === "") {
        throw new Error("O nome não pode ser vazio.");
    }
    this.#nome = novoNome.trim();
}
```

## Construtor

Recebe `nome`, `vidaMaxima` e `forca` como parâmetros, inicializando a saúde no máximo e nível em 1:

```javascript
constructor(nome, vidaMaxima, forca) {
    this.nome = nome; // Chama o setter para validação
    this.#vidaMaxima = vidaMaxima;
    this.#vida = vidaMaxima;
    this.#forca = forca;
    this.#nivel = 1;
}
```

## Métodos Principais

**Ataque e Dano:**
```javascript
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
```

**Cura:**
```javascript
curar(quantidade) {
    this.#vida += quantidade;
    if (this.#vida > this.#vidaMaxima) {
        this.#vida = this.#vidaMaxima;
    }
}
```

**Progressão:**
```javascript
subirNivel() {
    this.#nivel += 1;
    this.#vidaMaxima += 10; // Exemplo de incremento proporcional
    this.#forca += 2;
    this.#vida = this.#vidaMaxima;
}
```

**Exibição de Status:**
```javascript
exibirStatus() {
    console.log(`[${this.constructor.name}] ${this.#nome} - Nível: ${this.#nivel} | Vida: ${this.#vida}/${this.#vidaMaxima} | Força: ${this.#forca}`);
}
```

## Conclusão

Esta é a **classe pai** projetada para ser estendida por classes de personagens especializados (como Guerreiro, Mago, Arqueiro), com subclasses sobrescrevendo o método `atacar()` para comportamento polimórfico.
