"use client";

import { useEffect, useState } from "react";
import { apagarCookiesDeMedicao, apagarEscolha, lerEscolha, type Escolha } from "@/lib/cookies";
import type { Lang } from "@/lib/i18n";

/* Botão da Política de Privacidade (seção 8) para mudar de ideia sobre os
   cookies. Apaga a escolha e os cookies de medição deste site e recarrega
   a página: o aviso volta, e nada de medição carrega até uma nova escolha.
   Recarregar é o que garante que GA4 e Pixel já carregados saiam da página. */

const TEXTO: Record<Lang, { atual: string; aceito: string; recusado: string; nenhuma: string; botao: string }> = {
  pt: {
    atual: "Sua escolha neste navegador:",
    aceito: "você aceitou.",
    recusado: "você recusou.",
    nenhuma: "você ainda não escolheu.",
    botao: "Rever minha escolha de cookies",
  },
  es: {
    atual: "Tu elección en este navegador:",
    aceito: "aceptaste.",
    recusado: "rechazaste.",
    nenhuma: "todavía no elegiste.",
    botao: "Revisar mi elección de cookies",
  },
};

export function RevisarCookies({ lang }: { lang: Lang }) {
  const t = TEXTO[lang];
  // undefined até ler o cookie no navegador (o servidor não sabe a escolha).
  const [escolha, setEscolha] = useState<Escolha | null | undefined>(undefined);

  useEffect(() => {
    setEscolha(lerEscolha());
  }, []);

  const rever = () => {
    apagarEscolha();
    apagarCookiesDeMedicao();
    window.location.reload();
  };

  return (
    <p>
      {escolha !== undefined && (
        <>
          {t.atual} {escolha === "aceito" ? t.aceito : escolha === "recusado" ? t.recusado : t.nenhuma}
          <br />
        </>
      )}
      <button type="button" className="btn btn-dark" onClick={rever} style={{ marginTop: "var(--sp3)" }}>
        {t.botao}
      </button>
    </p>
  );
}
