import { createHash, timingSafeEqual } from "node:crypto";

/* =====================================================================
   COMPARAÇÃO DE SEGREDO EM TEMPO CONSTANTE
   ---------------------------------------------------------------------
   `a === b` para de comparar no primeiro caractere diferente. Medindo o
   tempo de resposta, dá para descobrir um segredo caractere por
   caractere. timingSafeEqual sempre percorre tudo, mas exige buffers do
   mesmo tamanho (e lança erro se não forem). Por isso os dois lados
   passam antes por SHA-256: os dois viram 32 bytes, e nem o tamanho do
   segredo vaza.

   Uso só no servidor (rotas com runtime nodejs). O middleware roda no
   edge e não deve importar este arquivo.
   ===================================================================== */

/**
 * true só quando `recebido` é exatamente igual a `esperado`.
 * Sem segredo configurado, recusa sempre: a rota fica fechada, nunca aberta.
 */
export function segredoConfere(recebido, esperado) {
  if (typeof esperado !== "string" || esperado.length === 0) return false;
  if (typeof recebido !== "string") return false;
  const a = createHash("sha256").update(recebido, "utf8").digest();
  const b = createHash("sha256").update(esperado, "utf8").digest();
  return timingSafeEqual(a, b);
}
