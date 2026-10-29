"use client";

import { useEffect } from "react";

/* =====================================================================
   IDIOMA DO DOCUMENTO · o <html lang> das páginas do pós-pagamento
   ---------------------------------------------------------------------
   O <html lang> vive no layout raiz (app/layout.tsx), que é servidor, é
   o mesmo para o site todo ("pt-BR") e não conhece a rota. As páginas de
   obrigado e o /baixar já mandam o idioma certo no <main lang> do HTML
   do servidor (components/PosPagamento.tsx, Moldura); aqui o elemento
   raiz é sincronizado na hidratação, como as homes fazem
   (components/Home.tsx): leitor de tela, tradutor do navegador e
   buscador leem o idioma do <html>, não só o de um elemento interno.
   ===================================================================== */

export function IdiomaDoDocumento({ lang }: { lang: string }) {
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return null;
}
