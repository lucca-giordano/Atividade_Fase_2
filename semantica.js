// semantica.js · verificações semânticas (Fase 2)
//
//   Recebe:  a AST do programa
//   Devolve: um vetor de erros: [ { linha, mensagem }, ... ]
//            (vetor vazio = nenhum erro encontrado)
//
// As três verificações obrigatórias estão no enunciado da Fase 2.
// Para informar a linha, os nós da AST precisam guardar a linha em que começam.
//
// Decisão: "maior que zero" é verificado com <= 0, então medidas negativas
// (permitidas pela gramática, pois NUM aceita sinal) também são rejeitadas.

export function verificar(ast) {
    const erros = [];

    // tela
    const tela = ast.tela;
    if (tela.largura <= 0 || tela.altura <= 0) {
        erros.push({ linha: tela.linha, mensagem: "a tela precisa ter largura e altura maiores que zero" });
    }

    // percorre todos os comandos, descendo recursivamente nas camadas
    function visitar(no) {
        switch (no.tipo) {
            case "Circulo":
                if (no.raio <= 0) {
                    erros.push({ linha: no.linha, mensagem: "o círculo precisa ter raio maior que zero" });
                }
                break;
            case "Retangulo":
                if (no.largura <= 0 || no.altura <= 0) {
                    erros.push({ linha: no.linha, mensagem: "o retângulo precisa ter largura e altura maiores que zero" });
                }
                break;
            case "Camada":
                for (const filho of no.comandos) {
                    visitar(filho);
                }
                break;
            case "Reta":
                break;          // nenhuma verificação obrigatória para a reta
            default:
                throw new Error("nó desconhecido na AST: " + no.tipo);
        }
    }

    for (const comando of ast.comandos) {
        visitar(comando);
    }

    return erros;
}
