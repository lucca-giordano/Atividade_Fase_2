// gerador.js · gera o texto SVG a partir da AST (Fase 2)
//
//   Recebe:  a AST do programa
//   Devolve: uma string com o SVG completo, começando em <svg ...> e terminando em </svg>
//
// Dica: percorra a AST recursivamente, como o paraMermaid da aula de AST:
// visite o nó, desça nos filhos e monte o texto.

// Tabela de cores: nome na linguagem → cor do SVG. #RRGGBB passa direto.
export const CORES = {
    preto: "black",
    branco: "white",
    vermelho: "red",
    verde: "green",
    azul: "blue",
    amarelo: "yellow",
    laranja: "orange",
    roxo: "purple",
    rosa: "pink",
    marrom: "saddlebrown",
    cinza: "gray",
    celeste: "skyblue",
    dourado: "gold",
    bege: "beige",
    vinho: "darkred",
    transparente: "none",
};

function traduzirCor(cor) {
    if (cor.startsWith("#")) {
        return cor;
    }
    if (!(cor in CORES)) {
        throw new Error("cor sem tradução para SVG: " + cor);
    }
    return CORES[cor];
}

// Aplica os padrões e depois os atributos na ordem escrita (o último vence).
function estiloSVG(estilo) {
    let fill = "none";
    let stroke = "black";
    let strokeWidth = 1;
    for (const a of estilo) {
        if (a.tipo === "Fundo") fill = traduzirCor(a.cor);
        else if (a.tipo === "Contorno") stroke = traduzirCor(a.cor);
        else if (a.tipo === "Espessura") strokeWidth = a.valor;
    }
    return 'fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + strokeWidth + '"';
}

function transformSVG(modificadores) {
    const partes = [];
    for (const m of modificadores) {
        if (m.tipo === "Move") partes.push("translate(" + m.x + " " + m.y + ")");
        else if (m.tipo === "Gira") partes.push("rotate(" + m.angulo + ")");
    }
    return partes.join(" ");
}

// Visita um nó (forma ou camada) e devolve as linhas de SVG, já indentadas.
function gerarNo(no, nivel) {
    const recuo = "  ".repeat(nivel);
    switch (no.tipo) {
        case "Reta":
            return [recuo + '<line x1="' + no.x1 + '" y1="' + no.y1 + '" x2="' + no.x2 + '" y2="' + no.y2 + '" ' + estiloSVG(no.estilo) + "/>"];
        case "Circulo":
            return [recuo + '<circle cx="' + no.cx + '" cy="' + no.cy + '" r="' + no.raio + '" ' + estiloSVG(no.estilo) + "/>"];
        case "Retangulo":
            return [recuo + '<rect x="' + no.x + '" y="' + no.y + '" width="' + no.largura + '" height="' + no.altura + '" ' + estiloSVG(no.estilo) + "/>"];
        case "Camada": {
            // camada sem modificadores vira um <g> simples, sem atributo transform
            const transform = transformSVG(no.modificadores);
            const abre = transform === "" ? "<g>" : '<g transform="' + transform + '">';
            const linhas = [recuo + abre];
            for (const filho of no.comandos) {
                linhas.push(...gerarNo(filho, nivel + 1));      // recursão: grupos aninhados
            }
            linhas.push(recuo + "</g>");
            return linhas;
        }
        default:
            throw new Error("nó desconhecido na AST: " + no.tipo);
    }
}

export function gerarSVG(ast) {
    const L = ast.tela.largura;
    const A = ast.tela.altura;
    const linhas = ['<svg xmlns="http://www.w3.org/2000/svg" width="' + L + '" height="' + A + '" viewBox="0 0 ' + L + " " + A + '">'];
    for (const comando of ast.comandos) {
        linhas.push(...gerarNo(comando, 1));
    }
    linhas.push("</svg>");
    return linhas.join("\n");
}
