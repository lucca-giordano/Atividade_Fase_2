// tokens.js · a lista de tokens da SUA linguagem (Fase 1)
//
// Cada regra é um objeto com:
//   tipo:    o nome do token (por exemplo, "CIRCULO")
//   padrao:  a expressão regular, SEMPRE com a flag y (por exemplo, /circulo\b/y)
//   ignorar: true para tokens que não vão para a lista (espaços, comentários)
//
// Atenção: a ordem importa quando dois padrões podem casar no mesmo ponto do texto.
//
// Linguagem "Quadro": exemplo de programa
//
//   quadro 400 por 300
//   -- um carro simples
//   retangulo (50, 150) tamanho 200 por 60 [fundo: azul]
//   camada move(70, 190) {
//       circulo (0, 0) raio 25 [fundo: preto]
//       camada gira(45) {
//           reta (0, 0) ate (20, 0) [contorno: branco, espessura: 2]
//       }
//   }

export const regras = [
    // ignorados
    { tipo: "ESPACO",     padrao: /\s+/y,          ignorar: true },
    { tipo: "COMENTARIO", padrao: /--[^\n]*/y,     ignorar: true },   // antes de NUM (por causa do "-")

    // palavras reservadas (retangulo antes de reta; \b evita casar prefixos)
    { tipo: "QUADRO",     padrao: /quadro\b/y },
    { tipo: "RETANGULO",  padrao: /retangulo\b/y },
    { tipo: "RETA",       padrao: /reta\b/y },
    { tipo: "CIRCULO",    padrao: /circulo\b/y },
    { tipo: "CAMADA",     padrao: /camada\b/y },
    { tipo: "TAMANHO",    padrao: /tamanho\b/y },
    { tipo: "POR",        padrao: /por\b/y },
    { tipo: "ATE",        padrao: /ate\b/y },
    { tipo: "RAIO",       padrao: /raio\b/y },
    { tipo: "MOVE",       padrao: /move\b/y },
    { tipo: "GIRA",       padrao: /gira\b/y },

    // propriedades de estilo
    { tipo: "CONTORNO",   padrao: /contorno\b/y },
    { tipo: "FUNDO",      padrao: /fundo\b/y },
    { tipo: "ESPESSURA",  padrao: /espessura\b/y },

    // cores: nomes da linguagem e #RRGGBB
    { tipo: "COR",        padrao: /(?:preto|branco|vermelho|verde|azul|amarelo|laranja|roxo|rosa|marrom|cinza|celeste|dourado|bege|vinho|transparente)\b/y },
    { tipo: "HEX",        padrao: /#[0-9a-fA-F]{6}\b/y },

    // números (inteiros ou decimais, com sinal opcional)
    { tipo: "NUM",        padrao: /-?\d+(?:\.\d+)?/y },

    // símbolos
    { tipo: "ABRE_PAR",   padrao: /\(/y },
    { tipo: "FECHA_PAR",  padrao: /\)/y },
    { tipo: "ABRE_COL",   padrao: /\[/y },
    { tipo: "FECHA_COL",  padrao: /\]/y },
    { tipo: "ABRE_CHAVE", padrao: /\{/y },
    { tipo: "FECHA_CHAVE",padrao: /\}/y },
    { tipo: "VIRGULA",    padrao: /,/y },
    { tipo: "DOIS_PONTOS",padrao: /:/y },
];
