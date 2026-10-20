import type { Metadata } from "next";

/* =====================================================================
   PÁGINA 404
   ---------------------------------------------------------------------
   É a 404 padrão do Next, copiada do componente interno dele
   (HTTPAccessErrorFallback, com os mesmos estilos), para mudar só uma
   coisa: o título da aba.

   No Next 14 o título do 404 vinha antes do título do site no <head>,
   e a aba mostrava "404: This page could not be found.". No Next 16,
   com o React 19, a ordem inverteu e a aba passou a mostrar o título
   do site. O metadata abaixo devolve à aba o texto de antes.

   O status 404 e o noindex continuam a cargo do próprio Next.
   ===================================================================== */

export const metadata: Metadata = {
  title: { absolute: "404: This page could not be found." },
};

const estilo = {
  error: {
    fontFamily:
      'system-ui,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji"',
    height: "100vh",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  desc: { display: "inline-block" },
  h1: {
    display: "inline-block",
    margin: "0 20px 0 0",
    padding: "0 23px 0 0",
    fontSize: 24,
    fontWeight: 500,
    verticalAlign: "top",
    lineHeight: "49px",
  },
  h2: { fontSize: 14, fontWeight: 400, lineHeight: "49px", margin: 0 },
} satisfies Record<string, React.CSSProperties>;

const CSS =
  "body{color:#000;background:#fff;margin:0}.next-error-h1{border-right:1px solid rgba(0,0,0,.3)}@media (prefers-color-scheme:dark){body{color:#fff;background:#000}.next-error-h1{border-right:1px solid rgba(255,255,255,.3)}}";

export default function NotFound() {
  return (
    <div style={estilo.error}>
      <div>
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <h1 className="next-error-h1" style={estilo.h1}>
          404
        </h1>
        <div style={estilo.desc}>
          <h2 style={estilo.h2}>This page could not be found.</h2>
        </div>
      </div>
    </div>
  );
}
