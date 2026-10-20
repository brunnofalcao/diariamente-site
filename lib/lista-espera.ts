/* =====================================================================
   LISTA DE ESPERA · mercado, idioma e país, sem quebrar sem as colunas
   ---------------------------------------------------------------------
   A lista grava mercado (br, la, es, pt, rw), idioma (pt, es) e país do
   IP. As três colunas novas em lista_espera são criadas pela frente do
   app (E33). Até lá, o banco recusa a linha com "coluna não existe", e o
   lead NÃO pode se perder por isso: a gravação tenta com as colunas
   novas e, se o erro for exatamente de coluna ausente, grava de novo sem
   elas. Mercado e idioma continuam indo para o RD como tag.

   Sem dependência do Next nem do Supabase: recebe a função que grava,
   para o teste usar um dublê em memória (test/lista-espera.test.js).
   ===================================================================== */

export const COLUNAS_NOVAS = ["mercado", "idioma", "pais"] as const;
export type ColunaNova = (typeof COLUNAS_NOVAS)[number];
export type Extras = Partial<Record<ColunaNova, string | null>>;

type Erro = { code?: string; message?: string } | null | undefined;
type Resposta = { data: unknown; error: Erro };

/**
 * O erro é de coluna que não existe (e só isso)? PostgREST responde
 * PGRST204 ("Could not find the 'mercado' column ... in the schema
 * cache"); o Postgres direto, 42703 ("column ... does not exist").
 */
export function faltaColuna(erro: Erro): boolean {
  if (!erro) return false;
  const msg = String(erro.message || "");
  if (erro.code === "PGRST204" || erro.code === "42703") return true;
  return /column/i.test(msg) && COLUNAS_NOVAS.some((c) => msg.includes(`'${c}'`) || msg.includes(`"${c}"`));
}

/**
 * Grava `lead` com as colunas novas; se o banco ainda não as tiver, grava
 * sem elas. Qualquer outro erro sobe (a rota cai na rede de segurança do
 * RD, como antes). Devolve se a linha é nova e se as colunas ficaram de fora.
 */
export async function gravarTolerante(
  gravar: (linha: Record<string, unknown>) => Promise<Resposta>,
  lead: Record<string, unknown>,
  extras: Extras
): Promise<{ novo: boolean; semColunasNovas: boolean }> {
  const preenchidos = Object.fromEntries(Object.entries(extras).filter(([, v]) => v != null && v !== ""));
  const comExtras = Object.keys(preenchidos).length > 0;

  const primeira = await gravar(comExtras ? { ...lead, ...preenchidos } : lead);
  if (!primeira.error) {
    return { novo: Array.isArray(primeira.data) && primeira.data.length > 0, semColunasNovas: false };
  }
  if (!comExtras || !faltaColuna(primeira.error)) throw primeira.error;

  const segunda = await gravar(lead);
  if (segunda.error) throw segunda.error;
  return { novo: Array.isArray(segunda.data) && segunda.data.length > 0, semColunasNovas: true };
}
