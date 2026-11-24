// parser.js · o analisador sintático da SUA linguagem (Fase 1)
//
//   Recebe:  a lista de tokens, já sem erros léxicos: [ { tipo, lexema, linha }, ... ]
//   Devolve: a AST do programa, no formato que VOCÊ definiu
//   Erro sintático: lance um erro com a linha, o que era esperado e o que foi encontrado:
//       throw new Error("Erro sintático na linha 3: esperado NUM, encontrado ABRE");
//
// Dica: use a mesma ideia do tutorial do Robô. Uma função esperar(tipo), uma função
// para cada regra da gramática, e cada função devolve o nó da AST que reconheceu.
//
// Gramática (EBNF) da linguagem "Quadro":
//
//   programa    → tela comando*
//   tela        → QUADRO NUM POR NUM
//   comando     → reta | circulo | retangulo | camada
//   reta        → RETA ponto ATE ponto estilo?
//   circulo     → CIRCULO ponto RAIO NUM estilo?
//   retangulo   → RETANGULO ponto TAMANHO NUM POR NUM estilo?
//   ponto       → ABRE_PAR NUM VIRGULA NUM FECHA_PAR
//   estilo      → ABRE_COL ( atributo ( VIRGULA atributo )* )? FECHA_COL
//   atributo    → CONTORNO DOIS_PONTOS cor
//               | FUNDO DOIS_PONTOS cor
//               | ESPESSURA DOIS_PONTOS NUM
//   cor         → COR | HEX
//   camada      → CAMADA modificador* ABRE_CHAVE comando* FECHA_CHAVE
//   modificador → MOVE ABRE_PAR NUM VIRGULA NUM FECHA_PAR
//               | GIRA ABRE_PAR NUM FECHA_PAR
//
// Formato da AST (todo nó que pode ter erro semântico guarda a "linha" em que começa):
//
//   { tipo: "Programa", tela, comandos: [ ... ] }
//   { tipo: "Tela", largura, altura, linha }
//   { tipo: "Reta", x1, y1, x2, y2, estilo: [ ... ], linha }
//   { tipo: "Circulo", cx, cy, raio, estilo: [ ... ], linha }
//   { tipo: "Retangulo", x, y, largura, altura, estilo: [ ... ], linha }
//   { tipo: "Camada", modificadores: [ ... ], comandos: [ ... ], linha }
//   atributo de estilo:  { tipo: "Contorno" | "Fundo", cor }  ou  { tipo: "Espessura", valor }
//   modificador:         { tipo: "Move", x, y }  ou  { tipo: "Gira", angulo }

