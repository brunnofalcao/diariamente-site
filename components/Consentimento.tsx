"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Tracking } from "@/components/Tracking";
import { caminho } from "@/lib/rotas";
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
   ===================================================================== */

type Estado = Escolha | "pendente" | "carregando";

const ContextoConsentimento = createContext<Estado>("carregando");

/** Estado atual do consentimento. Só "aceito" libera medição. */
export function useConsentimento(): Estado {
  return useContext(ContextoConsentimento);
}

export function Consentimento({ children }: { children: React.ReactNode }) {
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

  return (
    <ContextoConsentimento.Provider value={estado}>
      {estado === "aceito" && <Tracking />}
      {children}
      {estado === "pendente" && <AvisoCookies onEscolha={escolher} />}
    </ContextoConsentimento.Provider>
  );
}

const TEXTO: Record<Lang, { titulo: string; texto: string; politica: string; recusar: string; aceitar: string }> = {
  pt: {
    titulo: "Cookies",
    texto:
      "Usamos cookies de medição e publicidade (Google Analytics e Pixel da Meta) para entender as visitas ao site e medir os anúncios. Eles só são ligados se você aceitar.",
    politica: "Saiba mais na Política de Privacidade",
    recusar: "Recusar",
    aceitar: "Aceitar",
  },
  es: {
    titulo: "Cookies",
    texto:
      "Usamos cookies de medición y publicidad (Google Analytics y Píxel de Meta) para entender las visitas al sitio y medir los anuncios. Solo se activan si aceptas.",
    politica: "Más información en la Política de Privacidad",
    recusar: "Rechazar",
    aceitar: "Aceptar",
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
.dm-ck-espaco{height:200px}
@media (min-width:640px){.dm-ck-espaco{height:120px}}
@media (max-width:560px){.dm-ck{padding:14px 16px}.dm-ck-acoes{width:100%}.dm-ck button{flex:1;min-width:0}}
@media (prefers-reduced-motion:reduce){.dm-ck button{transition:none}}
`;

/** "/es" e "/es/..." são espanhol. "/estudante" NÃO é (por isso não basta startsWith("/es")). */
function idiomaDaRota(pathname: string | null): Lang {
  const p = pathname ?? "/";
  return p === "/es" || p.startsWith("/es/") ? "es" : "pt";
}

function AvisoCookies({ onEscolha }: { onEscolha: (e: Escolha) => void }) {
  const lang = idiomaDaRota(usePathname());
  const t = TEXTO[lang];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      {/* Espaço no fim da página para o rodapé não ficar escondido atrás do aviso. */}
      <div className="dm-ck-espaco" aria-hidden="true" />
      <div className="dm-ck" role="region" aria-labelledby="dm-ck-titulo" lang={lang === "es" ? "es" : "pt-BR"}>
        <div className="dm-ck-corpo">
          <p id="dm-ck-titulo" className="dm-ck-t">{t.titulo}</p>
          <p className="dm-ck-x">
            {t.texto} <a href={caminho("privacidade", lang)}>{t.politica}</a>.
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
