import { SITE, EMPRESA } from "@/config";
import { Wordmark } from "@/components/Brand";

export function LegalShell({
  titulo,
  atualizado,
  children,
}: {
  titulo: string;
  atualizado: string;
  children: React.ReactNode;
}) {
  return (
    <main>
      <header style={{ paddingTop: "var(--sp6)" }}>
        <div className="wrap" style={{ display: "flex", justifyContent: "center" }}>
          <a href="/" style={{ textDecoration: "none" }}><Wordmark /></a>
        </div>
      </header>

      <section style={{ paddingTop: "var(--sp10)" }}>
        <div className="wrap">
          <a href="/" className="caption teal" style={{ textDecoration: "none" }}>← Voltar</a>
          <h1 className="display-md" style={{ margin: "var(--sp4) 0 var(--sp2)" }}>{titulo}</h1>
          <p className="caption">Última atualização: {atualizado}</p>
          <div className="divider" />

          <div className="legal-body stack">{children}</div>

          <div className="divider" />
          <p className="caption muted">
            {EMPRESA.marca} · {EMPRESA.razaoSocial} · CNPJ {EMPRESA.cnpj} ·{" "}
            <a href={`mailto:${EMPRESA.suporteEmail}`} className="teal">{EMPRESA.suporteEmail}</a>
          </p>
        </div>
      </section>

      <footer style={{ borderTop: "1px solid var(--border)", marginTop: "var(--sp12)", padding: "var(--sp10) 0" }}>
        <div className="wrap center">
          <p className="caption" style={{ color: "var(--n-600)" }}>
            © {new Date().getFullYear()} {EMPRESA.marca}® · {SITE.dominio.replace("https://", "")}
          </p>
        </div>
      </footer>
    </main>
  );
}
