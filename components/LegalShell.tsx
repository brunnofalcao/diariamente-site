import { SITE, EMPRESA } from "@/config";
import { Wordmark } from "@/components/Brand";
import type { Lang } from "@/lib/i18n";
import { caminho } from "@/lib/rotas";

/* Shell das páginas legais, agora ciente do idioma.
   O "Voltar" e o logotipo levam para a home DO MESMO IDIOMA: um leitor
   espanhol que clica em voltar não pode cair no site em português.

   A identificação completa da titular (razão social, CNPJ, endereço e
   contatos, Decreto 7.962/2013, art. 2º) mora no CORPO dos Termos e da
   Política, na seção 1 de cada um (components/Titularidade.tsx). O
   rodapé daqui mostra só a assinatura, como o resto do site. */

const T = {
  pt: { voltar: "← Voltar", atualizado: "Última atualização:" },
  es: { voltar: "← Volver", atualizado: "Última actualización:" },
};

export function LegalShell({
  titulo,
  atualizado,
  lang = "pt",
  children,
}: {
  titulo: string;
  atualizado: string;
  lang?: Lang;
  children: React.ReactNode;
}) {
  const t = T[lang];
  const home = caminho("home", lang);

  return (
    <main>
      <header style={{ paddingTop: "var(--sp6)" }}>
        <div className="wrap" style={{ display: "flex", justifyContent: "center" }}>
          <a href={home} style={{ textDecoration: "none" }}><Wordmark /></a>
        </div>
      </header>

      <section style={{ paddingTop: "var(--sp10)" }}>
        <div className="wrap">
          <a href={home} className="caption teal" style={{ textDecoration: "none" }}>{t.voltar}</a>
          <h1 className="display-md" style={{ margin: "var(--sp4) 0 var(--sp2)" }}>{titulo}</h1>
          <p className="caption">{t.atualizado} {atualizado}</p>
          <div className="divider" />

          <div className="legal-body stack">{children}</div>

        </div>
      </section>

      <footer style={{ borderTop: "1px solid var(--border)", marginTop: "var(--sp12)", padding: "var(--sp10) 0" }}>
        <div className="wrap center">
          <p className="caption" style={{ color: "var(--n-600)" }}>
            © {new Date().getFullYear()} {EMPRESA.assinatura} · {SITE.dominio.replace("https://", "")}
          </p>
        </div>
      </footer>
    </main>
  );
}
