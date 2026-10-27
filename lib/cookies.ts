/* =====================================================================
   ESCOLHA DE COOKIES (aviso com Aceitar e Recusar)
   ---------------------------------------------------------------------
   Fonte única do que o aviso grava e de como se lê a escolha. Quem usa:
     components/Consentimento.tsx    aviso + monta GA4 e Pixel só no aceite
     components/PurchaseTracking.tsx Purchase só no aceite
     components/RevisarCookies.tsx   botão "rever minha escolha" na política
     lib/medicao.ts                  eventos de clique (InitiateCheckout)

   A Política de Privacidade (seção 8, pt e es) descreve exatamente isto:
   nome do cookie, prazo e o que liga. Se mudar aqui, mude lá.

   Regras:
   - Sem escolha gravada, NADA de medição carrega (opt-in, LGPD art. 7º I
     e 8º; RGPD art. 6(1)(a) e diretiva ePrivacy art. 5(3)).
   - Recusar vale tanto quanto Aceitar e também fica gravado, para o aviso
     não voltar a cada página.
   - A escolha vale 6 meses. Depois, o aviso aparece de novo.
   - VERSAO_AVISO sobe quando a lista de ferramentas ou o texto do aviso
     mudar: a escolha antiga deixa de valer e a pessoa decide de novo.
   ===================================================================== */

export type Escolha = "aceito" | "recusado";

export const COOKIE_ESCOLHA = "dm_cookies";
export const VERSAO_AVISO = "1";
/** 6 meses, em segundos (182 dias). */
export const SEIS_MESES = 60 * 60 * 24 * 182;

/** Cookies que o GA4 e o Pixel da Meta gravam neste domínio. */
const COOKIES_DE_MEDICAO = /^(_ga|_gid|_gat|_fbp|_fbc)/;

/** Escolha gravada neste navegador, ou null se ainda não houve (ou venceu). */
export function lerEscolha(): Escolha | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|;\s*)dm_cookies=([^;]*)/);
  if (!m) return null;
  let valor = m[1];
  try {
    valor = decodeURIComponent(valor);
  } catch {
    return null;
  }
  const [versao, escolha] = valor.split(".");
  if (versao !== VERSAO_AVISO) return null;
  return escolha === "aceito" || escolha === "recusado" ? escolha : null;
}

export function gravarEscolha(escolha: Escolha): void {
  if (typeof document === "undefined") return;
  const seguro = location.protocol === "https:" ? ";secure" : "";
  document.cookie = `${COOKIE_ESCOLHA}=${VERSAO_AVISO}.${escolha};path=/;max-age=${SEIS_MESES};samesite=lax${seguro}`;
}

export function apagarEscolha(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_ESCOLHA}=;path=/;max-age=0;samesite=lax`;
}

/**
 * Apaga os cookies de medição que este site consegue alcançar. O GA4 e o
 * Pixel gravam no domínio "pai" (.diariamente.app), por isso a remoção é
 * tentada no próprio host e em cada domínio acima dele.
 */
export function apagarCookiesDeMedicao(): void {
  if (typeof document === "undefined") return;
  const nomes = document.cookie
    .split(";")
    .map((c) => c.split("=")[0].trim())
    .filter((n) => COOKIES_DE_MEDICAO.test(n));
  const partes = location.hostname.split(".");
  const dominios: string[] = [""];
  for (let i = 0; i < partes.length - 1; i++) dominios.push(partes.slice(i).join("."));
  for (const nome of nomes) {
    for (const d of dominios) {
      document.cookie = `${nome}=;path=/;max-age=0${d ? `;domain=${d}` : ""}`;
    }
  }
}
