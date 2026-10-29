"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Tracking } from "@/components/Tracking";
import { caminho } from "@/lib/rotas";
import { ehVitrine } from "@/lib/mercado";
import { LANG_HTML, ehPosPagamento, localDoPosPagamento } from "@/lib/obrigado.mjs";
import { SITE_LANCADO } from "@/config/lancamento";
import { apagarCookiesDeMedicao, gravarEscolha, lerEscolha, type Escolha } from "@/lib/cookies";
import type { Lang } from "@/lib/i18n";

/* =====================================================================
   CONSENTIMENTO DE COOKIES
   ---------------------------------------------------------------------
   Envolve todas as páginas (app/layout.tsx). Três estados depois que a
   página abre no navegador:

     pendente   sem escolha gravada: mostra o aviso, NÃO carrega nada
     recusado   não carrega nada, em nenhuma página, e o aviso some
     aceito     monta o <Tracking /> (GA4 e Pixel) e libera o Purchase

   No servidor e no primeiro desenho do navegador o estado é "carregando":
   nada de medição vai no HTML, e o aviso só aparece depois de ler o
   cookie (sem diferença entre servidor e navegador na hidratação).

   O <Tracking /> vem ANTES das páginas na árvore de propósito: o React
   roda os efeitos na ordem da árvore, então o fbq e o gtag já existem
   quando o PurchaseTracking da página de obrigado dispara.

   O aviso não é modal: não escurece a página, não prende o foco e não
   impede rolar, ler ou clicar. Recusar e Aceitar têm o mesmo tamanho e
   ficam lado a lado.

   No celular (até 560 px) o aviso é COMPACTO, com cerca de 115 px de
   altura: sem o título, com o texto curto (TEXTO.curto, que ainda diz
   quem mede e que só liga se a pessoa aceitar, com o link da Política) e
   botões de 40 px. O aviso inteiro, com ~214 px no iPhone de 390 x 664,
   cobria o "Quero meu acesso" da home e o "Instalar no iPhone" da página
   de pagamento aprovado logo na primeira tela (revisão de 28/10/2026).
   No computador, o aviso de sempre.

   STANDBY (config/lancamento.ts): fora da vitrine, o site fica como a
   produção de hoje, sem aviso e com GA4 e Pixel montados direto (o
   contexto vale "aceito"). O aviso só aparece na vitrine (/vendas,
   /es/vendas, /es-es/vendas, /pt-pt/vendas, /mundo/vendas;
   lib/mercado.ts, ehVitrine), como vai ao ar. Ligada a chave, vale o
   aviso em todas as páginas. Decisão de Meta e Analytics fica para
   depois do lançamento (dono, 27/10/2026).

   PÓS-PAGAMENTO EM STANDBY (as 14 rotas de obrigado e do /baixar e o
   /obrigado antigo; lib/obrigado.mjs, ehPosPagamento): quem paga vem da
   vitrine, onde pode ter clicado em Recusar. Por isso, aqui, nada de
   medição no HTML do servidor: a página lê a escolha gravada (dm_cookies)
   primeiro. Recusou: nem GA4, nem Pixel, nem Purchase. Aceitou ou não
   escolheu: monta como a produção de hoje, sem aviso, e o Purchase sai.
   Pedido do dono, 28/10/2026.

   IDIOMA DO AVISO: o da rota (pt ou es, idiomaDaRota). Nas páginas de
   obrigado, o do local da página (lib/obrigado.mjs, localDoPosPagamento),
   que inclui o pt-PT (/pt-pt/obrigado-*, sem o "você" do pt-BR) e o
   inglês (/en/thank-you-*). A Política de Privacidade só existe em
   português e em espanhol: o pt-PT leva à em português, e o inglês
   também, dizendo no rótulo do link que ela está em português.

   Acessibilidade de um aviso fixo no rodapé da tela:
   - Ele vem ANTES da página no documento (mesmo aparecendo embaixo): quem
     navega por teclado ou leitor de tela encontra o aviso primeiro, e não
     depois de passar por todos os links da home. Depois do clique, o foco
     volta para o começo da página, que é onde o aviso estava.
   - Enquanto ele está na tela, o html ganha scroll-padding-bottom da
     altura medida do aviso (técnica C43 da WCAG para o critério 2.4.11):
     o link ou botão que recebe foco pelo Tab rola para cima do aviso, em
     vez de ficar escondido atrás dele. O espaço no fim da página usa a
     mesma altura, para o rodapé inteiro aparecer acima do aviso.
   ===================================================================== */

type Estado = Escolha | "pendente" | "carregando";

const ContextoConsentimento = createContext<Estado>("carregando");

/** Estado atual do consentimento. Só "aceito" libera medição. */
export function useConsentimento(): Estado {
  return useContext(ContextoConsentimento);
}

