// compilar.mjs · roda o compilador (léxico → sintático → semântico → gerador)
// em todos os programas .txt desta pasta e grava o .svg (ou o .erro.txt).
// Uso: node testes/compilar.mjs
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { analisarLexico } from "../lexer.js";
import { analisarSintatico } from "../parser.js";
import { verificar } from "../semantica.js";
import { gerarSVG } from "../gerador.js";

const pasta = new URL(".", import.meta.url).pathname;
for (const nome of readdirSync(pasta).filter((n) => n.endsWith(".txt") && !n.endsWith(".erro.txt"))) {
    const texto = readFileSync(pasta + nome, "utf8");
    const base = pasta + nome.replace(/\.txt$/, "");
    const lex = analisarLexico(texto);
    if (lex.erros.length > 0) {
        console.log(nome, "ERRO LÉXICO", lex.erros);
        continue;
    }
    const ast = analisarSintatico(lex.tokens);
    const erros = verificar(ast);
    if (erros.length > 0) {
        const msgs = erros.map((e) => "Erro semântico: linha " + e.linha + ": " + e.mensagem);
        writeFileSync(base + ".erro.txt", msgs.join("\n") + "\n");
        console.log(nome, "\n  " + msgs.join("\n  "));
        continue;
    }
    writeFileSync(base + ".svg", gerarSVG(ast) + "\n");
    console.log(nome, "→ SVG gerado");
}