export function analisarSintatico(tokens) {
    let pos = 0;

    function atual() {
        return tokens[pos];
    }

    function ultimaLinha() {
        return tokens.length > 0 ? tokens[tokens.length - 1].linha : 1;
    }

    function erro(esperado) {
        const t = atual();
        const linha = t ? t.linha : ultimaLinha();
        const encontrado = t ? t.tipo + ' ("' + t.lexema + '")' : "fim do programa";
        throw new Error("Erro sintático na linha " + linha + ": esperado " + esperado + ", encontrado " + encontrado);
    }

    function verSe(tipo) {
        return atual() !== undefined && atual().tipo === tipo;
    }

    function esperar(tipo) {
        if (!verSe(tipo)) {
            erro(tipo);
        }
        const t = atual();
        pos = pos + 1;
        return t;
    }

    function numero() {
        return Number(esperar("NUM").lexema);
    }

    // programa → tela comando*
    function programa() {
        const t = tela();
        const comandos = [];
        while (atual() !== undefined) {
            comandos.push(comando());
        }
        return { tipo: "Programa", tela: t, comandos };
    }

    // tela → QUADRO NUM POR NUM
    function tela() {
        const linha = esperar("QUADRO").linha;
        const largura = numero();
        esperar("POR");
        const altura = numero();
        return { tipo: "Tela", largura, altura, linha };
    }

    // comando → reta | circulo | retangulo | camada
    function comando() {
        if (verSe("RETA")) return reta();
        if (verSe("CIRCULO")) return circulo();
        if (verSe("RETANGULO")) return retangulo();
        if (verSe("CAMADA")) return camada();
        erro("RETA, CIRCULO, RETANGULO ou CAMADA");
    }

    // ponto → ( NUM , NUM )
    function ponto() {
        esperar("ABRE_PAR");
        const x = numero();
        esperar("VIRGULA");
        const y = numero();
        esperar("FECHA_PAR");
        return { x, y };
    }

    // reta → RETA ponto ATE ponto estilo?
    function reta() {
        const linha = esperar("RETA").linha;
        const p1 = ponto();
        esperar("ATE");
        const p2 = ponto();
        const est = estiloOpcional();
        return { tipo: "Reta", x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, estilo: est, linha };
    }

    // circulo → CIRCULO ponto RAIO NUM estilo?
    function circulo() {
        const linha = esperar("CIRCULO").linha;
        const c = ponto();
        esperar("RAIO");
        const raio = numero();
        const est = estiloOpcional();
        return { tipo: "Circulo", cx: c.x, cy: c.y, raio, estilo: est, linha };
    }

    // retangulo → RETANGULO ponto TAMANHO NUM POR NUM estilo?
    function retangulo() {
        const linha = esperar("RETANGULO").linha;
        const p = ponto();
        esperar("TAMANHO");
        const largura = numero();
        esperar("POR");
        const altura = numero();
        const est = estiloOpcional();
        return { tipo: "Retangulo", x: p.x, y: p.y, largura, altura, estilo: est, linha };
    }

    // estilo → [ ( atributo ( , atributo )* )? ]   (ausente = lista vazia)
    function estiloOpcional() {
        const lista = [];
        if (!verSe("ABRE_COL")) {
            return lista;
        }
        esperar("ABRE_COL");
        if (!verSe("FECHA_COL")) {
            lista.push(atributo());
            while (verSe("VIRGULA")) {
                esperar("VIRGULA");
                lista.push(atributo());
            }
        }
        esperar("FECHA_COL");
        return lista;
    }

    // atributo → CONTORNO : cor | FUNDO : cor | ESPESSURA : NUM
    function atributo() {
        if (verSe("CONTORNO")) {
            esperar("CONTORNO");
            esperar("DOIS_PONTOS");
            return { tipo: "Contorno", cor: cor() };
        }
        if (verSe("FUNDO")) {
            esperar("FUNDO");
            esperar("DOIS_PONTOS");
            return { tipo: "Fundo", cor: cor() };
        }
        if (verSe("ESPESSURA")) {
            esperar("ESPESSURA");
            esperar("DOIS_PONTOS");
            return { tipo: "Espessura", valor: numero() };
        }
        erro("CONTORNO, FUNDO ou ESPESSURA");
    }

    // cor → COR | HEX
    function cor() {
        if (verSe("COR")) return esperar("COR").lexema;
        if (verSe("HEX")) return esperar("HEX").lexema;
        erro("COR ou HEX");
    }

    // camada → CAMADA modificador* { comando* }
    function camada() {
        const linha = esperar("CAMADA").linha;
        const modificadores = [];
        while (verSe("MOVE") || verSe("GIRA")) {
            modificadores.push(modificador());
        }
        esperar("ABRE_CHAVE");
        const comandos = [];
        while (!verSe("FECHA_CHAVE")) {
            if (atual() === undefined) {
                erro("FECHA_CHAVE");
            }
            comandos.push(comando());
        }
        esperar("FECHA_CHAVE");
        return { tipo: "Camada", modificadores, comandos, linha };
    }

    // modificador → MOVE ( NUM , NUM ) | GIRA ( NUM )
    function modificador() {
        if (verSe("MOVE")) {
            esperar("MOVE");
            esperar("ABRE_PAR");
            const x = numero();
            esperar("VIRGULA");
            const y = numero();
            esperar("FECHA_PAR");
            return { tipo: "Move", x, y };
        }
        esperar("GIRA");
        esperar("ABRE_PAR");
        const angulo = numero();
        esperar("FECHA_PAR");
        return { tipo: "Gira", angulo };
    }

    return programa();
}