export function Consentimento({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const comoAProducao = !SITE_LANCADO && !ehVitrine(pathname);
  const [estado, setEstado] = useState<Estado>("carregando");

  useEffect(() => {
    setEstado(lerEscolha() ?? "pendente");
  }, []);

  const escolher = useCallback((escolha: Escolha) => {
    gravarEscolha(escolha);
    // Recusar também limpa _ga, _ga_*, _fbp e _fbc que tenham sobrado de um
    // aceite antigo (escolha vencida ou de versão anterior do aviso). Sem
    // isso, quem recusou ficava com os identificadores de medição gravados.
    if (escolha === "recusado") apagarCookiesDeMedicao();
    setEstado(escolha);
  }, []);

  // Standby, pós-pagamento: espera ler a escolha. Só a recusa gravada
  // segura a medição; sem escolha, vale a produção de hoje ("aceito").
  if (comoAProducao && ehPosPagamento(pathname)) {
    const liberado: Estado = estado === "carregando" || estado === "recusado" ? estado : "aceito";
    return (
      <ContextoConsentimento.Provider value={liberado}>
        {liberado === "aceito" && <Tracking />}
        {children}
      </ContextoConsentimento.Provider>
    );
  }

  if (comoAProducao) {
    return (
      <ContextoConsentimento.Provider value="aceito">
        <Tracking />
        {children}
      </ContextoConsentimento.Provider>
    );
  }

  return (
    <ContextoConsentimento.Provider value={estado}>
      {estado === "aceito" && <Tracking />}
      {estado === "pendente" && <AvisoCookies onEscolha={escolher} />}
      {children}
      {/* Espaço no fim da página para o rodapé não ficar atrás do aviso. */}
      {estado === "pendente" && <div className="dm-ck-espaco" aria-hidden="true" />}
    </ContextoConsentimento.Provider>
  );
}

/** Idiomas do aviso: os das rotas (pt e es) e, nas páginas de obrigado, também pt-pt e en. */
type IdiomaDoAviso = Lang | "pt-pt" | "en";

const TEXTO: Record<IdiomaDoAviso, { titulo: string; texto: string; politica: string; curto: string; politicaCurta: string; recusar: string; aceitar: string }> = {
  pt: {
    titulo: "Cookies",
    texto:
      "Usamos cookies de medição e publicidade (Google Analytics e Pixel da Meta) para entender as visitas ao site e medir os anúncios. Eles só são ligados se você aceitar.",
    politica: "Saiba mais na Política de Privacidade",
    // Celular: duas linhas, com quem mede e a condição (só se aceitar).
    curto: "Usamos cookies de medição do Google e da Meta só se você aceitar.",
    politicaCurta: "Saiba mais",
    recusar: "Recusar",
    aceitar: "Aceitar",
  },
  es: {
    titulo: "Cookies",
    texto:
      "Usamos cookies de medición y publicidad (Google Analytics y Píxel de Meta) para entender las visitas al sitio y medir los anuncios. Solo se activan si aceptas.",
    politica: "Más información en la Política de Privacidad",
    curto: "Usamos cookies de medición de Google y Meta solo si aceptas.",
    politicaCurta: "Más información",
    recusar: "Rechazar",
    aceitar: "Aceptar",
  },
  // Português de Portugal: sem o "você" (só nas páginas de obrigado de pt-pt).
  "pt-pt": {
    titulo: "Cookies",
    texto:
      "Usamos cookies de medição e publicidade (Google Analytics e Pixel da Meta) para perceber as visitas ao site e medir os anúncios. Só são ativados se aceitar.",
    politica: "Saiba mais na Política de Privacidade",
    curto: "Usamos cookies de medição do Google e da Meta só se aceitar.",
    politicaCurta: "Saiba mais",
    recusar: "Recusar",
    aceitar: "Aceitar",
  },
  // Inglês (só nas páginas de obrigado de en). A Política existe em
  // português e em espanhol: o link leva à em português e diz isso.
  en: {
    titulo: "Cookies",
    texto:
      "We use measurement and advertising cookies (Google Analytics and Meta Pixel) to understand site visits and measure our ads. They only turn on if you accept.",
    politica: "Learn more in our Privacy Policy (in Portuguese)",
    curto: "We use Google and Meta measurement cookies only if you accept.",
    politicaCurta: "Learn more (in Portuguese)",
    recusar: "Decline",
    aceitar: "Accept",
  },
};

const CSS = `
.dm-ck{position:fixed;z-index:60;left:16px;right:16px;bottom:calc(16px + env(safe-area-inset-bottom));max-width:760px;margin:0 auto;display:flex;flex-wrap:wrap;align-items:center;gap:12px 20px;padding:16px 20px;background:#111616;border:1px solid rgba(255,255,255,.12);border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,.45);font-family:Inter,system-ui,-apple-system,sans-serif;color:#CDD2D2;font-size:14px;line-height:1.55;text-align:left}
.dm-ck-corpo{flex:1 1 320px;min-width:0}
.dm-ck-t{margin:0 0 2px;font-size:14px;font-weight:700;line-height:1.4;color:#fff}
.dm-ck-x{margin:0}
.dm-ck a{color:#27BDBE;text-decoration:underline;text-underline-offset:2px}
.dm-ck a:hover{color:#3DCBCC}
.dm-ck-acoes{display:flex;gap:8px;flex:0 0 auto}
.dm-ck button{height:44px;min-width:112px;padding:0 20px;border-radius:999px;font-family:inherit;font-size:14px;font-weight:600;cursor:pointer;transition:background .2s,border-color .2s}
.dm-ck-recusar{background:transparent;color:#fff;border:1.5px solid rgba(255,255,255,.32)}
.dm-ck-recusar:hover{background:rgba(255,255,255,.06)}
.dm-ck-aceitar{background:#27BDBE;color:#131918;border:1.5px solid #27BDBE}
.dm-ck-aceitar:hover{background:#3DCBCC;border-color:#3DCBCC}
.dm-ck a:focus-visible,.dm-ck button:focus-visible{outline:2px solid #5DD8D8;outline-offset:2px}
.dm-ck-curto{display:none}
.dm-ck-espaco{height:calc(var(--dm-ck-h,220px) + 32px + env(safe-area-inset-bottom))}
html{scroll-padding-bottom:calc(var(--dm-ck-h,220px) + 32px + env(safe-area-inset-bottom))}
@media (max-width:560px){.dm-ck{left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom));gap:10px;padding:12px 14px;font-size:13.5px;line-height:1.45}.dm-ck-t,.dm-ck-longo{display:none}.dm-ck-curto{display:inline}.dm-ck-acoes{width:100%}.dm-ck button{flex:1;min-width:0;height:40px}}
@media (prefers-reduced-motion:reduce){.dm-ck button{transition:none}}
`;

/** "/es", "/es/...", "/es-es" e "/es-es/..." são espanhol. "/estudante" NÃO é (por isso não basta startsWith("/es")).
    A vitrine em espanhol (/es/vendas e /es-es/vendas) cai nessa regra: o idioma vem primeiro no endereço. */
function idiomaDaRota(pathname: string | null): Lang {
  const p = pathname ?? "/";
  const es = (base: string) => p === base || p.startsWith(base + "/");
  return es("/es") || es("/es-es") ? "es" : "pt";
}

/** O idioma do aviso: o da página de obrigado, se for uma; senão, o da rota. */
function idiomaDoAviso(pathname: string | null): IdiomaDoAviso {
  return localDoPosPagamento(pathname ?? "/") ?? idiomaDaRota(pathname);
}

function AvisoCookies({ onEscolha }: { onEscolha: (e: Escolha) => void }) {
  const idioma = idiomaDoAviso(usePathname());
  const t = TEXTO[idioma];
  // A Política só existe em pt e es: pt-pt e en levam à em português.
  const lang: Lang = idioma === "es" ? "es" : "pt";
  const politica = caminho("privacidade", lang);
  // O link do inglês abre uma página em português: hreflang avisa o leitor de tela.
  const hrefLang = idioma === "en" ? "pt-BR" : undefined;
  const caixa = useRef<HTMLDivElement>(null);

  // Altura real do aviso em --dm-ck-h (o texto quebra em mais ou menos
  // linhas conforme a largura da tela). Usada pelo espaço no fim da página
  // e pelo scroll-padding-bottom. Some junto com o aviso.
  useEffect(() => {
    const el = caixa.current;
    const raiz = document.documentElement;
    if (!el || !raiz || !raiz.style) return;
    const medir = () => {
      const altura = el.offsetHeight;
      if (altura > 0) raiz.style.setProperty("--dm-ck-h", `${altura}px`);
    };
    medir();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(medir) : null;
    ro?.observe(el);
    window.addEventListener("resize", medir);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", medir);
      raiz.style.removeProperty("--dm-ck-h");
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div ref={caixa} className="dm-ck" role="region" aria-labelledby="dm-ck-titulo" lang={LANG_HTML[idioma]}>
        <div className="dm-ck-corpo">
          <p id="dm-ck-titulo" className="dm-ck-t">{t.titulo}</p>
          {/* Um texto por tamanho de tela (o CSS esconde o outro, e o
              escondido sai também do leitor de tela). */}
          <p className="dm-ck-x">
            <span className="dm-ck-longo">
              {t.texto} <a href={politica} hrefLang={hrefLang}>{t.politica}</a>.
            </span>
            <span className="dm-ck-curto">
              {t.curto} <a href={politica} hrefLang={hrefLang}>{t.politicaCurta}</a>.
            </span>
          </p>
        </div>
        <div className="dm-ck-acoes">
          <button type="button" className="dm-ck-recusar" onClick={() => onEscolha("recusado")}>
            {t.recusar}
          </button>
          <button type="button" className="dm-ck-aceitar" onClick={() => onEscolha("aceito")}>
            {t.aceitar}
          </button>
        </div>
      </div>
    </>
  );
}
